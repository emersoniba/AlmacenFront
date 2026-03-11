import { Component, OnDestroy, OnInit } from '@angular/core';
import { ColDef, GridApi, GridOptions, GridReadyEvent, PaginationNumberFormatterParams } from 'ag-grid-community';
import { Subscription } from 'rxjs';
import { localeEs } from 'src/app/app.locale.es.grid';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { SwalAlertService } from 'src/app/utils/util.swal';
import Swal from 'sweetalert2';
import { HandleErrorMessage } from 'src/app/utils/handle.errors';
import { Producto } from 'src/app/models/producto.model';
import { ProductoService } from 'src/app/services/producto.service';
import { RendererComponent } from '../../bandejas/abrenderer/renderer.component';
import { MaterialFormComponent } from './material-form/material-form.component';

@Component({
    selector: 'app-material',
    templateUrl: './material.component.html',
    styleUrl: './material.component.scss'
})
export class MaterialComponent implements OnInit, OnDestroy {

    public dataProductos: Producto[] = [];
    private gridApi!: GridApi<Producto>;
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
        { field: 'id_ui', headerName: 'Opciones', filter: false, minWidth: 115, maxWidth: 115, cellRenderer: RendererComponent, pinned: true },
        { field: 'nombre', headerName: 'Nombre Material', filter: true, minWidth: 200, floatingFilter: true },
        { field: 'unidad_de_medida', headerName: 'Unidad de medida', filter: true, minWidth: 150, floatingFilter: true },
        { field: 'imagen', headerName: 'Imagen', filter: false, minWidth: 100, cellRenderer: (params: any) => 
            `<img src="${params.value}" width="50" height="50" onerror="this.src='assets/images/producto.png'">` 
        },
    ];

    constructor(
        private toastr: ToastrService,
        private dialog: MatDialog,
        private alertService: SwalAlertService,
        private productoService: ProductoService
    ) {}

    ngOnInit(): void {
        this.getAllProductos();
    }

    public getAllProductos() {
        this.formSubscription = this.productoService.getProductos().subscribe({
            next: (response) => {
                this.dataProductos = response;
            }, error: (err) => {
                this.dataProductos = [];
                this.toastr.error(HandleErrorMessage(err), 'Error');
            },
        });
    }

    public accionNuevo() {
        const dialogRef = this.dialog.open(MaterialFormComponent, {
            width: '600px',
            height: '500px',
            disableClose: true,
            data: {}
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.getAllProductos();
            }
        });
    }

    public OnActionClick(event: any) {
        const { action, rowId, data } = event;
        if (action.toLowerCase() === 'edit') {
            this.onActionEditar(data);
        }
        if (action.toLowerCase() === 'delete') {
            this.onActionEliminar(data);
        }
    }

    public onActionEditar(data: Producto) {
        const dialogRef = this.dialog.open(MaterialFormComponent, {
            width: '600px',
            height: '500px',
            disableClose: true,
            data: data
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.getAllProductos();
            }
        });
    }

    public onActionEliminar(data: Producto) {
        this.alertService.showConfirmationDialog('Eliminar registro', '¿Está seguro de eliminar este producto?')
            .then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        title: 'Espere un momento...',
                        didOpen: () => {
                            Swal.showLoading()
                        }
                    });
                    
                    this.productoService.deleteProducto(data.id_ui).subscribe({
                        next: (response) => {
                            this.toastr.success('Producto eliminado correctamente', 'Éxito');
                            this.getAllProductos();
                            Swal.close();
                        }, error: (err) => {
                            this.toastr.error(HandleErrorMessage(err), 'Error');
                            Swal.close();
                        }
                    });
                }
            });
    }

    onGridReady(params: GridReadyEvent<Producto>) {
        this.gridApi = params.api;
        this.gridApi.sizeColumnsToFit();
    }

    ngOnDestroy(): void {
        this.formSubscription?.unsubscribe();
        this.dialog.closeAll();
    }
}