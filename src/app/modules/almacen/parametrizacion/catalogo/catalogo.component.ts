import { Component, OnDestroy, OnInit } from '@angular/core';
import { ColDef, GridApi, GridOptions, GridReadyEvent, PaginationNumberFormatterParams } from "ag-grid-community";
import { localeEs } from "src/app/app.locale.es.grid";
import { Catalogo } from 'src/app/models/catalogo.model';
import { RendererComponent } from '../../bandejas/abrenderer/renderer.component';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { SwalAlertService } from 'src/app/utils/util.swal';
import { CatalogoService } from 'src/app/services/catalogo.service';
import { CatalogoFormComponent } from './catalogo-form/catalogo-form.component';
import Swal from 'sweetalert2';
import { HandleErrorMessage } from 'src/app/utils/handle.errors';


@Component({
    selector: 'app-catalogo',
    templateUrl: './catalogo.component.html',
    styleUrl: './catalogo.component.scss'
})
export class CatalogoComponent implements OnInit, OnDestroy {

    public dataCatalogo: Catalogo[] = [] as Catalogo[];
    private gridApi!: GridApi<Catalogo>;
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
        { field: 'descripcion', headerName: 'Descripción', filter: true, minWidth: 550, maxWidth: 650, floatingFilter: true },
        { field: 'categoria', headerName: 'Categoria', filter: true, minWidth: 450, maxWidth: 550, floatingFilter: true },
    ];

    constructor(
        private toastr: ToastrService,
        private dialog: MatDialog,
        private alertService: SwalAlertService,
        private catologoService: CatalogoService
    ) {
    }

    ngOnInit(): void {
        this.getAllCatalogos();
    }

    public getAllCatalogos() {
        this.formSubscription = this.catologoService.getCatalogos().subscribe({
            next: (response) => {
                this.dataCatalogo = response;
            }, error: (err) => {
                this.dataCatalogo = [] as Catalogo[];
                this.toastr.error(HandleErrorMessage(err), 'Error');
            },
        });
    }

    public accionNuevo() {
        const dialogRef = this.dialog.open(CatalogoFormComponent, {
            width: '500px',
            height: '400px',
            minWidth: '500wv',
            minHeight: '400hv',
            disableClose: true,
            hasBackdrop: false,
            data: {}
        });

        dialogRef.afterClosed().subscribe(
            result => {
                if (result !== null) {
                    this.getAllCatalogos();
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

    public onActionEditar(pk: string, data: Catalogo) {
        const dialogRef = this.dialog.open(CatalogoFormComponent, {
            width: '500px',
            height: '400px',
            minWidth: '500wv',
            minHeight: '400hv',
            disableClose: true,
            hasBackdrop: false,
            data: data
        });

        dialogRef.afterClosed().subscribe(
            result => {
                if (result !== null) {
                    this.getAllCatalogos();
                }
            }
        );
    }

    public onActionEliminar(pk: string, data: Catalogo) {
        this.alertService.showConfirmationDialog('Eliminar registro', 'Esta usted seguro de realizar esta acción?')
            .then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        title: 'Espere un momento . .  .',
                        didOpen: () => {
                            Swal.showLoading()
                        }
                    });
                    this.catologoService.deleteCatalogo(pk).subscribe({
                        next: (response) => {
                            this.toastr.success('Acción realizada de manera correcta', 'Registro eliminado');
                            this.getAllCatalogos();
                            Swal.close();
                        }, error: (err) => {
                            this.toastr.error(HandleErrorMessage(err), 'Error');
                            Swal.close();
                        }
                    });
                }
            });
    }

    onGridReady(params: GridReadyEvent<Catalogo>) {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        this.gridApi.sizeColumnsToFit();
    }

    ngOnDestroy(): void {
        this.formSubscription?.unsubscribe();
        this.dialog.closeAll();

    }
}
