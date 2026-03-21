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
        { field: 'id', headerName: 'Opciones', filter: false, minWidth: 115, maxWidth: 115, cellRenderer: RendererComponent, pinned: true },
        { field: 'codigo', headerName: 'Código', filter: true, minWidth: 120, floatingFilter: true },
        { field: 'nombre', headerName: 'Material', filter: true, minWidth: 250, floatingFilter: true },
        { field: 'unidad_medida_abrev', headerName: 'Unidad', filter: true, minWidth: 100, floatingFilter: true },
        { field: 'categoria_nombre', headerName: 'Categoría', filter: true, minWidth: 150, floatingFilter: true },
        { 
            field: 'stock_total', 
            headerName: 'Stock Total', 
            filter: true, 
            minWidth: 120,
            cellRenderer: (params: any) => {
                const stock = params.value;
                const stockMinimo = params.data?.stock_minimo;
                let clase = 'text-success';
                if (stock <= 0) {
                    clase = 'text-danger';
                } else if (stockMinimo && stock <= stockMinimo) {
                    clase = 'text-warning';
                }
                return `<span class="${clase} fw-bold">${stock}</span>`;
            }
        },
        { 
            field: 'stock_minimo', 
            headerName: 'Stock Mínimo', 
            filter: true, 
            minWidth: 120 
        },
        { 
            field: 'imagen', 
            headerName: 'Imagen', 
            filter: false, 
            minWidth: 100,
            cellRenderer: (params: any) => {
                if (params.value) {
                    return `<img src="${params.value}" width="50" height="50" style="object-fit:cover; border-radius:5px;" onerror="this.src='assets/images/producto.png'">`;
                }
                return `<img src="assets/images/producto.png" width="50" height="50" style="object-fit:cover; border-radius:5px;">`;
            }
        }
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

    public getAllProductos(): void {
        this.formSubscription = this.productoService.getProductos().subscribe({
            next: (response) => {
                this.dataProductos = response;
            },
            error: (err) => {
                this.dataProductos = [];
                this.toastr.error(HandleErrorMessage(err), 'Error');
            }
        });
    }

    public accionNuevo(): void {
        const dialogRef = this.dialog.open(MaterialFormComponent, {
            width: '600px',
            disableClose: true,
            data: {}
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.getAllProductos();
            }
        });
    }

    public OnActionClick(event: any): void {
        const { action, rowId, data } = event;
        if (action.toLowerCase() === 'edit') {
            this.onActionEditar(data);
        }
        if (action.toLowerCase() === 'delete') {
            this.onActionEliminar(data);
        }
        if (action.toLowerCase() === 'view-stock') {
            this.onActionVerStock(data);
        }
    }

    public onActionEditar(data: Producto): void {
        const dialogRef = this.dialog.open(MaterialFormComponent, {
            width: '600px',
            disableClose: true,
            data: data
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.getAllProductos();
            }
        });
    }

    public onActionEliminar(data: Producto): void {
        this.alertService.showConfirmationDialog('Eliminar Producto', '¿Está seguro de eliminar este producto?')
            .then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        title: 'Eliminando...',
                        didOpen: () => Swal.showLoading()
                    });
                    
                    this.productoService.deleteProducto(data.id).subscribe({
                        next: () => {
                            this.toastr.success('Producto eliminado correctamente', 'Éxito');
                            this.getAllProductos();
                            Swal.close();
                        },
                        error: (err) => {
                            this.toastr.error(HandleErrorMessage(err), 'Error');
                            Swal.close();
                        }
                    });
                }
            });
    }

    public onActionVerStock(data: Producto): void {
        // Mostrar modal con detalles de stock por subalmacén
        if (!data.stocks || data.stocks.length === 0) {
            this.toastr.info('No hay stock registrado para este producto', 'Información');
            return;
        }
        
        let mensaje = '<div class="table-responsive"><table class="table table-sm">';
        mensaje += '<thead><tr><th>Subalmacén</th><th>Cantidad</th><th>Ubicación</th></tr></thead><tbody>';
        data.stocks.forEach((stock: any) => {
            mensaje += `<tr>
                <td>${stock.subalmacen_nombre}</td>
                <td class="fw-bold">${stock.cantidad}</td>
                <td>${stock.ubicacion || '-'}</td>
            </tr>`;
        });
        mensaje += '</tbody></table></div>';
        
        Swal.fire({
            title: `Stock de ${data.nombre}`,
            html: mensaje,
            icon: 'info',
            confirmButtonText: 'Cerrar'
        });
    }

    onGridReady(params: GridReadyEvent<Producto>): void {
        this.gridApi = params.api;
        setTimeout(() => {
            this.gridApi.sizeColumnsToFit();
        }, 100);
    }

    ngOnDestroy(): void {
        this.formSubscription?.unsubscribe();
        this.dialog.closeAll();
    }
}