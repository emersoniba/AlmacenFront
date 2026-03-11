import { Component, OnInit } from '@angular/core';
import { ColDef, GridApi, GridOptions, PaginationNumberFormatterParams } from 'ag-grid-community';
import { RecepcionadorService } from 'src/app/services/recepcionador.service';
import { Aprobacion } from 'src/app/models/aprobacion.model';
import * as moment from 'moment';
import { localeEs } from 'src/app/app.locale.es.grid';
import { Subscription } from 'rxjs';
import { ActionRendererRecepcionadorComponent } from './action-renderer/action-renderer.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recepcionador',
  templateUrl: './recepcionador.component.html',
  styleUrls: ['./recepcionador.component.css']
})
export class RecepcionadorComponent implements OnInit {
  private gridApi!: GridApi<Aprobacion>;

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
  public paginationNumberFormatter: (params: PaginationNumberFormatterParams) => string = (params: PaginationNumberFormatterParams) => {
    return params.value.toLocaleString();
  };
  public columnDefs: ColDef[] = [
    {
      headerName: 'Acciones',
      width: 120,
      cellRenderer: 'actionCellRenderer',
    },
    {
      headerName: 'Fecha Solicitud',
      field: 'fecha_solicitud',
      filter: 'agDateColumnFilter',
      floatingFilter: true,
      minWidth: 180,
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
      }
    },
    {
      headerName: 'Código',
      field: 'solicitud_id',
      filter: true,
      floatingFilter: true,
      minWidth: 180
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
      field: 'solicitante.usuario',
      filter: true,
      floatingFilter: true,
      minWidth: 150
    },
    {
      headerName: 'Almacén',
      field: 'almacen.nombre',
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
      }
    },
    {
      headerName: 'Aprobador',
      field: 'aprobador',
      filter: true,
      floatingFilter: true,
      minWidth: 120
    },
    {
      headerName: 'Productos',
      field: 'productos_count',
      filter: true,
      floatingFilter: true,
      minWidth: 100
    },
    {
      headerName: 'Estado',
      field: 'estado',
      filter: true,
      floatingFilter: true,
      minWidth: 120,
      cellStyle: (params) => {
        if (params.value === 'recibido') {
          return { color: 'white', backgroundColor: 'green' };
        }
        return { color: 'white', backgroundColor: 'orange' };
      }
    }
  ];

  public rowData: any[] = [];
  public loading = false;
  private dataSubscription: Subscription;

  constructor(
    private recepcionadorService: RecepcionadorService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarSolicitudesAprobadas();
  }

  public cargarSolicitudesAprobadas(): void {
    this.loading = true;
    this.recepcionadorService.obtenerSolicitudesAprobadas().subscribe({
      next: (data) => {
        this.rowData = data.map(aprob => ({
          ...aprob,
          productos_count: aprob.productos.length
        }));
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar solicitudes aprobadas:', error);
        this.loading = false;
      }
    });
  }

  public verDetallesRecepcion(aprobacion: Aprobacion): void {
    if (aprobacion.id) {
      this.router.navigate(['/entrega-productos', aprobacion.id]);
    }
  }

  onGridReady(params: any): void {
    this.gridApi = params.api;
  }

  ngOnDestroy(): void {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }
}