import { Component, OnDestroy, OnInit } from '@angular/core';
import { ColDef, GridApi, GridOptions, GridReadyEvent, PaginationNumberFormatterParams } from 'ag-grid-community';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { localeEs } from 'src/app/app.locale.es.grid';
import { Almacen, SubAlmacen } from 'src/app/models/almacen.model';
import { AlmacenService } from 'src/app/services/almacen.service';
import { SubAlmacenService } from 'src/app/services/subAlmacen.service';
import { RendererComponent } from '../../bandejas/abrenderer/renderer.component';
import { MatDialog } from '@angular/material/dialog';
import { AlmacenFormComponent } from './almacen-form/almacen-form.component';
import { SubAlmacenFormComponent } from './subalmacen-form/subalmacen-form.component';
import { SwalAlertService } from 'src/app/utils/util.swal';
import Swal from 'sweetalert2';
import { HandleErrorMessage } from 'src/app/utils/handle.errors';

@Component({
    selector: 'app-almacen',
    templateUrl: './almacen.component.html',
    styleUrl: './almacen.component.scss'
})
export class AlmacenComponent implements OnInit, OnDestroy {
    private gridApiAlmacen!: GridApi<Almacen>;
    private gridApiSubAlmacen!: GridApi<SubAlmacen>;
    
    public gridOptionsAlmacen: GridOptions = <GridOptions>{
        reactiveCustomComponents: true,
        components: {
            actionCellRenderer: RendererComponent
        },
        context: { componentParent: this }
    };

    public gridOptionsSubAlmacen: GridOptions = <GridOptions>{
        reactiveCustomComponents: true,
        components: {
            actionCellRenderer: RendererComponent
        },
        context: { componentParent: this }
    };

    private formSubscription: Subscription | undefined;
    public rowSelection: 'single' = 'single';

    public dataAlmacen: Almacen[] = [] as Almacen[];
    public dataObjectAlmacen: Almacen = {} as Almacen;
    public almacenSeleccionado: Almacen | null = null;

    public dataSubAlmacen: SubAlmacen[] = [] as SubAlmacen[];
    public dataSubAlmacenFiltrados: SubAlmacen[] = [] as SubAlmacen[];
    public dataObjectSubAlmacen: SubAlmacen = {} as SubAlmacen;

    public localEs = localeEs;
    public paginationPageSize = 10;
    public paginationPageSizeSelector: number[] | boolean = [10, 20, 50];
    public paginationNumberFormatter: (params: PaginationNumberFormatterParams) => string = (params: PaginationNumberFormatterParams) => {
        return params.value.toLocaleString();
    };

    columnDefsAlmacen: ColDef[] = [
        { field: 'id', headerName: 'Opciones', filter: false, minWidth: 115, maxWidth: 115, cellRenderer: RendererComponent, pinned: true },
        { field: 'nombre', headerName: 'Denominacion de Almacen', filter: true, minWidth: 450, maxWidth: 550, floatingFilter: true },
        { field: 'sigla', headerName: 'Sigla del Almacen', filter: true, minWidth: 250, maxWidth: 250, floatingFilter: true },
    ];

    columnDefsSubAlmacen: ColDef[] = [
        { field: 'id', headerName: 'Opciones', filter: false, minWidth: 115, maxWidth: 115, cellRenderer: RendererComponent, pinned: true },
        { field: 'nombre', headerName: 'Sub Almacen', filter: true, floatingFilter: true, minWidth: 300, maxWidth: 300 },
        { field: 'sigla', headerName: 'Sigla Sub Almacen', filter: true, floatingFilter: true, minWidth: 250, maxWidth: 250 },
    ];

    constructor(
        private almacenService: AlmacenService,
        private subAlmacenService: SubAlmacenService,
        private toastr: ToastrService,
        private dialog: MatDialog,
        private alertService: SwalAlertService
    ) { }

    ngOnInit(): void {
        this.getAllAlmacenes();
        this.getAllSubAlmacenes();
    }

    public onSelectionChanged(e: any) {
        const data = this.gridApiAlmacen.getSelectedRows();
        this.dataObjectAlmacen = data.length > 0 ? data[0] : {} as Almacen;
    }

    public onSelectionChangedSubAlmacen(e: any) {
        const data = this.gridApiSubAlmacen.getSelectedRows();
        this.dataObjectSubAlmacen = data.length > 0 ? data[0] : {} as SubAlmacen;
    }

    public onAlmacenDoubleClick(event: any): void {
        if (event.data) {
            this.almacenSeleccionado = event.data;
            this.filtrarSubAlmacenes();
        }
    }

    private filtrarSubAlmacenes(): void {
        if (this.almacenSeleccionado) {
            this.dataSubAlmacenFiltrados = this.dataSubAlmacen.filter(
                subAlmacen => subAlmacen.idAlmacen === this.almacenSeleccionado!.id
            );
        } else {
            this.dataSubAlmacenFiltrados = [];
        }
    }

    public limpiarSeleccion(): void {
        this.almacenSeleccionado = null;
        this.dataSubAlmacenFiltrados = [];
        this.gridApiAlmacen.deselectAll();
    }

    public getAllAlmacenes() {
        this.formSubscription = this.almacenService.getAlmacenes().subscribe({
            next: (response: any) => {
                if (response && response.data && Array.isArray(response.data)) {
                    this.dataAlmacen = response.data;
                } else if (Array.isArray(response)) {
                    this.dataAlmacen = response;
                } else {
                    this.dataAlmacen = [];
                }
            },
            error: (err) => {
                this.dataAlmacen = [] as Almacen[];
                this.toastr.error(HandleErrorMessage(err), 'Error');
            },
        });
    }

