import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Solicitud } from 'src/app/models/solicitud.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-detalles-atendida',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-detalle-atendida.component.html',
  styleUrls: ['./modal-detalle-atendida.component.scss']
})
export class ModalDetallesAtendidaComponent {
  constructor(
    public dialogRef: MatDialogRef<ModalDetallesAtendidaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { solicitud: Solicitud }
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

  get totalSolicitado(): number {
    return this.data.solicitud.detalles?.reduce((total, d) => total + d.cantidad_solicitada, 0) || 0;
  }

  get totalEntregado(): number {
    return this.data.solicitud.detalles?.reduce((total, d) => total + d.cantidad_entregada, 0) || 0;
  }
}