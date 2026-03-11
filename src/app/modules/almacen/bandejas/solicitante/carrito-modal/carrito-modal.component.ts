import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Producto } from 'src/app/models/producto.model';

@Component({
  selector: 'app-carrito-modal',
  templateUrl: './carrito-modal.component.html',
  styleUrls: ['./carrito-modal.component.scss']
})
export class CarritoModalComponent {
  onSolicitarCallback: () => void;
  constructor(
    public dialogRef: MatDialogRef<CarritoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      productos: Producto[],
      onSolicitar: () => void
    }
  ) {this.onSolicitarCallback = data.onSolicitar;}

  onClose(): void {
    this.dialogRef.close();
  }

  getTotalItems(): number {
    return this.data.productos.filter(p => p.selected && p.cantidad > 0).length;
  }

  getTotalCantidad(): number {
    return this.data.productos
      .filter(p => p.selected && p.cantidad > 0)
      .reduce((total, producto) => total + producto.cantidad, 0);
  }
   onActionSolicitar(): void {
        this.onSolicitarCallback(); 
        this.dialogRef.close('solicitar');
    }

}