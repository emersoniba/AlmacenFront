import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Solicitud } from 'src/app/models/solicitud.model';
import { SolicitudService } from 'src/app/services/solicitud.service';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-modal-detalles-atendida',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-detalle-atendida.component.html',
  styleUrls: ['./modal-detalle-atendida.component.scss']
})
export class ModalDetallesAtendidaComponent implements OnInit {
  solicitud: Solicitud;
  loading = false;

  constructor(
    public dialogRef: MatDialogRef<ModalDetallesAtendidaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { solicitud: Solicitud },
    private solicitudService: SolicitudService,
    private toastr: ToastrService
  ) {
    this.solicitud = data.solicitud;
  }

  ngOnInit(): void {
    // Si no tiene detalles, cargarlos
    if (!this.solicitud.detalles || this.solicitud.detalles.length === 0) {
      this.cargarDetallesCompletos();
    }
  }

  private cargarDetallesCompletos(): void {
    this.loading = true;
    this.solicitudService.getSolicitudById(this.solicitud.id).subscribe({
      next: (solicitudCompleta) => {
        this.solicitud = solicitudCompleta;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar detalles:', error);
        this.toastr.error('Error al cargar los detalles de productos');
        this.loading = false;
      }
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }

  // CORREGIDO: Convertir a número correctamente
  get totalSolicitado(): number {
    if (!this.solicitud.detalles) return 0;
    
    return this.solicitud.detalles.reduce((total, detalle) => {
      // Asegurar que sea número
      const cantidad = typeof detalle.cantidad_solicitada === 'number' 
        ? detalle.cantidad_solicitada 
        : parseFloat(detalle.cantidad_solicitada as any);
      return total + (isNaN(cantidad) ? 0 : cantidad);
    }, 0);
  }

  // CORREGIDO: Convertir a número correctamente
  get totalEntregado(): number {
    if (!this.solicitud.detalles) return 0;
    
    return this.solicitud.detalles.reduce((total, detalle) => {
      // Asegurar que sea número
      const cantidad = typeof detalle.cantidad_entregada === 'number' 
        ? detalle.cantidad_entregada 
        : parseFloat(detalle.cantidad_entregada as any);
      return total + (isNaN(cantidad) ? 0 : cantidad);
    }, 0);
  }

  // Formatear para mostrar (opcional)
  get totalSolicitadoFormateado(): string {
    const total = this.totalSolicitado;
    return total % 1 === 0 ? total.toString() : total.toFixed(2);
  }

  get totalEntregadoFormateado(): string {
    const total = this.totalEntregado;
    return total % 1 === 0 ? total.toString() : total.toFixed(2);
  }
}