import { Component } from '@angular/core';
import { ICellRendererParams } from 'ag-grid-community';
import { CommonModule } from '@angular/common';
import { AtendidasComponent } from '../atendidas.component';

@Component({
  selector: 'app-action-detalle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button (click)="onClick()" class="btn btn-primary btn-sm" style="border-radius: 8px;">
      <i class="ti ti-eye me-1"></i>
      Ver Detalles
    </button>
  `,
  styleUrls: ['./action-detalle.component.scss']
})
export class ActionDetalleComponent {
  private params!: ICellRendererParams;
  private parentComponent!: AtendidasComponent;

  agInit(params: ICellRendererParams): void {
    this.params = params;
    this.parentComponent = params.context.parentComponent;
  }

  refresh(params: ICellRendererParams): boolean {
    return false;
  }

  onClick(): void {
    if (this.parentComponent) {
      this.parentComponent.verDetalles(this.params.data.id);
    }
  }
}