import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Almacen } from 'src/app/models/almacen.model';
import { Producto } from 'src/app/models/producto.model';
import { ProductoService } from 'src/app/services/producto.service';
import { AlmacenService } from 'src/app/services/almacen.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Solicitud } from 'src/app/models/solicitud.model';
import { ToastrService } from 'ngx-toastr';
import { MatPaginator } from '@angular/material/paginator';
import { finalize } from 'rxjs';
import { CarritoModalComponent } from '../carrito-modal/carrito-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { ChangeDetectorRef } from '@angular/core';
import Swal from 'sweetalert2';
import { SwalAlertService } from 'src/app/utils/util.swal';
import { AprobacionService } from 'src/app/services/aprobacion.service';
import { SolicitudService } from 'src/app/services/solicitud.service';


@Component({
    selector: 'app-solicitante-form',
    templateUrl: './solicitante-form.component.html',
    styleUrl: './solicitante-form.component.css'
})
export class SolicitanteFormComponent implements OnInit, OnDestroy, AfterViewInit {

    @Input() pk: string = '';
    @Input() objeto: Solicitud = {} as Solicitud;

    public pageSize: number = 20;
    public pageSizeOptions: number[] = [20, 40, 100];
    public solicitudForm: FormGroup;
    public productosParaFiltrarForm: FormGroup;
    public dataAlmacen: Almacen[] = [] as Almacen[];
    public dataProductos: Producto[] = [] as Producto[];
    public dataProductosOrigen: Producto[] = [] as Producto[];
    public dataProductosPaginados: Producto[] = [] as Producto[];
    public loadingAlmacenes: boolean = false;
    public loadingProductos: boolean = false;
    public dataProductosFiltrados: Producto[] = [] as Producto[];
    @ViewChild(MatPaginator) paginator!: MatPaginator;

    constructor(
        private fb: FormBuilder,
        private toastr: ToastrService,
        private almacenService: AlmacenService,
        private productoService: ProductoService,
        private dialog: MatDialog,
        private cdRef: ChangeDetectorRef,
        private alertService: SwalAlertService,
        private aprobacionService: AprobacionService,
        private solicitudService: SolicitudService
    ) {
        this.solicitudForm = new FormGroup({});
        this.productosParaFiltrarForm = new FormGroup({});

    }

    ngOnInit(): void {
        this.cargarAlmacen();
        this.cargarFormulario();
    }

