import { Component, OnInit, OnDestroy } from '@angular/core';
import { ColDef, GridApi, GridOptions, PaginationNumberFormatterParams } from 'ag-grid-community';
import { SolicitudService } from 'src/app/services/solicitud.service';
import { Solicitud } from 'src/app/models/solicitud.model';
import { ModalAprobacionComponent } from './modal-aprobacion/modal-aprobacion.component';
import moment from 'moment';
import { localeEs } from 'src/app/app.locale.es.grid';
import { ActionRendererComponent } from './action-renderer/action-renderer.component';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-aprobador-component',
  templateUrl: './aprobador.component.html',
  styleUrls: ['./aprobador.component.css']
})
export class AprobadorComponent implements OnInit, OnDestroy {
  private gridApi!: GridApi<Solicitud>;
  private subscriptions: Subscription = new Subscription();

  public gridOptions: GridOptions = {
    reactiveCustomComponents: true,
    components: {
      actionCellRenderer: ActionRendererComponent
    },
    context: { componentParent: this },
    localeText: localeEs,
    pagination: true,
    paginationPageSize: 10,
    paginationPageSizeSelector: [10, 50, 100],
    paginationNumberFormatter: (params: PaginationNumberFormatterParams) => {
      return params.value.toLocaleString();
    }
  };

  public columnDefs: ColDef[] = [
    {
      headerName: 'Acciones',
      minWidth: 150,
      maxWidth: 160,
      cellRenderer: 'actionCellRenderer',
    },
    {
      headerName: 'Estado',
      field: 'estado_nombre',
      //field: 'estado_descripcion',
      filter: true,
      floatingFilter: true,
      minWidth: 150,
      maxWidth: 200,
      cellRenderer: (params: any) => {
       // const estado = params.value;
        const codigo = params.data?.estado_codigo;
        const descripcion = params.data?.estado_descripcion || params.value;
        let badgeClass = '';
        let icono = '';
        
        if (codigo === 'PENDIENTE') {
          badgeClass = 'badge bg-secondary';
          icono = 'ti ti-file';
        } else if (codigo === 'ENVIADO') {
          badgeClass = 'badge bg-primary';
          icono = 'ti ti-send';
        } else if (codigo === 'APROBADO') {
          badgeClass = 'badge bg-success';
          icono = 'ti ti-check';
        } else if (codigo === 'RECHAZADO') {
          badgeClass = 'badge bg-danger';
          icono = 'ti ti-ban';
        } else if (codigo === 'ENTREGADO') {
          badgeClass = 'badge bg-info';
          icono = 'ti ti-truck';
        } else {
          badgeClass = 'badge bg-warning';
          icono = 'ti ti-clock';
        }
        
       // return `<span class="${badgeClass}"><i class="${icono} me-1"></i>${estado}</span>`;
        const style = 'style="white-space: normal; word-break: break-word; line-height: 1.4; max-width: 180px; display: inline-block; text-align: center;"';
        return `<span class="${badgeClass}" ${style}><i class="${icono} me-1"></i>${descripcion || codigo}</span>`;

      }
    },
    {
      headerName: 'Fecha Solicitud',
      field: 'fecha_solicitud',
      filter: 'agDateColumnFilter',
      floatingFilter: true,
      minWidth: 180,
      maxWidth: 190,
      valueFormatter: (params) => {
        if (params.value) {
          return moment(params.value).format('DD/MM/YYYY HH:mm');
        }
        return '';
      }
    },
    { 
      headerName: 'Código', 
      field: 'codigo', 
      filter: true, 
      floatingFilter: true, 
      minWidth: 180, 
      maxWidth: 190 
    },
    { 
      headerName: 'Objetivo', 
      field: 'objetivo', 
      filter: true, 
      floatingFilter: true, 
      minWidth: 400, 
      flex: 1 
    },
    { 
      headerName: 'Solicitante', 
      field: 'solicitante_nombre', 
      filter: true, 
      floatingFilter: true, 
      minWidth: 210, 
      maxWidth: 220 
    },
    { 
      headerName: 'Cargo', 
      field: 'solicitante_cargo', 
      filter: true, 
      floatingFilter: true, 
      minWidth: 210, 
      maxWidth: 220 
    },
    { 
      headerName: 'Almacén', 
      field: 'almacen_nombre', 
      filter: true, 
      floatingFilter: true, 
      minWidth: 210, 
      maxWidth: 220 
    },
    { 
      headerName: 'Productos', 
      field: 'productos_count', 
      filter: true, 
      floatingFilter: true, 
      minWidth: 150, 
      maxWidth: 160,
      valueGetter: (params) => {
        return params.data?.detalles?.length || 0;
      }
    }
  ];

