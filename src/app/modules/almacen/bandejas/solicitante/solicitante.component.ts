import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ColDef, GridApi, GridOptions, PaginationNumberFormatterParams } from 'ag-grid-community';
import { localeEs } from 'src/app/app.locale.es.grid';
import { Solicitud, SolicitudCustom } from 'src/app/models/solicitud.model';
import moment from 'moment';
import 'moment-timezone';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RendererComponent } from '../abrenderer/renderer.component';
import { SolicitudService } from 'src/app/services/solicitud.service';
import { ToastrService } from 'ngx-toastr';
import { HandleErrorMessage } from 'src/app/utils/handle.errors';
import { MatDialog } from '@angular/material/dialog';
import { SolicitanteFormComponent } from './solicitante-form/solicitante-form.component';
import Swal from 'sweetalert2';
import { SwalAlertService } from 'src/app/utils/util.swal';

@Component({
    selector: 'app-solicitante',
    templateUrl: './solicitante.component.html',
    styleUrl: './solicitante.component.css'
})
export class SolicitanteComponent implements OnInit, OnDestroy {

    private gridApi!: GridApi<Solicitud>;
    private gridColumnApi: unknown;
    public gridOptions: GridOptions = <GridOptions>{
        reactiveCustomComponents: true,
        components: {
            actionCellRenderer: RendererComponent
        },
        context: { componentParent: this }
    };

    public showForm: boolean = false;
    public dataSolicitud: Solicitud[] = [] as Solicitud[];
    public dataObjetoSolicitud: Solicitud = {} as Solicitud;

    public localEs = localeEs;
    public paginationPageSize = 10;
    public paginationPageSizeSelector: number[] | boolean = [10, 50, 1000];
    public paginationNumberFormatter: (params: PaginationNumberFormatterParams) => string = (params: PaginationNumberFormatterParams) => {
        return params.value.toLocaleString();
    };
    public columnDefs: ColDef[] = [
        { headerName: 'Operaciones', field: 'id', minWidth: 150, cellRenderer: RendererComponent, pinned: true },
        {
            headerName: 'Fecha Solicitud', field: 'fecha_solicitud', filter: 'agDateColumnFilter', floatingFilter: true, type: 'date', minWidth: 180, maxWidth: 190,
            valueGetter: (p) => {
                if (p.data.fecha_solicitud) {
                    return moment(p.data.fecha_solicitud).toDate();
                }
                return null;
            },
            valueFormatter: (p) => {
                if (p.value) {
                    const f = new Date(p.value);
                    return moment(f).format('DD/MM/YYYY HH:mm:ss');
                }
                return '';
            }, filterParams: {
                comparator: (filter, cellValue) => {
                    const cellDate = moment(cellValue).format('DD/MM/YYYY');
                    const filterMoment = moment(filter).format('DD/MM/YYYY');
                    if (cellDate < filterMoment) {
                        return -1;
                    }
                    if (cellDate > filterMoment) {
                        return 1;
                    }
                    return 0;
                }
            }
        },
        {
            headerName: 'Estado',
            field: 'estado',
            filter: true,
            floatingFilter: true,
            minWidth: 150,
            cellRenderer: (p) => {
                if (p.value === 'aprobado') return '<span class="badge bg-success">Aprobado</span>';
                if (p.value === 'rechazado') return '<span class="badge bg-danger">Rechazado</span>';
                return '<span class="badge bg-warning">Pendiente</span>';
            }
        },

        { headerName: 'Código', field: 'codigo', filter: true, floatingFilter: true, minWidth: 180, maxWidth: 190 },
        { headerName: 'Objetivo de la Solicitud', field: 'objetivo', filter: true, floatingFilter: true, minWidth: 400, maxWidth: 410 },
        { headerName: 'Solicitante', field: 'nombre_solicitante', filter: true, floatingFilter: true, minWidth: 210, maxWidth: 220 },
        { headerName: 'Aprobado por', field: 'nombre_aprobador', filter: true, floatingFilter: true, minWidth: 210, maxWidth: 220 },
        { headerName: 'Recepcionado por', field: 'nombre_recepcionador', filter: true, floatingFilter: true, minWidth: 210, maxWidth: 220 },
        { headerName: 'Fecha Envío', field: 'fecha_envio', filter: true, floatingFilter: true ,minWidth: 210, maxWidth: 220},
        {
            headerName: 'Fecha Aprobación', field: 'fecha_aprobacion', filter: 'agDateColumnFilter', floatingFilter: true, type: 'date', minWidth: 180, maxWidth: 190,
            valueGetter: (p) => {
                if (p.data.fecha_aprobacion) {
                    return moment(p.data.fecha_aprobacion).toDate();
                }
                return null;
            },
            valueFormatter: (p) => {
                if (p.value) {
                    const f = new Date(p.value);
                    return moment(f).format('DD/MM/YYYY HH:mm:ss');
                }
                return '';
            }, filterParams: {
                comparator: (filter, cellValue) => {
                    const cellDate = moment(cellValue).format('DD/MM/YYYY');
                    const filterMoment = moment(filter).format('DD/MM/YYYY');
                    if (cellDate < filterMoment) {
                        return -1;
                    }
                    if (cellDate > filterMoment) {
                        return 1;
                    }
                    return 0;
                }
            }
        },
        {
            headerName: 'Fecha Recepción', field: 'fecha_recepcion', filter: 'agDateColumnFilter', floatingFilter: true, type: 'date', minWidth: 180, maxWidth: 190,
            valueGetter: (p) => {
                if (p.data.fecha_recepcion) {
                    return moment(p.data.fecha_recepcion).toDate();
                }
                return null;
            },
            valueFormatter: (p) => {
                if (p.value) {
                    const f = new Date(p.value);
                    return moment(f).format('DD/MM/YYYY HH:mm:ss');
                }
                return '';
            }, filterParams: {
                comparator: (filter, cellValue) => {
                    const cellDate = moment(cellValue).format('DD/MM/YYYY');
                    const filterMoment = moment(filter).format('DD/MM/YYYY');
                    if (cellDate < filterMoment) {
                        return -1;
                    }
                    if (cellDate > filterMoment) {
                        return 1;
                    }
                    return 0;
                }
            }
        },
        {
            headerName: 'Fecha Rechazo', field: 'fecha_rechazo', filter: 'agDateColumnFilter', floatingFilter: true, type: 'date', minWidth: 180, maxWidth: 190,
            valueGetter: (p) => {
                if (p.data.fecha_rechazo) {
                    return moment(p.data.fecha_rechazo).toDate();
                }
                return null;
            },
            valueFormatter: (p) => {
                if (p.value) {
                    const f = new Date(p.value);
                    return moment(f).format('DD/MM/YYYY HH:mm:ss');
                }
                return '';
            }, filterParams: {
                comparator: (filter, cellValue) => {
                    const cellDate = moment(cellValue).format('DD/MM/YYYY');
                    const filterMoment = moment(filter).format('DD/MM/YYYY');
                    if (cellDate < filterMoment) {
                        return -1;
                    }
                    if (cellDate > filterMoment) {
                        return 1;
                    }
                    return 0;
                }
            }
        },
        { headerName: 'Almacen', field: 'almacen.nombre', filter: true, floatingFilter: true, minWidth: 210, maxWidth: 220 },
    ];

