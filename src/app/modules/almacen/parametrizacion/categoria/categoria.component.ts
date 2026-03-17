import { Component, OnDestroy, OnInit } from '@angular/core';
import { ColDef, GridApi, GridOptions, GridReadyEvent, PaginationNumberFormatterParams } from "ag-grid-community";
import { localeEs } from "src/app/app.locale.es.grid";
import { Categoria } from 'src/app/models/categoria.model';
import { RendererComponent } from '../../bandejas/abrenderer/renderer.component';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { SwalAlertService } from 'src/app/utils/util.swal';
import { CategoriaService } from 'src/app/services/categoria.service';
import { CategoriaFormComponent } from './categoria-form/categoria-form.component';
import Swal from 'sweetalert2';
import { HandleErrorMessage } from 'src/app/utils/handle.errors';


@Component({
    selector: 'app-categoria',
    templateUrl: './categoria.component.html',
    styleUrl: './categoria.component.scss'
})
export class CategoriaComponent implements OnInit, OnDestroy {

    public dataCatalogo: Categoria[] = [] as Categoria[];
    private gridApi!: GridApi<Categoria>;
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
        { field: 'nombre', headerName: 'Categoria', filter: true, minWidth: 450, maxWidth: 550, floatingFilter: true },
    ];

    constructor(
        private toastr: ToastrService,
        private dialog: MatDialog,
        private alertService: SwalAlertService,
        private categoriaService: CategoriaService
    ) {
    }

    ngOnInit(): void {
        this.getAllCatalogos();
    }

    public getAllCatalogos() {
        this.formSubscription = this.categoriaService.getCategorias().subscribe({
            next: (response) => {
                this.dataCatalogo = response;
            }, error: (err) => {
                this.dataCatalogo = [] as Categoria[];
                this.toastr.error(HandleErrorMessage(err), 'Error');
            },
        });
    }

    public accionNuevo() {
        const dialogRef = this.dialog.open(CategoriaFormComponent, {
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

    public onActionEditar(pk: string, data: Categoria) {
        const dialogRef = this.dialog.open(CategoriaFormComponent, {
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

    public onActionEliminar(pk: string, data: Categoria) {
        this.alertService.showConfirmationDialog('Eliminar registro', 'Esta usted seguro de realizar esta acción?')
            .then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        title: 'Espere un momento . .  .',
                        didOpen: () => {
                            Swal.showLoading()
                        }
                    });
                    this.categoriaService.deleteCategoria(Number(pk)).subscribe({
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

    onGridReady(params: GridReadyEvent<Categoria>) {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        this.gridApi.sizeColumnsToFit();
    }

    ngOnDestroy(): void {
        this.formSubscription?.unsubscribe();
        this.dialog.closeAll();

    }
}