    public getAllSubAlmacenes() {
        Swal.fire({
			title: 'Cargando Sub Almacenes...',
			text: 'Por favor esperar',
			icon: 'info',
			allowOutsideClick: false,
			didOpen: () => Swal.showLoading()
		});
        this.formSubscription = this.subAlmacenService.getSubAlmacenes().subscribe({
            next: (response) => {
                Swal.close();
                this.dataSubAlmacen = response;
                if (this.almacenSeleccionado) {
                    this.filtrarSubAlmacenes();
                }
            },
            error: (err) => {
                this.dataSubAlmacen = [] as SubAlmacen[];
                this.dataSubAlmacenFiltrados = [] as SubAlmacen[];
                this.toastr.error(HandleErrorMessage(err), 'Error');
                Swal.close();

            },
        });
    }

    public accionNuevoAlmacen() {
        const dialogRef = this.dialog.open(AlmacenFormComponent, {
            width: '500px',
            height: '330px',
            minWidth: '500wv',
            minHeight: '330hv',
            disableClose: true,
            hasBackdrop: false,
            data: {}
        });

        dialogRef.afterClosed().subscribe(
            result => {
                if (result !== null) {
                    this.getAllAlmacenes();
                }
            }
        );
    }

    public accionNuevoSubAlmacen() {
        if (!this.almacenSeleccionado) {
            this.toastr.warning('Debe seleccionar un almacén primero', 'Advertencia');
            return;
        }

        const dialogRef = this.dialog.open(SubAlmacenFormComponent, {
            width: '500px',
            height: '500px',
           // minWidth: '500wv',
           // minHeight: '410hv',
            disableClose: true,
            hasBackdrop: false,
            data: {
                almacenPadre: this.almacenSeleccionado
            }
        });

        dialogRef.afterClosed().subscribe(
            result => {
                if (result !== null) {
                    this.getAllSubAlmacenes();
                }
            }
        );
    }

    public OnActionClick(event: any) {
        const { action, rowId, data } = event;
        
        if (action.toLowerCase() === 'edit' && data.idAlmacen == undefined) {
            this.onActionEditarAlmacen(rowId, data);
        }
        if (action.toLowerCase() === 'delete' && data.idAlmacen == undefined) {
            this.onActionEliminarAlmacen(rowId, data);
        }
    
        if (action.toLowerCase() === 'edit' && data.idAlmacen) {
            this.onActionEditarSubAlmacen(rowId, data);
        }
        if (action.toLowerCase() === 'delete' && data.idAlmacen) {
            this.onActionEliminarSubAlmacen(rowId, data);
        }
    }

    public onActionEditarAlmacen(pk: string, data: Almacen) {
        const dialogRef = this.dialog.open(AlmacenFormComponent, {
            width: '500px',
            height: '330px',
            minWidth: '500wv',
            minHeight: '330hv',
            disableClose: true,
            hasBackdrop: false,
            data: data
        });

        dialogRef.afterClosed().subscribe(
            result => {
                if (result !== null && result !== undefined) {
                    this.getAllAlmacenes();
                }
            }
        );
    }

    public onActionEditarSubAlmacen(pk: string, data: SubAlmacen) {
        const dialogRef = this.dialog.open(SubAlmacenFormComponent, {
            width: '500px',
            height: '410px',
            minWidth: '500wv',
            minHeight: '410hv',
            disableClose: true,
            hasBackdrop: false,
            data: data
        });

        dialogRef.afterClosed().subscribe(
            result => {
                if (result !== null) {
                    this.getAllSubAlmacenes();
                }
            }
        );
    }

    public onActionEliminarAlmacen(pk: string, data: Almacen) {
        this.alertService.showConfirmationDialog('Eliminar registro', 'Esta usted seguro de realizar esta acción?')
            .then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        title: 'Espere un momento . .  .',
                        didOpen: () => {
                            Swal.showLoading()
                        }
                    });
                    this.almacenService.deleteAlmacen(pk).subscribe({
                        next: (response) => {
                            this.toastr.success('Acción realizada de manera correcta', 'Registro eliminado');
                            this.getAllAlmacenes();
                            if (this.almacenSeleccionado && this.almacenSeleccionado.id === pk) {
                                this.limpiarSeleccion();
                            }
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

    public onActionEliminarSubAlmacen(pk: string, data: SubAlmacen) {
        this.alertService.showConfirmationDialog('Eliminar registro', 'Esta usted seguro de realizar esta acción?')
            .then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        title: 'Espere un momento . .  .',
                        didOpen: () => {
                            Swal.showLoading()
                        }
                    });
                    this.subAlmacenService.deleteSubAlmacen(pk).subscribe({
                        next: (response) => {
                            this.toastr.success('Acción realizada de manera correcta', 'Registro eliminado');
                            this.getAllSubAlmacenes();
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

    onGridReadyAlmacen(params: GridReadyEvent<Almacen>) {
        this.gridApiAlmacen = params.api;
        this.gridApiAlmacen.sizeColumnsToFit();
    }

    onGridReadySubAlmacen(params: GridReadyEvent<SubAlmacen>) {
        this.gridApiSubAlmacen = params.api;
        this.gridApiSubAlmacen.sizeColumnsToFit();
    }

    ngOnDestroy(): void {
        this.formSubscription?.unsubscribe();
        this.dialog.closeAll();
    }
}