import { Component, OnDestroy, OnInit } from '@angular/core';
import { ColDef, GridApi, GridOptions, PaginationNumberFormatterParams } from 'ag-grid-community';
import { Ingreso } from 'src/app/models/ingreso.model';
//import { RendererComponent } from '../../../bandejas/abrenderer/renderer.component';
import { RendererComponent } from '../../bandejas/abrenderer/renderer.component';
import { localeEs } from 'src/app/app.locale.es.grid';
import moment from 'moment';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { IngresoFormComponent } from './ingreso-form/ingreso-form.component';
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
        context: { componentParent: this }
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
            minWidth: 115,
            maxWidth: 115,
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
                    clase = 'badge bg-warning';
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

        // Generar años desde 2018 hasta actual
        for (let g = 2018; g <= this.gestionActual; g++) {
            this.dataGestiones.push(g);
        }
    }

    ngOnInit(): void {
        this.getIngresos();

        // Escuchar cambios en la gestión
        this.formGestion.get('gestion')?.valueChanges.subscribe(() => {
            this.getIngresos();
        });
    }

    public getIngresos(): void {
        const gestion = this.formGestion.get('gestion')?.value;

        this.subscription = this.ingresoService.getIngresos().subscribe({
            next: (response) => {
                // Filtrar por gestión si es necesario
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

    public onActionNuevo(): void {
        const dialogRef = this.dialog.open(IngresoFormComponent, {
            //width: '700px',
            width: '770px',
            height: '430px',
            minWidth: '770wv',
            minHeight: '450hv',
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

        if (action.toLowerCase() === 'edit') {
            this.onActionEditar(rowId, data);
        }
        if (action.toLowerCase() === 'delete') {
            this.onActionEliminar(rowId, data);
        }
        if (action.toLowerCase() === 'complete') {
            this.onActionCompletar(data);
        }
        if (action.toLowerCase() === 'cancel') {
            this.onActionAnular(data);
        }
    }

    public onActionEditar(pk: string, data: Ingreso): void {
        // Solo se puede editar si está pendiente
        if (data.estado_codigo !== 'PENDIENTE') {
            this.toastr.warning('Solo se pueden editar ingresos pendientes', 'Advertencia');
            return;
        }

        const dialogRef = this.dialog.open(IngresoFormComponent, {
            // width: '700px',
            width: '770px',
            height: '430px',
            minWidth: '770wv',
            minHeight: '450hv',
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
        // Solo se puede eliminar si está pendiente
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

    public onActionCompletar(data: Ingreso): void {
        if (data.estado_codigo !== 'PENDIENTE') {
            this.toastr.warning('Solo se pueden completar ingresos pendientes', 'Advertencia');
            return;
        }

        this.alertService.showConfirmationDialog('Completar Ingreso', '¿Está seguro de completar este ingreso? Se actualizará el stock.')
            .then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        title: 'Procesando...',
                        didOpen: () => Swal.showLoading()
                    });

                    this.ingresoService.completarIngreso(data.id).subscribe({
                        next: (response) => {
                            this.toastr.success('Ingreso completado correctamente', 'Éxito');
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

    public onSelectionChangedIngreso(event: any): void {
        // Manejar selección si es necesario
    }

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