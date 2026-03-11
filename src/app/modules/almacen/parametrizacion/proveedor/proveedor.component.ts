import { Component, OnDestroy, OnInit } from '@angular/core';
import { ColDef, GridApi, GridOptions, GridReadyEvent, PaginationNumberFormatterParams } from 'ag-grid-community';
import { Subscription } from 'rxjs';
import { localeEs } from 'src/app/app.locale.es.grid';
import { Proveedor } from 'src/app/models/proveedor.model';
import { RendererComponent } from '../../bandejas/abrenderer/renderer.component';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { SwalAlertService } from 'src/app/utils/util.swal';
import { ProveedorService } from 'src/app/services/proveedor.service';
import { ProveedorFormComponent } from './proveedor-form/proveedor-form.component';
import Swal from 'sweetalert2';
import { HandleErrorMessage } from 'src/app/utils/handle.errors';


@Component({
    selector: 'app-proveedor',
    templateUrl: './proveedor.component.html',
    styleUrl: './proveedor.component.scss'
})
export class ProveedorComponent implements OnInit, OnDestroy {

    public dataProveedor: Proveedor[] = [] as Proveedor[];
    private gridApi!: GridApi<Proveedor>;
    private gridColumnApi: any;
    public gridOptions: GridOptions = <GridOptions>{
        reactiveCustomComponents: true,
        components: {
            actionCellRenderer: RendererComponent
        },
        context: { componentParent: this }
    };
    private formSubscription: Subscription | undefined;
    public rowSelection: 'single' = 'single';
    public localEs = localeEs;
    public paginationPageSize = 10;
    public paginationPageSizeSelector: number[] | boolean = [10, 20, 50];
    public paginationNumberFormatter: (params: PaginationNumberFormatterParams) => string = (params: PaginationNumberFormatterParams) => {
        return params.value.toLocaleString();
    };

    columnDefs: ColDef[] = [
        { field: 'id', headerName: 'Opciones', filter: false, minWidth: 115, maxWidth: 115, cellRenderer: RendererComponent, pinned: true },
        { field: 'nit', headerName: 'NIT', filter: true, minWidth: 150, maxWidth: 250, floatingFilter: true },
        { field: 'razonSocial', headerName: 'Razón Social', filter: true, minWidth: 350, maxWidth: 550, floatingFilter: true },
        { field: 'direccion', headerName: 'Dirección del Proveedor', filter: true, minWidth: 450, maxWidth: 600, floatingFilter: true },
    ];

    constructor(
        private toastr: ToastrService,
        private dialog: MatDialog,
        private alertService: SwalAlertService,
        private proveedorService: ProveedorService
    ) {
    }

    ngOnInit(): void {
        this.getAllProveedores();
    }

    public getAllProveedores() {
        this.formSubscription = this.proveedorService.getProveedores().subscribe({
            next: (response) => {
                this.dataProveedor = response;
            }, error: (err) => {
                this.dataProveedor = [] as Proveedor[];
                this.toastr.error(HandleErrorMessage(err), 'Error');
            },
        });
    }

    public accionNuevo() {
        const dialogRef = this.dialog.open(ProveedorFormComponent, {
            width: '500px',
            height: '420px',
            minWidth: '500wv',
            minHeight: '420hv',
            disableClose: true,
            hasBackdrop: false,
            data: {}
        });

        dialogRef.afterClosed().subscribe(
            result => {
                if (result !== null) {
                    this.getAllProveedores();
                }
            }
        );
    }

    public OnActionClick(event: any) {
        const { action, rowId, data } = event;
        if (action.toLowerCase() === 'edit') {
            this.onActionEditar(rowId, data);
        }
        if (action.toLowerCase() === 'delete') {
            this.onActionEliminar(rowId, data);
        }
    }

    public onActionEditar(pk: string, data: Proveedor) {
        const dialogRef = this.dialog.open(ProveedorFormComponent, {
            width: '500px',
            height: '420px',
            minWidth: '500wv',
            minHeight: '420hv',
            disableClose: true,
            hasBackdrop: false,
            data: data
        });

        dialogRef.afterClosed().subscribe(
            result => {
                if (result !== null) {
                    this.getAllProveedores();
                }
            }
        );
    }

    public onActionEliminar(pk: string, data: Proveedor) {
        this.alertService.showConfirmationDialog('Eliminar registro', 'Esta usted seguro de realizar esta acción?')
            .then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        title: 'Espere un momento . .  .',
                        didOpen: () => {
                            Swal.showLoading()
                        }
                    });
                    this.proveedorService.deleteProveedor(pk).subscribe({
                        next: (response) => {
                            this.toastr.success('Acción realizada de manera correcta', 'Registro eliminado');
                            this.getAllProveedores();
                            Swal.close();
                        }, error: (err) => {
                            this.toastr.error(HandleErrorMessage(err), 'Error');
                            Swal.close();
                        }
                    });
                }
            });
    }

    onGridReady(params: GridReadyEvent<Proveedor>) {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        this.gridApi.sizeColumnsToFit();
    }

    ngOnDestroy(): void {
        this.formSubscription?.unsubscribe();
    }
}