    public cargarFormulario() {
        this.solicitudForm = this.fb.group({
            almacen_id: [, [Validators.required,]],
            buscar: [],
            objetivo: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1500)]],
            productos: this.fb.array([])
        });

        this.productosParaFiltrarForm = this.fb.group({
            productosSeleccionados: this.fb.array([])
        });
    }

    get productosFormArray() {
        return this.solicitudForm.controls['productos'] as FormArray;
    }

    get productosParaFiltrarFormAray() {
        return this.productosParaFiltrarForm.controls['productosSeleccionados'] as FormArray;
    }
    public getTotalCarritoItems(): number {
        return this.dataProductos.filter(producto =>
            producto.selected && producto.cantidad > 0
        ).length;
    }

    getTotalCarritoCantidad(): number {
        return this.dataProductos
            .filter(producto => producto.selected && producto.cantidad > 0)
            .reduce((total, producto) => total + (producto.cantidad || 0), 0);
    }

    getControlsProductos() {
        return (this.solicitudForm.get('productos') as FormArray).controls;
    }

    getControlsProductosParaFiltrar() {
        return (this.productosParaFiltrarForm.get('productosSeleccionados') as FormArray).controls;
    }

    public abrirModalCarrito(): void {
        const productosSeleccionados = this.dataProductos.filter(p =>
            p.selected && p.cantidad > 0
        );
        console.log('Productos seleccionados:', productosSeleccionados);
        if (productosSeleccionados.length === 0) {
            this.toastr.info('No hay productos en el carrito', 'Carrito vacío');
            return;
        }
        const dialogRef = this.dialog.open(CarritoModalComponent, {
            width: '800px',
            height: '500px',
            data: {
                productos: productosSeleccionados,
                onSolicitar: () => this.onActionSolicitar()
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result === 'solicitar') {
                this.onActionSolicitar();
            }
        });
    }

    public cargarAlmacen() {
        this.loadingAlmacenes = true;
        this.almacenService.getAlmacenes()
            .pipe(
                finalize(() => this.loadingAlmacenes = false)
            )
            .subscribe({
                next: (almacenes) => {
                    this.dataAlmacen = almacenes;
                },
                error: (error) => {
                    console.error('Error al cargar almacenes:', error);
                    this.toastr.error('No se pudieron cargar los almacenes', 'Error');
                }
            });
    }

    public onChangeAlmacen(e: any) {
        if (e.value) {
            const tieneProductosEnCarrito = this.getTotalCarritoItems() > 0;
            if (tieneProductosEnCarrito) {
                this.alertService.changeAlmacen('Cambio de Almacén', 'Al cambiar de almacén, se vaciará el carrito actual. ¿Deseas continuar?')
                    .then((result) => {
                        if (result.isConfirmed) {
                            this.cargarProductosPorAlmacen(e.value);
                            Swal.fire('¡Almacén cambiado!', 'El carrito ha sido vaciado.', 'success');
                        } else {
                            const almacenAnterior = this.solicitudForm.get('almacen_id').value;
                            this.solicitudForm.get('almacen_id').setValue(almacenAnterior, { emitEvent: false });
                        }
                    });
            } else {
                this.cargarProductosPorAlmacen(e.value);
            }
        }
    }

    public cargarProductosPorAlmacen(almacenId: string) {
        this.loadingProductos = true;
        this.solicitudForm.get('buscar').setValue('');
        this.productoService.getProductosByAlmacen(almacenId)
            .pipe(finalize(() => this.loadingProductos = false))
            .subscribe({
                next: (productos) => {
                    this.dataProductosOrigen = productos.map(p => ({
                        ...p,
                        selected: false,
                        cantidad: 0
                    }));
                    this.dataProductos = [...this.dataProductosOrigen];
                    this.dataProductosFiltrados = [...this.dataProductosOrigen];

                    const itemsProducto = this.solicitudForm.get('productos') as FormArray;
                    itemsProducto.clear();
                    const itemsProductoFiltrar = this.productosParaFiltrarForm.get('productosSeleccionados') as FormArray;
                    itemsProductoFiltrar.clear();

                    this.actualizarPaginatorData();
                },
                error: (error) => {
                    console.error('Error al cargar productos:', error);
                    this.toastr.error('No se pudieron cargar los productos del almacén', 'Error');
                    this.dataProductos = [];
                    this.dataProductosOrigen = [];
                    this.dataProductosFiltrados = [];
                }
            });
    }

    public visualizarProductosParaFiltrar(producto: Producto, tipo: number) {
        let productoForm = this.fb.group({
            id_ui: [producto.id_ui, [Validators.required]],
            nombre: [producto.nombre, [Validators.required]],
            unidad_de_medida: [producto.unidad_de_medida, [Validators.required]],
            stock: [producto.stock, [Validators.required]],
            imagen: [producto.imagen, [Validators.required]],
            id_almacen: [producto.id_almacen, [Validators.required]],
            selected: [producto.selected,],
            almacen: [producto.almacen,],
            cantidad: [producto.cantidad, [Validators.required, Validators.min(0), Validators.max(producto.stock), Validators.pattern(/^[1-9]\d*$/)]]
        });

        if (tipo === 1) {
            this.productosParaFiltrarFormAray.push(productoForm);
        } else {
            this.productosFormArray.push(productoForm);
        }
    }

    public onActionSolicitar() {
        const productosSeleccionados = this.dataProductos.filter(p => p.selected && p.cantidad > 0);

        if (productosSeleccionados.length === 0) {
            this.toastr.warning('Debe seleccionar al menos un producto', 'Carrito vacío');
            return;
        }

        const productosSinStock = productosSeleccionados.filter(p => p.cantidad > p.stock);
        if (productosSinStock.length > 0) {
            const nombresProductos = productosSinStock.map(p => p.nombre).join(', ');
            this.alertService.solicitudError(
                'Stock insuficiente',
                `Los siguientes productos no tienen suficiente stock: ${nombresProductos}`
            );
            return;
        }
        this.alertService.confirmarSolicitud('Confirmar Solicitud', productosSeleccionados)
            .then((result) => {
                if (result.isConfirmed) {
                    this.procesarSolicitud(productosSeleccionados);
                }
            });
    }

    private procesarSolicitud(productosSeleccionados: any[]) {
        const usuario = this.solicitudService.obtenerUsuarioActual();
        const almacenSeleccionado = this.dataAlmacen.find(a => a.id === this.solicitudForm.get('almacen_id').value);

        const aprobacionData = {
            solicitud_id: this.generarIdSolicitud(),
            fecha_solicitud: new Date().toISOString(),
            solicitante: {
                usuario: usuario.usuario,
                cargo: usuario.cargo
            },
            almacen: {
                id: almacenSeleccionado?.id || '',
                nombre: almacenSeleccionado?.nombre || ''
            },
            objetivo: this.solicitudForm.get('objetivo').value,
            productos: productosSeleccionados.map(p => ({
                id_ui: p.id_ui,
                nombre: p.nombre,
                cantidad: p.cantidad,
                unidad_de_medida: p.unidad_de_medida,
                stock_actual: p.stock
            })),
            estado: 'pendiente'
        };

        Swal.fire({
            title: 'Enviando solicitud...',
            allowEscapeKey: false,
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        this.aprobacionService.crearAprobacion(aprobacionData).subscribe({
            next: (response) => {
                Swal.close();
                this.alertService.solicitudExitosa(
                    '¡Solicitud Enviada!',
                    'Tu solicitud ha sido enviada para aprobación exitosamente.'
                );
                this.limpiarFormulario();
            },
            error: (error) => {
                Swal.close();
                console.error('Error al enviar solicitud:', error);
                this.alertService.solicitudError(
                    'Error al enviar',
                    'Ocurrió un error al enviar la solicitud. Por favor, intenta nuevamente.'
                );
            }
        });
    }
   
    private generarIdSolicitud(): string {
        return 'SOL-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    private limpiarFormulario() {
        this.solicitudForm.reset();
        this.dataProductos.forEach(p => {
            p.selected = false;
            p.cantidad = 0;
        });
        const prodArray = this.solicitudForm.get('productos') as FormArray;
        prodArray.clear();
    }

    public tieneErrorCantidad(index: number, errorType: string): boolean {
        const control = this.productosParaFiltrarFormAray.at(index).get('cantidad');
        return control ? control.hasError(errorType) && control.touched : false;
    }

    public onProductSelectionChange(index: number) {
        const productoPagina = this.dataProductosPaginados[index];

        const toggleSelection = (producto: Producto) => {
            producto.selected = !producto.selected;
            producto.cantidad = producto.selected ? 1 : 0;
            const productoEnData = this.dataProductos.find(p => p.id_ui === producto.id_ui);
            if (productoEnData) {
                productoEnData.selected = producto.selected;
                productoEnData.cantidad = producto.cantidad;
            }

            if (producto.selected) {
                const prodArray = this.solicitudForm.get('productos') as FormArray;
                const indexExistente = prodArray.controls.findIndex(control =>
                    control.value.id_ui === producto.id_ui
                );
                if (indexExistente !== -1) {
                    prodArray.removeAt(indexExistente);
                }
                this.visualizarProductosParaFiltrar(producto, 2);
            }
        };

        toggleSelection(productoPagina);
        const productoEnFiltrados = this.dataProductosFiltrados.find(p => p.id_ui === productoPagina.id_ui);
        if (productoEnFiltrados) {
            productoEnFiltrados.selected = productoPagina.selected;
            productoEnFiltrados.cantidad = productoPagina.cantidad;
        }
    }

    public incrementarCantidad(index: number) {
        const productoPagina = this.dataProductosPaginados[index];
        const stock = productoPagina.stock;

        if (productoPagina.cantidad < stock) {
            productoPagina.cantidad++;
            const productoEnData = this.dataProductos.find(p => p.id_ui === productoPagina.id_ui);
            if (productoEnData) {
                productoEnData.cantidad = productoPagina.cantidad;
            }
            const productoEnFiltrados = this.dataProductosFiltrados.find(p => p.id_ui === productoPagina.id_ui);
            if (productoEnFiltrados) {
                productoEnFiltrados.cantidad = productoPagina.cantidad;
            }

            this.cdRef.detectChanges();
        }
    }

    public decrementarCantidad(index: number) {
        const productoPagina = this.dataProductosPaginados[index];

        if (productoPagina.cantidad > 0) {
            productoPagina.cantidad--;
            const productoEnData = this.dataProductos.find(p => p.id_ui === productoPagina.id_ui);
            if (productoEnData) {
                productoEnData.cantidad = productoPagina.cantidad;
            }
            const productoEnFiltrados = this.dataProductosFiltrados.find(p => p.id_ui === productoPagina.id_ui);
            if (productoEnFiltrados) {
                productoEnFiltrados.cantidad = productoPagina.cantidad;
            }

            this.cdRef.detectChanges();
        }
    }

    public actualizarPaginatorData() {
        try {
            let pageIndex: number = 0;
            let startIndex: number = 0;
            let endIndex: number = startIndex + this.pageSize;

            if (this.paginator) {
                pageIndex = this.paginator?.pageIndex;
                startIndex = pageIndex * this.paginator.pageSize;
                endIndex = startIndex + this.paginator.pageSize;
            }

            this.dataProductosPaginados = this.dataProductosFiltrados.slice(startIndex, endIndex);
        } catch (e) {
            console.error('Error en actualizarPaginatorData:', e);
        }
    }

    public onActionBuscar() {
        const buscar: string = this.solicitudForm.get('buscar')?.value?.toLowerCase().trim() || '';

        if (!buscar) {
            this.dataProductosFiltrados = this.dataProductosOrigen.map(prodOriginal => {
                const prodModificado = this.dataProductos.find(p => p.id_ui === prodOriginal.id_ui);
                return prodModificado ? { ...prodOriginal, selected: prodModificado.selected, cantidad: prodModificado.cantidad } : prodOriginal;
            });
        } else {
            this.dataProductosFiltrados = this.dataProductosOrigen
                .filter(prod =>
                    prod.nombre.toLowerCase().includes(buscar)
                )
                .map(prodOriginal => {
                    const prodModificado = this.dataProductos.find(p => p.id_ui === prodOriginal.id_ui);
                    return prodModificado ? { ...prodOriginal, selected: prodModificado.selected, cantidad: prodModificado.cantidad } : prodOriginal;
                });
        }

        this.actualizarPaginatorData();
    }

    public limpiarBusqueda() {
        this.solicitudForm.get('buscar').setValue('');
        this.onActionBuscar();
    }

    public agregarAlCarrito(index: number) {
        const producto = this.dataProductosPaginados[index];
        producto.selected = true;
        producto.cantidad = 1;

        const productoEnData = this.dataProductos.find(p => p.id_ui === producto.id_ui);
        if (productoEnData) {
            productoEnData.selected = true;
            productoEnData.cantidad = 1;
        }

        const productoEnFiltrados = this.dataProductosFiltrados.find(p => p.id_ui === producto.id_ui);
        if (productoEnFiltrados) {
            productoEnFiltrados.selected = true;
            productoEnFiltrados.cantidad = 1;
        }
        this.visualizarProductosParaFiltrar(producto, 2);

        this.cdRef.detectChanges();
    }

    public quitarDelCarrito(index: number) {
        const producto = this.dataProductosPaginados[index];
        producto.selected = false;
        producto.cantidad = 0;
        const productoEnData = this.dataProductos.find(p => p.id_ui === producto.id_ui);
        if (productoEnData) {
            productoEnData.selected = false;
            productoEnData.cantidad = 0;
        }
        const productoEnFiltrados = this.dataProductosFiltrados.find(p => p.id_ui === producto.id_ui);
        if (productoEnFiltrados) {
            productoEnFiltrados.selected = false;
            productoEnFiltrados.cantidad = 0;
        }
        const prodArray = this.solicitudForm.get('productos') as FormArray;
        const indexExistente = prodArray.controls.findIndex(control =>
            control.value.id_ui === producto.id_ui
        );
        if (indexExistente !== -1) {
            prodArray.removeAt(indexExistente);
        }

        this.cdRef.detectChanges();
    }
    ngAfterViewInit(): void {
        if (this.paginator) {
            this.paginator.page.subscribe(() => this.actualizarPaginatorData());
            this.actualizarPaginatorData();
        }
    }

    ngOnDestroy(): void {

    }

}