    public rowData: SolicitudCustom[] = [];
    private gestionActual: number = new Date().getFullYear();
    private dataSubscription: Subscription;
    public formGestion: FormGroup;
    public dataGestiones: number[] = [];
    // Estadísticas
    public totalSolicitudes: number = 0;
    public solicitudesEnviadas: number = 0;
    public solicitudesAprobadas: number = 0;
    public solicitudesRechazadas: number = 0;

    constructor(
        private fb: FormBuilder,
        private solicitudService: SolicitudService,
        private toastr: ToastrService,
        private dialog: MatDialog,
        private alertService: SwalAlertService
    ) {
        this.formGestion = new FormGroup({});
        for (let g = 2018; g <= this.gestionActual; g++) {
            this.dataGestiones.push(g);
        }
    }

    ngOnInit(): void {
        this.cargarGestiones();
        this.getSolicitudes(this.gestionActual);
    }
    public getSolicitudes(gestion: number): void {
        this.solicitudService.getSolicitudesByGestion(gestion).subscribe({
            next: (response) => {
                this.rowData = response;
                this.calcularEstadisticas(response);
                if (this.gridApi) {
                    this.gridApi.setRowData(this.rowData);
                }
            },
            error: (err) => {
                this.toastr.error(HandleErrorMessage(err), 'Error al cargar solicitudes');
            }
        });
    }
    private calcularEstadisticas(solicitudes: SolicitudCustom[]): void {
        this.totalSolicitudes = solicitudes.length;
        this.solicitudesEnviadas = solicitudes.filter(s => s.fecha_envio).length;
        this.solicitudesAprobadas = solicitudes.filter(s => s.fecha_aprobacion).length;
        this.solicitudesRechazadas = solicitudes.filter(s => s.fecha_rechazo).length;
    }
    public cargarGestiones() {
        this.formGestion = this.fb.group({
            gestion: [this.gestionActual, [Validators.required]]
        });
    }

    public presionar(x: string) {
        alert(x);
    }



    public onChangeGestion(event: any): void {
        if (event.value) {
            this.getSolicitudes(event.value);
        }
    }

    public onActionNuevo() {
        this.showForm = true;
        this.dataObjetoSolicitud = {} as Solicitud;
    }

    public OnActionClick(event: any) {
        const { action, rowId, data } = event;
        if (action.toLowerCase() === 'edit') {
            this.onActionEditar(rowId, data);
        }
        if (action.toLowerCase() === 'delete') {
            this.onActionEliminar(rowId, data);
        }
    }

    public onActionEditar(id: string, data: SolicitudCustom): void {
        const dialogRef = this.dialog.open(SolicitanteFormComponent, {
            width: '800px',
            height: '600px',
            data: { modo: 'editar', solicitud: data }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.getSolicitudes(this.gestionActual);
            }
        });
    }

    public onActionEliminar(id: string, data: SolicitudCustom): void {
        this.alertService.showConfirmationDialog('Eliminar Solicitud',
            `¿Está seguro de eliminar la solicitud ${data.codigo}?`)
            .then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        title: 'Eliminando...',
                        didOpen: () => Swal.showLoading()
                    });

                    this.solicitudService.deleteSolicitud(id).subscribe({
                        next: () => {
                            Swal.close();
                            this.toastr.success('Solicitud eliminada correctamente');
                            this.getSolicitudes(this.gestionActual);
                        },
                        error: (err) => {
                            Swal.close();
                            this.toastr.error(HandleErrorMessage(err), 'Error al eliminar');
                        }
                    });
                }
            });
    }


    public onSelectionChangedSolicitud(event: unknown) {
        return event;
    }

    public onGridReadySolicitud(params: any): void {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        this.gridApi.sizeColumnsToFit();
    }


    ngOnDestroy(): void {
        if (this.dataSubscription) {
            this.dataSubscription.unsubscribe();
        }
        this.dialog.closeAll();
    }
}