  public rowData: Solicitud[] = [];
  public loading = false;
  public totalSolicitudes: number = 0;
  public solicitudesPendientes: number = 0;
  public solicitudesEnviadas: number = 0;
  public solicitudesAprobadas: number = 0;
  public solicitudesRechazadas: number = 0;
  public solicitudesEntregadas: number = 0;
  private gestionActual: number = new Date().getFullYear();
  public formGestion: FormGroup;
  public dataGestiones: number[] = [];

  constructor(
    private solicitudService: SolicitudService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.formGestion = this.fb.group({
      gestion: [this.gestionActual, [Validators.required]]
    });
    
    for (let g = 2018; g <= this.gestionActual; g++) {
      this.dataGestiones.push(g);
    }
  }

  ngOnInit(): void {
    this.cargarSolicitudes();
    
    this.subscriptions.add(
      this.formGestion.get('gestion')?.valueChanges.subscribe(() => {
        this.cargarSolicitudes();
      })
    );
  }

  private cargarSolicitudes(): void {
    this.loading = true;
    const gestion = this.formGestion.get('gestion')?.value;
    
    // Obtener TODAS las solicitudes (no filtradas por estado)
    this.subscriptions.add(
      this.solicitudService.getTodasSolicitudes().subscribe({
        next: (data) => {
          let solicitudes = data;
          if (gestion) {
            solicitudes = data.filter(s => {
              const fecha = new Date(s.fecha_solicitud);
              return fecha.getFullYear() === gestion;
            });
          }
          
          this.rowData = solicitudes;
          this.calcularEstadisticas(solicitudes);
          this.loading = false;
          
          if (this.gridApi) {
            this.gridApi.setRowData(this.rowData);
          }
        },
        error: (error) => {
          console.error('Error al cargar solicitudes:', error);
          this.toastr.error('Error al cargar las solicitudes');
          this.loading = false;
        }
      })
    );
  }

  private calcularEstadisticas(solicitudes: Solicitud[]): void {
    this.totalSolicitudes = solicitudes.length;
    this.solicitudesPendientes = solicitudes.filter(s => s.estado_codigo === 'PENDIENTE').length;
    this.solicitudesEnviadas = solicitudes.filter(s => s.estado_codigo === 'ENVIADO').length;
    this.solicitudesAprobadas = solicitudes.filter(s => s.estado_codigo === 'APROBADO').length;
    this.solicitudesRechazadas = solicitudes.filter(s => s.estado_codigo === 'RECHAZADO').length;
    this.solicitudesEntregadas = solicitudes.filter(s => s.estado_codigo === 'ENTREGADO').length;
  }

  public verDetallesSolicitud(solicitud: Solicitud): void {
    const dialogRef = this.dialog.open(ModalAprobacionComponent, {
      width: '800px',
      maxWidth: '95vw',
      disableClose: true,
      data: {
        solicitud: solicitud
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarSolicitudes(); // Recargar después de aprobar/rechazar
      }
    });
  }

  public verDetallesAprobacion(solicitud: Solicitud): void {
    this.verDetallesSolicitud(solicitud);
  }

  public onChangeGestion(event: any): void {
    if (event.value) {
      this.cargarSolicitudes();
    }
  }

  public onGridReady(params: any): void {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.dialog.closeAll();
  }
}