import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
    selector: 'app-renderer',
    templateUrl: './renderer2.component.html',
    styleUrls: ['./renderer2.component.css']
})
export class RendererComponent2 implements ICellRendererAngularComp {
    params!: ICellRendererParams;
    mostrarEditar: boolean = false;
    mostrarEliminar: boolean = false;
    mostrarEnviar: boolean = false;
    mostrarVer: boolean = true;

    agInit(params: ICellRendererParams): void {
        this.params = params;
        const data = params.data;
        
        if (data) {
            const estado = data.estado_codigo;
            
            // Botón Editar: solo si está pendiente
            this.mostrarEditar = estado === 'PENDIENTE';
            
            // Botón Eliminar: solo si está pendiente
            this.mostrarEliminar = estado === 'PENDIENTE';
            
            // Botón Enviar: solo si está pendiente
            this.mostrarEnviar = estado === 'PENDIENTE';
            
            // Botón Ver: siempre visible
            this.mostrarVer = true;
        }
    }

    onActionClicked(action: string): void {
        const rowId = this.params.data.id;
        const data = this.params.data;
        if (this.params.context && this.params.context.componentParent) {
            this.params.context.componentParent.OnActionClick({ action, rowId, data });
        }
    }

    refresh(params: ICellRendererParams): boolean {
        this.agInit(params);
        return true;
    }
}