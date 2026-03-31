import { Component, OnDestroy, OnInit } from '@angular/core';
import { ColDef, GridApi, GridOptions, PaginationNumberFormatterParams } from 'ag-grid-community';
import { Ingreso } from 'src/app/models/ingreso.model';
import { RendererComponent } from '../../bandejas/abrenderer/renderer.component';
import { localeEs } from 'src/app/app.locale.es.grid';
import moment from 'moment';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { IngresoFormComponent } from './ingreso-form/ingreso-form.component';
import { CompletarIngresoModalComponent } from './completar-ingreso-modal/completar-ingreso-modal.component';
import { SwalAlertService } from 'src/app/utils/util.swal';
import Swal from 'sweetalert2';
import { IngresoService } from 'src/app/services/ingreso.service';
import { HandleErrorMessage } from 'src/app/utils/handle.errors';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-ingreso',
    templateUrl: './ingreso.component.html',
    styleUrl: './ingreso.component.css'
})
export class IngresoComponent implements OnInit, OnDestroy {
    private gridApi!: GridApi<Ingreso>;
    public gridOptions: GridOptions = <GridOptions>{
        reactiveCustomComponents: true,
        components: {
            actionCellRenderer: RendererComponent
        },
        context: { componentParent: this },
        // Configurar doble clic
        onRowDoubleClicked: (event) => this.onRowDoubleClick(event)
    };

    public dataIngresos: Ingreso[] = [];
    public gestionActual: number = (new Date()).getFullYear();
    public dataGestiones: number[] = [];
    public formGestion: FormGroup;

    private subscription: Subscription | undefined;

    public localEs = localeEs;
    public paginationPageSize = 10;
    public paginationPageSizeSelector: number[] | boolean = [10, 50, 100];
    public paginationNumberFormatter: (params: PaginationNumberFormatterParams) => string = (params: PaginationNumberFormatterParams) => {
        return params.value.toLocaleString();
    };

    public columnDefs: ColDef[] = [
        {
            field: 'id',
            headerName: 'Opciones',
            filter: false,
            minWidth: 215,
            maxWidth: 215,
            cellRenderer: RendererComponent,
            pinned: true
        },
        {
            headerName: 'Fecha Ingreso',
            field: 'fecha_ingreso',
            filter: 'agDateColumnFilter',
            floatingFilter: true,
            minWidth: 180,
            valueFormatter: (params) => {
                if (params.value) {
                    return moment(params.value).format('DD/MM/YYYY HH:mm');
                }
                return '';
            }
        },
        {
            headerName: 'Estado',
            field: 'estado_nombre',
            filter: true,
            floatingFilter: true,
            minWidth: 120,
            cellRenderer: (params: any) => {
                const estado = params.value;
                let clase = '';
                let icono = '';
                if (estado === 'Pendiente') {
                    clase = 'badge bg-warning cursor-pointer';
                    icono = 'ti ti-clock';
                } else if (estado === 'Completado') {
                    clase = 'badge bg-success';
                    icono = 'ti ti-check';
                } else if (estado === 'Anulado') {
                    clase = 'badge bg-danger';
                    icono = 'ti ti-ban';
                }
                return `<span class="${clase}"><i class="${icono} me-1"></i>${estado}</span>`;
            }
        },
        { field: 'codigo', headerName: 'Código', filter: true, floatingFilter: true, minWidth: 150 },
        { field: 'descripcion', headerName: 'Descripción', filter: true, floatingFilter: true, minWidth: 350 },
        { field: 'comprobante', headerName: 'Comprobante', filter: true, floatingFilter: true, minWidth: 150 },
        { field: 'proveedor_nombre', headerName: 'Proveedor', filter: true, floatingFilter: true, minWidth: 200 },
        { field: 'almacen_nombre', headerName: 'Almacén', filter: true, floatingFilter: true, minWidth: 150 },
        { field: 'subalmacen_nombre', headerName: 'Subalmacén', filter: true, floatingFilter: true, minWidth: 150 },
        {
            headerName: 'Total',
            field: 'total',
            filter: true,
            floatingFilter: true,
            minWidth: 120,
            valueFormatter: (params) => {
                if (params.value) {
                    return `Bs. ${params.value.toFixed(2)}`;
                }
                return 'Bs. 0.00';
            }
        },
        {
            headerName: 'Creado por',
            field: 'creado_por_nombre',
            filter: true,
            floatingFilter: true,
            minWidth: 150
        }
    ];

