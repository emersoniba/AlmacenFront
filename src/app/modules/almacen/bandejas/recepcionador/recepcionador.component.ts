import { Component, OnInit } from '@angular/core';
import { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { SolicitudService } from 'src/app/services/solicitud.service';
import { Solicitud } from 'src/app/models/solicitud.model';
import moment from 'moment';
import { localeEs } from 'src/app/app.locale.es.grid';
import { ActionRendererRecepcionadorComponent } from './action-renderer/action-renderer.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recepcionador',
  templateUrl: './recepcionador.component.html',
  styleUrls: ['./recepcionador.component.css']
})
export class RecepcionadorComponent implements OnInit {
  private gridApi!: GridApi<Solicitud>;

  public gridOptions: GridOptions = {
    reactiveCustomComponents: true,
    components: {
      actionCellRenderer: ActionRendererRecepcionadorComponent
    },
    context: { componentParent: this },
  };

  public localEs = localeEs;
  public paginationPageSize = 10;
  public paginationPageSizeSelector: number[] | boolean = [10, 50, 1000];

  public columnDefs: ColDef[] = [
    {
      headerName: 'Acciones',
      width: 120,
      cellRenderer: 'actionCellRenderer',
    },
    {
      headerName: 'Código',
      field: 'codigo',
      filter: true,
      floatingFilter: true,
      minWidth: 150
    },
    {
      headerName: 'Fecha Solicitud',
      field: 'fecha_solicitud',
      filter: 'agDateColumnFilter',
      floatingFilter: true,
      minWidth: 180,
      valueFormatter: (p) => p.value ? moment(p.value).format('DD/MM/YYYY HH:mm:ss') : ''
    },
    {
      headerName: 'Objetivo',
      field: 'objetivo',
      filter: true,
      floatingFilter: true,
      minWidth: 300
    },
    {
      headerName: 'Solicitante',
      field: 'solicitante_nombre',
      filter: true,
      floatingFilter: true,
      minWidth: 150
    },
    {
      headerName: 'Almacén',
      field: 'almacen_nombre',
      filter: true,
      floatingFilter: true,
      minWidth: 150
    },
    {
      headerName: 'Fecha Aprobación',
      field: 'fecha_aprobacion',
      filter: 'agDateColumnFilter',
      floatingFilter: true,
      minWidth: 180,
      valueFormatter: (p) => p.value ? moment(p.value).format('DD/MM/YYYY HH:mm:ss') : ''
    },
    {
      headerName: 'Aprobador',
      field: 'aprobador_nombre',
      filter: true,
      floatingFilter: true,
      minWidth: 120
    },
    {
      headerName: 'Estado',
      field: 'estado_nombre',
      filter: true,
      floatingFilter: true,
      minWidth: 120,
      cellStyle: (params) => {
        if (params.value === 'Entregado') {
          return { color: 'white', backgroundColor: 'green' };
        }
        if (params.value === 'Aprobado') {
          return { color: 'white', backgroundColor: '#28a745' };
        }
        return { color: 'white', backgroundColor: '#ffc107' };
      }
    }
  ];

  public rowData: Solicitud[] = [];
  public loading = false;

  constructor(
    private solicitudService: SolicitudService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarSolicitudesAprobadas();
  }

  public cargarSolicitudesAprobadas(): void {
    this.loading = true;
    // Usar el método correcto del backend
    this.solicitudService.getSolicitudes().subscribe({
      next: (data) => {
        // Filtrar por estado APROBADO (código = 'APROBADO')
        this.rowData = data.filter(solicitud => solicitud.estado_codigo === 'APROBADO');
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar solicitudes:', error);
        this.loading = false;
      }
    });
  }

  public verDetallesRecepcion(solicitud: Solicitud): void {
    if (solicitud.id) {
      this.router.navigate(['/entrega-productos', solicitud.id]);
    }
  }

  onGridReady(params: any): void {
    this.gridApi = params.api;
  }
}