import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { Solicitud } from 'src/app/models/solicitud.model';
import { SolicitudService } from 'src/app/services/solicitud.service';
import { MatDialog } from '@angular/material/dialog';
import { ModalDetallesAtendidaComponent } from './modal-detalle-atendida/modal-detalle-atendida.component';
import { ActionDetalleComponent } from './action-detalle/action-detalle.component';
import { ColDef, GridOptions } from 'ag-grid-community';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import moment from 'moment';

@Component({
  selector: 'app-atendidas',
  standalone: true,
  imports: [CommonModule, FormsModule, AgGridModule, CardComponent],
  templateUrl: './atendidas.component.html',
  styleUrls: ['./atendidas.component.scss']
})
export class AtendidasComponent implements OnInit {
  solicitudesAtendidas: Solicitud[] = [];
  rowData: any[] = [];
  loading = false;

  public gridOptions: GridOptions = {
    components: {
      actionDetalle: ActionDetalleComponent
    },
    context: {
      parentComponent: this,
    },
    pagination: true,
    paginationPageSize: 10,
    paginationPageSizeSelector: [10, 25, 50, 100],
    localeText: {
      page: 'Página',
      to: 'a',
      of: 'de',
      nextPage: 'Siguiente',
      prevPage: 'Anterior',
      firstPage: 'Primera',
      lastPage: 'Última'
    }
  };

  public columnDefs: ColDef[] = [
    {
      headerName: 'Acciones',
      cellRenderer: 'actionDetalle',
      width: 150,
      pinned: 'left'
    },
    {
      headerName: 'Código',
      field: 'codigo',
      sortable: true,
      filter: true,
      width: 150
    },
    {
      headerName: 'Fecha Solicitud',
      field: 'fecha_solicitud',
      sortable: true,
      filter: 'agDateColumnFilter',
      width: 180,
      valueFormatter: (params) => params.value ? moment(params.value).format('DD/MM/YYYY HH:mm') : ''
    },
    {
      headerName: 'Solicitante',
      field: 'solicitante_nombre',
      sortable: true,
      filter: true,
      width: 200
    },
    {
      headerName: 'Almacén',
      field: 'almacen_nombre',
      sortable: true,
      filter: true,
      width: 150
    },
    {
      headerName: 'Objetivo',
      field: 'objetivo',
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 250,
      wrapText: true,
      autoHeight: true
    },
    {
      headerName: 'Estado',
      field: 'estado_descripcion',
      sortable: true,
      filter: true,
      width: 180,
      cellRenderer: (params: any) => {
        const codigo = params.data?.estado_codigo;
        const descripcion = params.data?.estado_descripcion;
        let badgeClass = '';
        let icono = '';

        if (codigo === 'ENTREGADO') {
          badgeClass = 'badge bg-success';
          icono = 'ti ti-check';
        } else if (codigo === 'RECHAZADO') {
          badgeClass = 'badge bg-danger';
          icono = 'ti ti-ban';
        } else {
          badgeClass = 'badge bg-secondary';
          icono = 'ti ti-clock';
        }

        return `<span class="${badgeClass}"><i class="${icono} me-1"></i>${descripcion || codigo}</span>`;
      }
    },
    {
      headerName: 'Total Productos',
      field: 'total_productos',
      sortable: true,
      filter: true,
      width: 130,
      valueGetter: (params) => params.data?.detalles?.length || 0
    },
    {
      headerName: 'Fecha Atención',
      field: 'fecha_recepcion',
      sortable: true,
      filter: 'agDateColumnFilter',
      width: 180,
      valueFormatter: (params) => params.value ? moment(params.value).format('DD/MM/YYYY HH:mm') : 'N/A'
    },
    {
      headerName: 'Atendido por',
      field: 'almacenero_nombre',
      sortable: true,
      filter: true,
      width: 180
    },
    {
      headerName: 'Observación',
      field: 'observacion_almacenero',
      sortable: true,
      filter: true,
      width: 200,
      wrapText: true,
      autoHeight: true
    }
  ];

  constructor(
    private solicitudService: SolicitudService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadSolicitudesAtendidas();
  }

  private loadSolicitudesAtendidas(): void {
    this.loading = true;
    // Obtener todas las solicitudes
    this.solicitudService.getTodasSolicitudes().subscribe({
      next: (solicitudes) => {
        // Filtrar solo las atendidas (ENTREGADO o RECHAZADO)
        this.solicitudesAtendidas = solicitudes.filter(
          s => s.estado_codigo === 'ENTREGADO' || s.estado_codigo === 'RECHAZADO'
        );
        this.rowData = this.solicitudesAtendidas;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar solicitudes atendidas:', error);
        this.loading = false;
      }
    });
  }

  verDetalles(id: number): void {
    const solicitud = this.solicitudesAtendidas.find(s => s.id === id);
    if (solicitud) {
      this.dialog.open(ModalDetallesAtendidaComponent, {
        /*width: '800px',
        maxWidth: '95vw',*/
        width: '550px',  // Tamaño más pequeño
        maxWidth: '90vw',
        maxHeight: '65vh',
        data: { solicitud: solicitud },
        panelClass: 'custom-modal',
        autoFocus: false
      });
    }
  }
}