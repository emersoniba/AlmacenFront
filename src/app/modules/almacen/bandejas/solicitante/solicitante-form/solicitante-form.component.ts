import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Almacen } from 'src/app/models/almacen.model';
import { Producto } from 'src/app/models/producto.model';
import { ProductoService } from 'src/app/services/producto.service';
import { AlmacenService } from 'src/app/services/almacen.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Solicitud, SolicitudCreate } from 'src/app/models/solicitud.model';
import { ToastrService } from 'ngx-toastr';
import { MatPaginator } from '@angular/material/paginator';
import { finalize } from 'rxjs';
import { CarritoModalComponent } from '../carrito-modal/carrito-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { ChangeDetectorRef } from '@angular/core';
import Swal from 'sweetalert2';
import { SwalAlertService } from 'src/app/utils/util.swal';
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
        private solicitudService: SolicitudService
    ) {
        this.solicitudForm = new FormGroup({});
    }

    ngOnInit(): void {
        this.cargarAlmacen();
        this.cargarFormulario();
    }

    public cargarFormulario() {
        this.solicitudForm = this.fb.group({
            almacen_id: [null, [Validators.required]],
            buscar: [''],
            objetivo: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1500)]]
        });
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

    public abrirModalCarrito(): void {
        const productosSeleccionados = this.dataProductos.filter(p =>
            p.selected && p.cantidad > 0
        );

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
            .pipe(finalize(() => this.loadingAlmacenes = false))
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
        this.solicitudForm.get('buscar')?.setValue('');

        // Nota: Necesitas crear este método en tu ProductoService
        // Si no existe, usa getProductos() y filtra por almacén
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

    public onActionSolicitar() {
        const productosSeleccionados = this.dataProductos.filter(p => p.selected && p.cantidad > 0);

        if (productosSeleccionados.length === 0) {
            this.toastr.warning('Debe seleccionar al menos un producto', 'Carrito vacío');
            return;
        }

        // Verificar stock
        const productosSinStock = productosSeleccionados.filter(p => p.cantidad > p.stock_total);
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

    private procesarSolicitud(productosSeleccionados: Producto[]) {
        const almacenId = this.solicitudForm.get('almacen_id')?.value;

        // Obtener el subalmacén por defecto para este almacén
        // Puedes modificar esto según tu lógica de negocio
        const subalmacenId = null; // O el ID del subalmacén correspondiente

        const solicitudData: SolicitudCreate = {
            objetivo: this.solicitudForm.get('objetivo')?.value,
            almacen: almacenId,
            subalmacen: subalmacenId,  // Asegurar que se envía
            detalles: productosSeleccionados.map(p => ({
                producto: p.id,
                cantidad_solicitada: p.cantidad
            }))
        };
        Swal.fire({
            title: 'Enviando solicitud...',
            allowEscapeKey: false,
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        this.solicitudService.createSolicitud(solicitudData).subscribe({
            next: (response) => {
                Swal.close();
                this.alertService.solicitudExitosa(
                    '¡Solicitud Enviada!',
                    'Tu solicitud ha sido enviada para aprobación exitosamente.'
                );
                this.limpiarFormulario();
                // Opcional: cerrar el modal si está abierto
                if (this.dialog.openDialogs.length > 0) {
                    this.dialog.closeAll();
                }
            },
            error: (error) => {
                Swal.close();
                console.error('Error al enviar solicitud:', error);
                this.alertService.solicitudError(
                    'Error al enviar',
                    error.error?.message || 'Ocurrió un error al enviar la solicitud. Por favor, intenta nuevamente.'
                );
            }
        });
    }

    private limpiarFormulario() {
        this.solicitudForm.reset();
        // Limpiar carrito
        this.dataProductos.forEach(p => {
            p.selected = false;
            p.cantidad = 0;
        });
        this.dataProductosOrigen.forEach(p => {
            p.selected = false;
            p.cantidad = 0;
        });
        this.dataProductosFiltrados.forEach(p => {
            p.selected = false;
            p.cantidad = 0;
        });
        this.dataProductosPaginados.forEach(p => {
            p.selected = false;
            p.cantidad = 0;
        });
    }

    public incrementarCantidad(index: number) {
        const productoPagina = this.dataProductosPaginados[index];
        const stock = productoPagina.stock_total;

        if (productoPagina.cantidad < stock) {
            productoPagina.cantidad++;
            this.sincronizarCantidadProducto(productoPagina.id, productoPagina.cantidad);
            this.cdRef.detectChanges();
        }
    }

    public decrementarCantidad(index: number) {
        const productoPagina = this.dataProductosPaginados[index];

        if (productoPagina.cantidad > 0) {
            productoPagina.cantidad--;
            this.sincronizarCantidadProducto(productoPagina.id, productoPagina.cantidad);
            this.cdRef.detectChanges();
        }

        // Si la cantidad llega a 0, marcar como no seleccionado
        if (productoPagina.cantidad === 0 && productoPagina.selected) {
            productoPagina.selected = false;
            this.sincronizarSeleccionProducto(productoPagina.id, false);
        }
    }

    private sincronizarCantidadProducto(productoId: number, cantidad: number) {
        // Sincronizar en todos los arrays
        this.dataProductos = this.dataProductos.map(p =>
            p.id === productoId ? { ...p, cantidad } : p
        );
        this.dataProductosOrigen = this.dataProductosOrigen.map(p =>
            p.id === productoId ? { ...p, cantidad } : p
        );
        this.dataProductosFiltrados = this.dataProductosFiltrados.map(p =>
            p.id === productoId ? { ...p, cantidad } : p
        );
        this.dataProductosPaginados = this.dataProductosPaginados.map(p =>
            p.id === productoId ? { ...p, cantidad } : p
        );
    }

    private sincronizarSeleccionProducto(productoId: number, selected: boolean) {
        this.dataProductos = this.dataProductos.map(p =>
            p.id === productoId ? { ...p, selected } : p
        );
        this.dataProductosOrigen = this.dataProductosOrigen.map(p =>
            p.id === productoId ? { ...p, selected } : p
        );
        this.dataProductosFiltrados = this.dataProductosFiltrados.map(p =>
            p.id === productoId ? { ...p, selected } : p
        );
        this.dataProductosPaginados = this.dataProductosPaginados.map(p =>
            p.id === productoId ? { ...p, selected } : p
        );
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
                const prodModificado = this.dataProductos.find(p => p.id === prodOriginal.id);
                return prodModificado ? { ...prodOriginal, selected: prodModificado.selected, cantidad: prodModificado.cantidad } : prodOriginal;
            });
        } else {
            this.dataProductosFiltrados = this.dataProductosOrigen
                .filter(prod =>
                    prod.nombre.toLowerCase().includes(buscar)
                )
                .map(prodOriginal => {
                    const prodModificado = this.dataProductos.find(p => p.id === prodOriginal.id);
                    return prodModificado ? { ...prodOriginal, selected: prodModificado.selected, cantidad: prodModificado.cantidad } : prodOriginal;
                });
        }

        this.actualizarPaginatorData();
    }

    public limpiarBusqueda() {
        this.solicitudForm.get('buscar')?.setValue('');
        this.onActionBuscar();
    }

    public agregarAlCarrito(index: number) {
        const producto = this.dataProductosPaginados[index];
        producto.selected = true;
        producto.cantidad = 1;
        this.sincronizarSeleccionProducto(producto.id, true);
        this.sincronizarCantidadProducto(producto.id, 1);
        this.cdRef.detectChanges();
    }

    public quitarDelCarrito(index: number) {
        const producto = this.dataProductosPaginados[index];
        producto.selected = false;
        producto.cantidad = 0;
        this.sincronizarSeleccionProducto(producto.id, false);
        this.sincronizarCantidadProducto(producto.id, 0);
        this.cdRef.detectChanges();
    }

    ngAfterViewInit(): void {
        if (this.paginator) {
            this.paginator.page.subscribe(() => this.actualizarPaginatorData());
            this.actualizarPaginatorData();
        }
    }

    ngOnDestroy(): void {
        // Limpiar suscripciones si es necesario
    }
}