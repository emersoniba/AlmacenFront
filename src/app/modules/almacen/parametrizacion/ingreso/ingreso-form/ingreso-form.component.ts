import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { Almacen, SubAlmacen } from 'src/app/models/almacen.model';
import { Ingreso, IngresoCreate } from 'src/app/models/ingreso.model';
import { Producto } from 'src/app/models/producto.model';
import { Proveedor } from 'src/app/models/proveedor.model';
import { AlmacenService } from 'src/app/services/almacen.service';
import { IngresoService } from 'src/app/services/ingreso.service';
import { ProductoService } from 'src/app/services/producto.service';
import { ProveedorService } from 'src/app/services/proveedor.service';
import { SubAlmacenService } from 'src/app/services/subAlmacen.service';
import { HandleErrorMessage } from 'src/app/utils/handle.errors';
import { SwalAlertService } from 'src/app/utils/util.swal';
import Swal from 'sweetalert2';


@Component({
    selector: 'app-ingreso-form',
    templateUrl: './ingreso-form.component.html',
    styleUrl: './ingreso-form.component.css'
})
export class IngresoFormComponent implements OnInit, OnDestroy {
    public labelForm: string = 'Registrar Ingreso';
    public formRegistro: FormGroup;
    private formSubscription: Subscription | undefined;
    
    // Datos para selects
    public dataAlmacen: Almacen[] = [];
    public dataSubAlmacen: SubAlmacen[] = [];
    public dataProveedor: Proveedor[] = [];
    public dataProductos: Producto[] = [];
    
    public productoSeleccionado: Producto | null = null;
    public modoEdicion: boolean = false;

    constructor(
        private fb: FormBuilder,
        private toastr: ToastrService,
        private ingresoService: IngresoService,
        private almacenService: AlmacenService,
        private subAlmacenService: SubAlmacenService,
        private proveedorService: ProveedorService,
        private productoService: ProductoService,
        private alertService: SwalAlertService,
        @Inject(MAT_DIALOG_DATA) public data: Ingreso,
        public dialogRef: MatDialogRef<IngresoFormComponent>
    ) {
        this.modoEdicion = !!data?.id;
        this.labelForm = this.modoEdicion ? 'Actualizar Ingreso' : 'Registrar Ingreso';
        
        this.formRegistro = this.fb.group({
            id: [''],
            descripcion: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
            comprobante: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
            fecha_ingreso: [new Date().toISOString(), Validators.required],
            proveedor: ['', Validators.required],
            almacen: ['', Validators.required],
            subalmacen: [''],
            detalles: this.fb.array([])
        });
    }

    ngOnInit(): void {
        this.cargarCatalogos();
        
        if (this.modoEdicion && this.data) {
            this.patchFormValues();
        } else {
            // Agregar una fila vacía para nuevo detalle
            this.agregarDetalleFormulario();
        }
    }

    private cargarCatalogos(): void {
        // Cargar almacenes
        this.almacenService.getAlmacenes().subscribe({
            next: (response) => {
                this.dataAlmacen = response;
            },
            error: (err) => {
                this.toastr.error(HandleErrorMessage(err), 'Error');
            }
        });

        // Cargar proveedores
        this.proveedorService.getProveedores().subscribe({
            next: (response) => {
                this.dataProveedor = response;
            },
            error: (err) => {
                this.toastr.error(HandleErrorMessage(err), 'Error');
            }
        });

        // Cargar productos
        this.productoService.getProductos().subscribe({
            next: (response) => {
                this.dataProductos = response;
            },
            error: (err) => {
                this.toastr.error(HandleErrorMessage(err), 'Error');
            }
        });
    }

    private patchFormValues(): void {
        // Solo permitir edición si el ingreso está en estado PENDIENTE
        if (this.data.estado_codigo !== 'PENDIENTE') {
            this.toastr.warning('Solo se pueden editar ingresos pendientes', 'Advertencia');
            this.dialogRef.close(null);
            return;
        }

        this.formRegistro.patchValue({
            id: this.data.id,
            descripcion: this.data.descripcion,
            comprobante: this.data.comprobante,
            fecha_ingreso: this.data.fecha_ingreso,
            proveedor: this.data.proveedor,
            almacen: this.data.almacen,
            subalmacen: this.data.subalmacen
        });

        // Cargar subalmacenes del almacén seleccionado
        if (this.data.almacen) {
            this.cargarSubAlmacenes(this.data.almacen);
        }

        // Cargar detalles existentes
        if (this.data.detalles && this.data.detalles.length > 0) {
            this.data.detalles.forEach(detalle => {
                this.agregarDetalleFormulario(detalle);
            });
        } else {
            this.agregarDetalleFormulario();
        }
    }

    public cargarSubAlmacenes(almacenId: number): void {
        this.subAlmacenService.getSubAlmacenesByAlmacen(almacenId).subscribe({
            next: (response) => {
                this.dataSubAlmacen = response;
            },
            error: (err) => {
                this.toastr.error(HandleErrorMessage(err), 'Error');
            }
        });
    }

