import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { AprobadorComponent } from '../aprobador.component';

@Component({
  selector: 'app-action-renderer',
  standalone: true,
  imports: [],
  template: `
    <button (click)="onClick()" class="btn btn-primary btn-sm" style="border-radius: 8px;">
      Ver Detalles
    </button>
  `
})
export class ActionRendererComponent implements ICellRendererAngularComp {
  
  private params!: ICellRendererParams;
  private componentParent!: AprobadorComponent;

  agInit(params: ICellRendererParams): void {
    this.params = params;
    this.componentParent = params.context.componentParent; 
  }

  refresh(params: ICellRendererParams): boolean {
    return false;
  }

  onClick(): void {
    if (this.componentParent) {
      this.componentParent.verDetallesAprobacion(this.params.data);
    }
  }
}