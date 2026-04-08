import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ColDef, GridApi, GridOptions, PaginationNumberFormatterParams } from 'ag-grid-community';
import { localeEs } from 'src/app/app.locale.es.grid';
import { Solicitud } from 'src/app/models/solicitud.model';
import moment from 'moment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RendererComponent2 } from './abrenderer2/renderer2.component';
import { SolicitudService } from 'src/app/services/solicitud.service';
import { ToastrService } from 'ngx-toastr';
import { HandleErrorMessage } from 'src/app/utils/handle.errors';
import { MatDialog } from '@angular/material/dialog';
import { SolicitanteFormComponent } from './solicitante-form/solicitante-form.component';
import Swal from 'sweetalert2';
import { SwalAlertService } from 'src/app/utils/util.swal';
import { AuthService } from 'src/app/services/auth.service';
import { DetalleSolicitudModalComponent } from './detalle-solicitud-modal/detalle-solicitud-modal.component';

@Component({
    selector: 'app-solicitante',
    templateUrl: './solicitante.component.html',
    styleUrls: ['./solicitante.component.css']
})
export class SolicitanteComponent implements OnInit, OnDestroy {
    private gridApi!: GridApi<Solicitud>;
    private gridColumnApi: any;
    public gridOptions: GridOptions = <GridOptions>{
        reactiveCustomComponents: true,
        components: {
            actionCellRenderer: RendererComponent2
        },
        context: { componentParent: this }
    };

    public showForm: boolean = false;
    public dataObjetoSolicitud: Solicitud = {} as Solicitud;
    public rowData: Solicitud[] = [];
    
    private gestionActual: number = new Date().getFullYear();
    private dataSubscription: Subscription | undefined;
    public formGestion: FormGroup;
    public dataGestiones: number[] = [];
    
    // Estadísticas
    public totalSolicitudes: number = 0;
    public solicitudesEnviadas: number = 0;
    public solicitudesAprobadas: number = 0;
    public solicitudesRechazadas: number = 0;

    public localEs = localeEs;
    public paginationPageSize = 10;
    public paginationPageSizeSelector: number[] | boolean = [10, 50, 100];
    public paginationNumberFormatter: (params: PaginationNumberFormatterParams) => string = (params: PaginationNumberFormatterParams) => {
        return params.value.toLocaleString();
    };

    public columnDefs: ColDef[] = [
        { 
            headerName: 'Operaciones', 
            field: 'id', 
            minWidth: 150, 
            maxWidth: 150, 
            cellRenderer: RendererComponent2, 
            pinned: true 
        },
        {
            headerName: 'Fecha Solicitud',
            field: 'fecha_solicitud',
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
            minWidth: 130,
            cellRenderer: (params: any) => {
                const estado = params.value;
                const codigo = params.data?.estado_codigo;
                let clase = 'badge bg-warning';
                let icono = 'ti ti-clock';
                
                if (codigo === 'APROBADO') {
                    clase = 'badge bg-success';
                    icono = 'ti ti-check';
                } else if (codigo === 'RECHAZADO') {
                    clase = 'badge bg-danger';
                    icono = 'ti ti-ban';
                } else if (codigo === 'ENTREGADO') {
                    clase = 'badge bg-info';
                    icono = 'ti ti-truck';
                } else if (codigo === 'ENVIADO') {
                    clase = 'badge bg-primary';
                    icono = 'ti ti-send';
                }
                
                return `<span class="${clase}"><i class="${icono} me-1"></i>${estado}</span>`;
            }
        },
        { field: 'codigo', headerName: 'Código', filter: true, floatingFilter: true, minWidth: 150 },
        { field: 'objetivo', headerName: 'Objetivo', filter: true, floatingFilter: true, minWidth: 350 },
        { field: 'solicitante_nombre', headerName: 'Solicitante', filter: true, floatingFilter: true, minWidth: 180 },
        { field: 'solicitante_cargo', headerName: 'Cargo', filter: true, floatingFilter: true, minWidth: 180 },
        { field: 'aprobador_nombre', headerName: 'Aprobado por', filter: true, floatingFilter: true, minWidth: 180 },
        { field: 'almacenero_nombre', headerName: 'Entregado por', filter: true, floatingFilter: true, minWidth: 180 },
        { field: 'almacen_nombre', headerName: 'Almacén', filter: true, floatingFilter: true, minWidth: 180 },
        { 
            headerName: 'Fecha Envío', 
            field: 'fecha_envio',
            filter: 'agDateColumnFilter',
            floatingFilter: true,
            minWidth: 180,
            valueFormatter: (params) => {
                if (params.value) {
                    return moment(params.value).format('DD/MM/YYYY HH:mm');
                }
                return '-';
            }
        },
        {
            headerName: 'Fecha Aprobación',
            field: 'fecha_aprobacion',
            filter: 'agDateColumnFilter',
            floatingFilter: true,
            minWidth: 180,
            valueFormatter: (params) => {
                if (params.value) {
                    return moment(params.value).format('DD/MM/YYYY HH:mm');
                }
                return '-';
            }
        },
        {
            headerName: 'Fecha Entrega',
            field: 'fecha_recepcion',
            filter: 'agDateColumnFilter',
            floatingFilter: true,
            minWidth: 180,
            valueFormatter: (params) => {
                if (params.value) {
                    return moment(params.value).format('DD/MM/YYYY HH:mm');
                }
                return '-';
            }
        }
    ];

