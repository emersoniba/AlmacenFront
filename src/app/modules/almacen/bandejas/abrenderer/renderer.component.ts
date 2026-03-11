import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';


@Component({
    selector: 'app-renderer',
    templateUrl: './renderer.component.html',
    styleUrl: './renderer.component.css'
})
export class RendererComponent implements ICellRendererAngularComp{

    params: ICellRendererParams;

    agInit(params: ICellRendererParams): void {
        this.params = params;
    }

    onActionClicked(action: string): void {
        const rowId = this.params.data.id;
        const data = this.params.data;
        this.params.context.componentParent.OnActionClick({action, rowId, data});
    }

    refresh(params: ICellRendererParams) {
        return true;
    }
}
