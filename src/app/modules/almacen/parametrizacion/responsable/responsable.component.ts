import { Component, OnDestroy, OnInit } from '@angular/core';
import { ColDef, GridApi, GridOptions, GridReadyEvent, PaginationNumberFormatterParams } from 'ag-grid-community';
import { Subscription } from 'rxjs';
import { localeEs } from 'src/app/app.locale.es.grid';
import { RendererComponent } from '../../bandejas/abrenderer/renderer.component';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { SwalAlertService } from 'src/app/utils/util.swal';
import Swal from 'sweetalert2';
import { ResponsableAlmacen } from 'src/app/models/responsableAlmacen.model';
import { ResponsableAlmacenService } from 'src/app/services/responsableAlmacen.service';
import { ResponsableFormComponent } from './responsable-form/responsable-form.component';
import moment from 'moment';
import { HandleErrorMessage } from 'src/app/utils/handle.errors';


@Component({
    selector: 'app-responsable',
    templateUrl: './responsable.component.html',
    styleUrl: './responsable.component.scss'
})
export class ResponsableComponent implements OnInit, OnDestroy {

    public dataResponsable: ResponsableAlmacen[] = [] as ResponsableAlmacen[];
    private gridApi!: GridApi<ResponsableAlmacen>;
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
        { field: 'idAlmacen', headerName: 'Almacen', filter: true, minWidth: 400, maxWidth: 400, floatingFilter: true },
        { field: 'idResponsable', headerName: 'Responsable', filter: true, minWidth: 400, maxWidth: 400, floatingFilter: true },
        {
            field: 'fechaDesde', headerName: 'Fecha Desde', minWidth: 250, maxWidth: 250,
            valueFormatter: (param) => { return moment(param.value).format("DD/MM/YYYY") },
            filter: "agDateColumnFilter",
            floatingFilter: true,
            filterParams: {
                comparator: this.dateFilterAgGrid
            }
        },
        {
            field: 'fechaHasta', headerName: 'Fecha Hasta', minWidth: 250, maxWidth: 250,
            valueFormatter: (param) => { return moment(param.value).format("DD/MM/YYYY") },
            filter: "agDateColumnFilter",
            floatingFilter: true,
            filterParams: {
                comparator: this.dateFilterAgGrid
            }
        },
    ];

    constructor(
        private toastr: ToastrService,
        private dialog: MatDialog,
        private alertService: SwalAlertService,
        private responsableService: ResponsableAlmacenService
    ) {
    }

    ngOnInit(): void {
        this.getAllResponsables();
    }

    public getAllResponsables() {
        this.formSubscription = this.responsableService.getResponsableAlmacenes().subscribe({
            next: (response) => {
                this.dataResponsable = response;
            }, error: (err) => {
                this.dataResponsable = [] as ResponsableAlmacen[];
                this.toastr.error(HandleErrorMessage(err), 'Error');
            },
        });
    }

    public dateFilterAgGrid(filter: Date, value: string) {
        const cellFilter = moment(filter).format('YYYY-MM-DD');
        const cellValue = moment(new Date(value)).format('YYYY-MM-DD');
        const filterOrigin = moment(cellFilter, 'YYYY-MM-DD', true);
        const valueOrigin = moment(cellValue, 'YYYY-MM-DD', true);
        if (filterOrigin.isAfter(valueOrigin)) {
            return -1;
        } else if (filterOrigin.isBefore(valueOrigin)) {
            return 1;
        } else {
            return 0;
        }
    }

    public accionNuevo() {
        const dialogRef = this.dialog.open(ResponsableFormComponent, {
            width: '600px',
            height: '410px',
            minWidth: '600wv',
            minHeight: '410hv',
            disableClose: true,
            hasBackdrop: false,
            data: {}
        });

        dialogRef.afterClosed().subscribe(
            result => {
                if (result !== null) {
                    this.getAllResponsables();
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

    public onActionEditar(pk: string, data: ResponsableAlmacen) {
        const dialogRef = this.dialog.open(ResponsableFormComponent, {
            width: '600px',
            height: '410px',
            minWidth: '600wv',
            minHeight: '410hv',
            disableClose: true,
            hasBackdrop: false,
            data: data
        });

        dialogRef.afterClosed().subscribe(
            result => {
                if (result !== null) {
                    this.getAllResponsables();
                }
            }
        );
    }

    public onActionEliminar(pk: string, data: ResponsableAlmacen) {
        this.alertService.showConfirmationDialog('Eliminar registro', 'Esta usted seguro de realizar esta acción?')
            .then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        title: 'Espere un momento . .  .',
                        didOpen: () => {
                            Swal.showLoading()
                        }
                    });
                    this.responsableService.deleteResponsableAlmacen(pk).subscribe({
                        next: (response) => {
                            this.toastr.success('Acción realizada de manera correcta', 'Registro eliminado');
                            this.getAllResponsables();
                            Swal.close();
                        }, error: (err) => {
                            this.toastr.error(HandleErrorMessage(err), 'Error');
                            Swal.close();
                        }
                    });
                }
            });
    }

    onGridReady(params: GridReadyEvent<ResponsableAlmacen>) {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        this.gridApi.sizeColumnsToFit();
    }

    ngOnDestroy(): void {
        this.formSubscription?.unsubscribe();
    }
}