    constructor(
        private fb: FormBuilder,
        private solicitudService: SolicitudService,
        private toastr: ToastrService,
        private dialog: MatDialog,
        private alertService: SwalAlertService,
        private authService: AuthService
    ) {
        this.formGestion = this.fb.group({
            gestion: [this.gestionActual, Validators.required]
        });
        
        for (let g = 2018; g <= this.gestionActual; g++) {
            this.dataGestiones.push(g);
        }
    }

    ngOnInit(): void {
        this.getSolicitudes();
        
        this.formGestion.get('gestion')?.valueChanges.subscribe(() => {
            this.getSolicitudes();
        });
    }

    public getSolicitudes(): void {
        const gestion = this.formGestion.get('gestion')?.value;
        
        this.dataSubscription = this.solicitudService.getMisSolicitudes().subscribe({
            next: (response) => {
                // Filtrar por gestión
                if (gestion) {
                    this.rowData = response.filter(s => {
                        const fecha = new Date(s.fecha_solicitud);
                        return fecha.getFullYear() === gestion;
                    });
                } else {
                    this.rowData = response;
                }
                this.calcularEstadisticas(this.rowData);
                
                if (this.gridApi) {
                    this.gridApi.setRowData(this.rowData);
                }
            },
            error: (err) => {
                this.rowData = [];
                this.toastr.error(HandleErrorMessage(err), 'Error al cargar solicitudes');
            }
        });
    }

    private calcularEstadisticas(solicitudes: Solicitud[]): void {
        this.totalSolicitudes = solicitudes.length;
        this.solicitudesEnviadas = solicitudes.filter(s => s.estado_codigo === 'ENVIADO').length;
        this.solicitudesAprobadas = solicitudes.filter(s => s.estado_codigo === 'APROBADO').length;
        this.solicitudesRechazadas = solicitudes.filter(s => s.estado_codigo === 'RECHAZADO').length;
    }

    public onChangeGestion(event: any): void {
        if (event.value) {
            this.getSolicitudes();
        }
    }

    public onActionNuevo(): void {
        this.showForm = true;
        this.dataObjetoSolicitud = {} as Solicitud;
    }

    public OnActionClick(event: any): void {
        const { action, rowId, data } = event;
        
        if (action.toLowerCase() === 'edit') {
          //  this.onActionEditar(rowId, data);
        }
        if (action.toLowerCase() === 'delete') {
            this.onActionEliminar(rowId, data);
        }
        if (action.toLowerCase() === 'send') {
            this.onActionEnviar(data);
        }
        if (action.toLowerCase() === 'view') {
            this.onActionVerDetalles(data);
        }
    }

    public onActionEditar(id: number, data: Solicitud): void {
        // Solo se puede editar si está en estado PENDIENTE o ENVIADO? (depende de tu lógica)
        if (data.estado_codigo !== 'PENDIENTE') {
            this.toastr.warning('Solo se pueden editar solicitudes pendientes', 'Advertencia');
            return;
        }
        
        const dialogRef = this.dialog.open(SolicitanteFormComponent, {
            width: '900px',
            maxWidth: '95vw',
            disableClose: true,
            data: { modo: 'editar', solicitud: data }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.getSolicitudes();
            }
        });
    }

    public onActionEnviar(data: Solicitud): void {
        if (data.estado_codigo !== 'PENDIENTE') {
            this.toastr.warning('No se puede enviar esta solicitud', 'Advertencia');
            return;
        }
        
        this.alertService.showConfirmationDialog('Enviar Solicitud', 
            `¿Está seguro de enviar la solicitud ${data.codigo} para aprobación?`)
            .then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        title: 'Enviando...',
                        didOpen: () => Swal.showLoading()
                    });
                    
                    this.solicitudService.enviarSolicitud(data.id).subscribe({
                        next: () => {
                            Swal.close();
                            this.toastr.success('Solicitud enviada correctamente');
                            this.getSolicitudes();
                        },
                        error: (err) => {
                            Swal.close();
                            this.toastr.error(HandleErrorMessage(err), 'Error al enviar');
                        }
                    });
                }
            });
    }

    public onActionEliminar(id: number, data: Solicitud): void {
        if (data.estado_codigo !== 'PENDIENTE') {
            this.toastr.warning('Solo se pueden eliminar solicitudes pendientes', 'Advertencia');
            return;
        }
        
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
                            this.getSolicitudes();
                        },
                        error: (err) => {
                            Swal.close();
                            this.toastr.error(HandleErrorMessage(err), 'Error al eliminar');
                        }
                    });
                }
            });
    }

    public onActionVerDetalles(solicitud: Solicitud): void {
        const dialogRef = this.dialog.open(DetalleSolicitudModalComponent, {
            width: '700px',
            maxWidth: '65vw',
            maxHeight: '80vh',
            data: {
                solicitud: solicitud
            }
        });
    }

    public onSelectionChangedSolicitud(event: any): void {}

    public onGridReadySolicitud(params: any): void {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        setTimeout(() => {
            this.gridApi.sizeColumnsToFit();
        }, 100);
    }

    ngOnDestroy(): void {
        this.dataSubscription?.unsubscribe();
        this.dialog.closeAll();
    }
}