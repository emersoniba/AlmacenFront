import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SolicitudAtendida } from 'src/app/models/solicitud-atendida.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-detalles-atendida',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './modal-detalle-atendida.component.html',
  styleUrls: ['./modal-detalle-atendida.component.scss']

})
export class ModalDetallesAtendidaComponent {
  constructor(
    public dialogRef: MatDialogRef<ModalDetallesAtendidaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { atendida: SolicitudAtendida }
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }
}