import { Component, OnInit } from '@angular/core';
import { ColDef, GridApi, GridOptions, PaginationNumberFormatterParams } from 'ag-grid-community';
import { AprobacionService } from 'src/app/services/aprobacion.service';
import { Aprobacion } from 'src/app/models/aprobacion.model';
import { ModalAprobacionComponent } from './modal-aprobacion/modal-aprobacion.component';
import * as moment from 'moment';
import { localeEs } from 'src/app/app.locale.es.grid';
import { ActionRendererComponent } from './action-renderer/action-renderer.component';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-aprobador-component',
  templateUrl: './aprobador.component.html',
  styleUrls: ['./aprobador.component.css']
})
export class AprobadorComponent implements OnInit {
  private gridApi!: GridApi<Aprobacion>;

  public gridOptions: GridOptions = {
    reactiveCustomComponents: true,
    components: {
      actionCellRenderer: ActionRendererComponent

    },
    context: { componentParent: this },
    localeText: localeEs,
    pagination: true,
    paginationPageSize: 10,
    paginationPageSizeSelector: [10, 50, 1000],
    paginationNumberFormatter: (params: PaginationNumberFormatterParams) => {
      return params.value.toLocaleString();
    }
  };

  public columnDefs: ColDef[] = [
    {
      headerName: 'Acciones',
      width: 120,
      cellRenderer: 'actionCellRenderer',
    },
    {
      headerName: 'Estado',
      field: 'estado',
      filter: true,
      floatingFilter: true,
      minWidth: 150,
      maxWidth: 160,
      cellRenderer: (params) => {
        const estado = params.value;
        let badgeClass = '';
        if (estado === 'pendiente') {
          badgeClass = 'badge bg-warning text-dark';
        } else if (estado === 'rechazado') {
          badgeClass = 'badge bg-danger';
        } else if (estado === 'aprobado') {
          badgeClass = 'badge bg-success';
        }
        return `<span class="${badgeClass} estado-badge">${estado}</span>`;
      }
    },
    {
      headerName: 'Fecha Solicitud',
      field: 'fecha_solicitud',
      filter: 'agDateColumnFilter',
      floatingFilter: true,
      minWidth: 180,
      maxWidth: 190,
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
      },
      filterParams: {
        comparator: (filter: any, cellValue: any) => {
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
    { headerName: 'Código', field: 'solicitud_id', filter: true, floatingFilter: true, minWidth: 180, maxWidth: 190 },
    { headerName: 'Objetivo', field: 'objetivo', filter: true, floatingFilter: true, minWidth: 400, maxWidth: 410 },
    { headerName: 'Solicitante', field: 'solicitante.usuario', filter: true, floatingFilter: true, minWidth: 210, maxWidth: 220 },
    { headerName: 'Cargo', field: 'solicitante.cargo', filter: true, floatingFilter: true, minWidth: 210, maxWidth: 220 },
    { headerName: 'Almacén', field: 'almacen.nombre', filter: true, floatingFilter: true, minWidth: 210, maxWidth: 220 },
    { headerName: 'Productos', field: 'productos_count', filter: true, floatingFilter: true, minWidth: 150, maxWidth: 160 }

  ];

  public rowData: any[] = [];
  public loading = false;
  private dataSubscription: Subscription;
  public totalSolicitudes: number = 0;
  public solicitudesPendientes: number = 0;
  public solicitudesAprobadas: number = 0;
  public solicitudesRechazadas: number = 0;
  private gestionActual: number = new Date().getFullYear();
  public formGestion: FormGroup;
  public dataGestiones: number[] = [];

  constructor(
    private aprobacionService: AprobacionService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    
  ) {
    this.formGestion = this.fb.group({
      gestion: [this.gestionActual, [Validators.required]]
    });
    for (let g = 2018; g <= this.gestionActual; g++) {
      this.dataGestiones.push(g);
    }
  }

  ngOnInit(): void {
    this.cargarAprobaciones(this.gestionActual);
  }
   private cargarAprobaciones(gestion: number): void {
    this.loading = true;
    this.aprobacionService.obtenerAprobacionesGestion(gestion).subscribe({
      next: (data) => {
        this.rowData = data.map(aprob => ({
          ...aprob,
          productos_count: aprob.productos.length
        }));
        this.calcularEstadisticas(data);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar aprobaciones:', error);
        this.loading = false;
      }
    });
  }
/*
  private cargarAprobaciones(): void {
    this.loading = true;
    this.aprobacionService.obtenerAprobaciones().subscribe({
      next: (data) => {
        this.rowData = data.map(aprob => ({
          ...aprob,
          productos_count: aprob.productos.length
        }));
        this.calcularEstadisticas(data);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar aprobaciones:', error);
        this.loading = false;
      }
    });
  }
*/
  private calcularEstadisticas(aprobaciones: any[]): void {
    this.totalSolicitudes = aprobaciones.length;
    this.solicitudesPendientes = aprobaciones.filter(a => a.estado === 'pendiente').length;
    this.solicitudesAprobadas = aprobaciones.filter(a => a.estado === 'aprobado').length;
    this.solicitudesRechazadas = aprobaciones.filter(a => a.estado === 'rechazado').length;
  }

  public verDetallesAprobacion(aprobacion: any): void {
    const dialogRef = this.dialog.open(ModalAprobacionComponent, {
      width: '800px',
      data: {
        aprobacion: {
          ...aprobacion,
          productos: aprobacion.productos || [],
          solicitante: aprobacion.solicitante || { usuario: '', cargo: '' },
          almacen: aprobacion.almacen || { id: '', nombre: '' }
        }
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarAprobaciones(this.gestionActual);
      }
    });
  }

 public cargarGestiones() {
        this.formGestion = this.fb.group({
            gestion: [this.gestionActual, [Validators.required]]
        });
    }
   public onChangeGestion(event: any): void {
        if (event.value) {
            this.cargarAprobaciones(event.value);
        }
    }

  ngOnDestroy(): void {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();

    }
    this.dialog.closeAll();
  }
}