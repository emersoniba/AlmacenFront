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

  get totalSolicitado(): number {
    return this.solicitud.detalles?.reduce((total, d) => total + d.cantidad_solicitada, 0) || 0;
  }

  get totalEntregado(): number {
    return this.solicitud.detalles?.reduce((total, d) => total + d.cantidad_entregada, 0) || 0;
  }
}