    public onAlmacenChange(event: any): void {
        const almacenId = event.value;
        if (almacenId) {
            this.cargarSubAlmacenes(almacenId);
            this.formRegistro.patchValue({ subalmacen: '' });
        } else {
            this.dataSubAlmacen = [];
        }
    }

    public onProductoSeleccionado(event: any): void {
        const productoId = event.value;
        this.productoSeleccionado = this.dataProductos.find(p => p.id === productoId) || null;
    }

    // Obtener el FormArray de detalles
    get detallesArray(): FormArray {
        return this.formRegistro.get('detalles') as FormArray;
    }

    // Agregar un nuevo detalle al formulario
    public agregarDetalleFormulario(detalle?: any): void {
        const detalleGroup = this.fb.group({
            producto: [detalle?.producto || '', Validators.required],
            cantidad: [detalle?.cantidad || 1, [Validators.required, Validators.min(0.01)]],
            precio_unitario: [detalle?.precio_unitario || 0, [Validators.required, Validators.min(0.01)]]
        });
        
        this.detallesArray.push(detalleGroup);
    }

    // Eliminar un detalle del formulario
    public eliminarDetalle(index: number): void {
        this.detallesArray.removeAt(index);
    }

    // Calcular subtotal de un detalle
    public calcularSubtotal(cantidad: number, precio: number): number {
        return cantidad * precio;
    }

    // Calcular total del ingreso
    public calcularTotal(): number {
        let total = 0;
        for (let i = 0; i < this.detallesArray.length; i++) {
            const detalle = this.detallesArray.at(i).value;
            total += detalle.cantidad * detalle.precio_unitario;
        }
        return total;
    }

    public accionRegistrar(): void {
        if (this.formRegistro.invalid) {
            this.formRegistro.markAllAsTouched();
            this.toastr.warning('Complete todos los campos requeridos', 'Validación');
            return;
        }

        if (this.detallesArray.length === 0) {
            this.toastr.warning('Debe agregar al menos un producto', 'Validación');
            return;
        }

        this.alertService.showConfirmationDialog(this.labelForm, '¿Está seguro de realizar esta acción?')
            .then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        title: 'Procesando...',
                        didOpen: () => Swal.showLoading()
                    });

                    const formValue = this.formRegistro.value;
                    
                    const ingresoData: IngresoCreate = {
                        descripcion: formValue.descripcion,
                        comprobante: formValue.comprobante,
                        fecha_ingreso: formValue.fecha_ingreso,
                        proveedor: formValue.proveedor,
                        almacen: formValue.almacen,
                        subalmacen: formValue.subalmacen || null,
                        detalles: formValue.detalles.map((d: any) => ({
                            producto: d.producto,
                            cantidad: d.cantidad,
                            precio_unitario: d.precio_unitario
                        }))
                    };

                    // Si es modo edición, debemos usar los endpoints específicos
                    if (this.modoEdicion) {
                        this.actualizarIngresoExistente(ingresoData);
                    } else {
                        // Crear nuevo ingreso
                        this.formSubscription = this.ingresoService.postIngreso(ingresoData).subscribe({
                            next: (response) => {
                                this.handleSuccess(response);
                            },
                            error: (err) => {
                                this.handleError(err);
                            }
                        });
                    }
                }
            });
    }

    /**
     * Actualizar un ingreso existente (solo funciona con ingresos PENDIENTES)
     * En lugar de PUT/PATCH, se deben usar los endpoints específicos
     */
    private actualizarIngresoExistente(ingresoData: IngresoCreate): void {
        // Nota: Los ingresos no se actualizan directamente en el backend.
        // Para modificar un ingreso pendiente, puedes:
        // 1. Eliminar los detalles existentes y agregar nuevos
        // 2. O anular el ingreso actual y crear uno nuevo
        
        this.alertService.showConfirmationDialog(
            'Modificar Ingreso',
            'Para modificar un ingreso existente, se recomienda anularlo y crear uno nuevo. ¿Desea anular este ingreso y crear uno nuevo?'
        ).then((result) => {
            if (result.isConfirmed) {
                // Anular ingreso actual
                this.ingresoService.anularIngreso(this.data.id, 'Reemplazado por nuevo ingreso').subscribe({
                    next: () => {
                        // Crear nuevo ingreso
                        this.formSubscription = this.ingresoService.postIngreso(ingresoData).subscribe({
                            next: (response) => {
                                this.handleSuccess(response);
                            },
                            error: (err) => {
                                this.handleError(err);
                            }
                        });
                    },
                    error: (err) => {
                        this.handleError(err);
                    }
                });
            } else {
                Swal.close();
            }
        });
    }

    private handleSuccess(response: Ingreso): void {
        Swal.close();
        this.toastr.success('Operación realizada correctamente', 'Éxito');
        this.dialogRef.close(response);
    }

    private handleError(error: any): void {
        Swal.close();
        this.toastr.error(HandleErrorMessage(error), 'Error');
    }

    public accionCancel(): void {
        this.dialogRef.close(null);
    }

    ngOnDestroy(): void {
        this.formSubscription?.unsubscribe();
    }
}