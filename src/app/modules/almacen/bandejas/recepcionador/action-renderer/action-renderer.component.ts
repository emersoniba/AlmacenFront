import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { Aprobacion } from 'src/app/models/aprobacion.model';

@Component({
  selector: 'app-action-renderer-recepcionador',
  template: `
    <div class="action-buttons">
      <button class="btn btn-sm btn-primary " (click)="onViewClick()" title="Gestionar entrega" style="border-radius: 8px;">
        <i class="fas fa-truck-loading me-1" ></i>
        Gestionar
      </button>
    </div>
  `,
  styles: [`
    .action-buttons {
      display: flex;
      gap: 5px;
      justify-content: center;
    }
    .btn-sm {
      padding: 0.25rem 0.5rem;
      font-size: 0.75rem;
    }
  `]
})
export class ActionRendererRecepcionadorComponent implements ICellRendererAngularComp {
  private params: any;

  agInit(params: ICellRendererParams): void {
    this.params = params;
  }

  refresh(params: ICellRendererParams): boolean {
    return false;
  }

  onViewClick(): void {
    if (this.params.context && this.params.context.componentParent) {
      this.params.context.componentParent.verDetallesRecepcion(this.params.data as Aprobacion);
    }
  }
}