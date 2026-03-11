import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { SolicitudAtendida } from 'src/app/models/solicitud-atendida.model'; 
import { MatDialog } from '@angular/material/dialog';
import { AtendidasApiService } from 'src/app/services/atendidas.service';
import { ModalDetallesAtendidaComponent } from './modal-detalle-atendida/modal-detalle-atendida.component';
import { ActionDetalleComponent } from './action-detalle/action-detalle.component';
import { ColDef, GridOptions } from 'ag-grid-community';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';

@Component({
  selector: 'app-atendidas',
  standalone: true,
    imports: [CommonModule, FormsModule, AgGridModule, CardComponent],

  templateUrl: './atendidas.component.html',
  styleUrls: ['./atendidas.component.scss']
})
export class AtendidasComponent implements OnInit {
  solicitudesAtendidas: SolicitudAtendida[] = []; 
  rowData: any[] = [];

  public gridOptions: GridOptions = {
    components: {
      actionDetalle:ActionDetalleComponent
    },
    context: {
      parentComponent: this,
    },
  };

  public columnDefs: ColDef[] = [];

  constructor(
    private atendidasApiService: AtendidasApiService, 
    private dialog: MatDialog 
  ) {}

  ngOnInit(): void {
    this.initializeGrid();
    this.loadSolicitudesAtendidas();
  }

  private initializeGrid(): void {
    
    this.columnDefs = [
      {
        headerName:'Acciones',
        cellRenderer:'actionDetalle',
        width:150
      },
      { headerName: 'ID Solicitud', field: 'solicitud_id', sortable: true, filter: true },
      { headerName: 'Fecha Solicitud', field: 'fecha_solicitud', sortable: true, filter: true },
      { headerName: 'Solicitante', field: 'solicitante.usuario', sortable: true, filter: true },
      { headerName: 'Almacén', field: 'almacen.nombre', sortable: true, filter: true },
      { headerName: 'Objetivo', field: 'objetivo', sortable: true, filter: true },
      { headerName: 'Estado', field: 'estado', sortable: true, filter: true },
      { headerName: 'Productos', field: 'productos_count', sortable: true, filter: true },
      { headerName: 'Fecha Recepción', field: 'fecha_recepcion', sortable: true, filter: true },
      { headerName: 'Receptionista', field: 'recepcionista', sortable: true, filter: true }
      
    ];
  }

  private loadSolicitudesAtendidas(): void {
    this.atendidasApiService.obtenerAtendidas().subscribe({
      next: (solicitudes) => {
        this.solicitudesAtendidas = solicitudes;
        this.rowData = solicitudes.map(solicitud => ({
          ...solicitud,
          productos_count: solicitud.productos.length,
          fecha_solicitud: this.formatDate(solicitud.fecha_solicitud),
          fecha_recepcion: solicitud.fecha_recepcion ? this.formatDate(solicitud.fecha_recepcion) : 'N/A'
        }));
      },
      error: (error) => {
        console.error('Error al cargar atendidas:', error);
      }
    });
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  verDetalles(id: string): void {
    const atendida = this.solicitudesAtendidas.find(s => s.id === id);
    if (atendida) {
      this.dialog.open(ModalDetallesAtendidaComponent, {
        width: '500px',
        data: { atendida }
      });
    } else {
      console.log('Solicitud no encontrada:', id);
    }
  }
  ngOnDestroy(): void {
    this.dialog.closeAll();
  }
}