    constructor(
        private fb: FormBuilder,
        private alertService: SwalAlertService,
        private ingresoService: IngresoService,
        private toastr: ToastrService,
        private dialog: MatDialog
    ) {
        this.formGestion = this.fb.group({
            gestion: [this.gestionActual, Validators.required]
        });

        for (let g = 2018; g <= this.gestionActual; g++) {
            this.dataGestiones.push(g);
        }
    }

    ngOnInit(): void {
        this.getIngresos();

        this.formGestion.get('gestion')?.valueChanges.subscribe(() => {
            this.getIngresos();
        });
    }

    public getIngresos(): void {
        const gestion = this.formGestion.get('gestion')?.value;

        this.subscription = this.ingresoService.getIngresos().subscribe({
            next: (response) => {
                if (gestion) {
                    this.dataIngresos = response.filter(i => i.gestion === gestion);
                } else {
                    this.dataIngresos = response;
                }
            },
            error: (err) => {
                this.dataIngresos = [];
                this.toastr.error(HandleErrorMessage(err), 'Error');
            }
        });
    }

    /**
     * Manejar doble clic en la fila
     */
    public onRowDoubleClick(event: any): void {
        const ingreso = event.data as Ingreso;
        
        // Solo mostrar modal si está pendiente
        if (ingreso.estado_codigo !== 'PENDIENTE') {
            if (ingreso.estado_codigo === 'COMPLETADO') {
                this.toastr.info('Este ingreso ya fue completado', 'Información');
            } else if (ingreso.estado_codigo === 'ANULADO') {
                this.toastr.warning('Este ingreso está anulado', 'Advertencia');
            }
            return;
        }

        // Abrir modal de completar
        const dialogRef = this.dialog.open(CompletarIngresoModalComponent, {
            width: '800px',
            maxWidth: '90vw',
            disableClose: true,
            data: { ingreso: ingreso }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result && result.completado) {
                this.getIngresos(); // Recargar lista
            }
        });
    }

    public onActionNuevo(): void {
        const dialogRef = this.dialog.open(IngresoFormComponent, {
            width: '770px',
            disableClose: true,
            data: {}
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.getIngresos();
            }
        });
    }

    public OnActionClick(event: any): void {
        const { action, rowId, data } = event;

        switch (action.toLowerCase()) {
            case 'edit':
                this.onActionEditar(rowId, data);
                break;
            case 'delete':
                this.onActionEliminar(rowId, data);
                break;
            case 'cancel':
                this.onActionAnular(data);
                break;
            case 'view':
                this.onActionVerDetalles(data);
                break;
            default:
                console.warn('Acción no reconocida:', action);
        }
    }

    public onActionEditar(pk: string, data: Ingreso): void {
        if (data.estado_codigo !== 'PENDIENTE') {
            this.toastr.warning('Solo se pueden editar ingresos pendientes', 'Advertencia');
            return;
        }

        const dialogRef = this.dialog.open(IngresoFormComponent, {
            width: '770px',
            disableClose: true,
            data: data
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.getIngresos();
            }
        });
    }

    public onActionEliminar(pk: string, data: Ingreso): void {
        if (data.estado_codigo !== 'PENDIENTE') {
            this.toastr.warning('Solo se pueden eliminar ingresos pendientes', 'Advertencia');
            return;
        }

        this.alertService.showConfirmationDialog('Eliminar Ingreso', '¿Está seguro de eliminar este ingreso?')
            .then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        title: 'Eliminando...',
                        didOpen: () => Swal.showLoading()
                    });

                    this.ingresoService.deleteIngreso(Number(pk)).subscribe({
                        next: () => {
                            this.toastr.success('Ingreso eliminado correctamente', 'Éxito');
                            this.getIngresos();
                            Swal.close();
                        },
                        error: (err) => {
                            this.toastr.error(HandleErrorMessage(err), 'Error');
                            Swal.close();
                        }
                    });
                }
            });
    }

    public onActionAnular(data: Ingreso): void {
        if (data.estado_codigo !== 'PENDIENTE' && data.estado_codigo !== 'COMPLETADO') {
            this.toastr.warning('No se puede anular este ingreso', 'Advertencia');
            return;
        }

        this.alertService.showConfirmationDialog('Anular Ingreso', '¿Está seguro de anular este ingreso? Se revertirá el stock.')
            .then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        title: 'Anulando...',
                        didOpen: () => Swal.showLoading()
                    });

                    this.ingresoService.anularIngreso(data.id, 'Anulado por usuario').subscribe({
                        next: () => {
                            this.toastr.success('Ingreso anulado correctamente', 'Éxito');
                            this.getIngresos();
                            Swal.close();
                        },
                        error: (err) => {
                            this.toastr.error(HandleErrorMessage(err), 'Error');
                            Swal.close();
                        }
                    });
                }
            });
    }

    public onActionVerDetalles(data: Ingreso): void {
        let detallesHtml = `
            <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
                <table class="table table-sm table-bordered">
                    <thead class="table-light">
                        <tr>
                            <th>Producto</th>
                            <th>Código</th>
                            <th class="text-end">Cantidad</th>
                            <th class="text-end">Precio Unit.</th>
                            <th class="text-end">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        if (data.detalles && data.detalles.length > 0) {
            data.detalles.forEach(d => {
                detallesHtml += `
                    <tr>
                        <td>${d.producto_nombre || '-'}</td>
                        <td>${d.producto_codigo || '-'}</td>
                        <td class="text-end">${d.cantidad} ${d.producto_unidad || ''}</td>
                        <td class="text-end">Bs. ${d.precio_unitario?.toFixed(2) || '0.00'}</td>
                        <td class="text-end">Bs. ${d.subtotal?.toFixed(2) || '0.00'}</td>
                    </tr>
                `;
            });
        } else {
            detallesHtml += `
                <tr>
                    <td colspan="5" class="text-center text-muted">
                        <i class="ti ti-info-circle"></i> No hay productos registrados
                    </td>
                </tr>
            `;
        }
        
        detallesHtml += `
                    </tbody>
                    <tfoot class="table-active">
                        <tr>
                            <th colspan="4" class="text-end">TOTAL:</th>
                            <th class="text-end">Bs. ${data.total?.toFixed(2) || '0.00'}</th>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;
        
        const infoIngreso = `
            <div class="row mb-3">
                <div class="col-md-6">
                    <strong>Código:</strong> ${data.codigo}<br>
                    <strong>Comprobante:</strong> ${data.comprobante}<br>
                    <strong>Fecha:</strong> ${moment(data.fecha_ingreso).format('DD/MM/YYYY HH:mm')}
                </div>
                <div class="col-md-6">
                    <strong>Proveedor:</strong> ${data.proveedor_nombre}<br>
                    <strong>Almacén:</strong> ${data.almacen_nombre}<br>
                    <strong>Subalmacén:</strong> ${data.subalmacen_nombre || 'Ninguno'}
                </div>
            </div>
            <hr>
        `;
        
        let estadoBadge = '';
        if (data.estado_codigo === 'PENDIENTE') {
            estadoBadge = '<span class="badge bg-warning"><i class="ti ti-clock me-1"></i>Pendiente</span>';
        } else if (data.estado_codigo === 'COMPLETADO') {
            estadoBadge = '<span class="badge bg-success"><i class="ti ti-check me-1"></i>Completado</span>';
        } else {
            estadoBadge = '<span class="badge bg-danger"><i class="ti ti-ban me-1"></i>Anulado</span>';
        }
        
        Swal.fire({
            title: `Detalles del Ingreso<br><small class="text-muted">${data.codigo} ${estadoBadge}</small>`,
            html: infoIngreso + detallesHtml,
            icon: 'info',
            width: '800px',
            confirmButtonText: 'Cerrar',
            confirmButtonColor: '#3085d6'
        });
    }

    public onSelectionChangedIngreso(event: any): void {}

    public onGridReadyIngreso(params: any): void {
        this.gridApi = params.api;
        setTimeout(() => {
            this.gridApi.sizeColumnsToFit();
        }, 100);
    }

    ngOnDestroy(): void {
        this.subscription?.unsubscribe();
        this.dialog.closeAll();
    }
}