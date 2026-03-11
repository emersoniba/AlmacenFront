import { Component, OnDestroy, OnInit } from '@angular/core';
import { ColDef, GridApi, GridOptions, PaginationNumberFormatterParams } from 'ag-grid-community';
import { Ingreso } from 'src/app/models/ingreso.model';
import { RendererComponent } from '../../bandejas/abrenderer/renderer.component';
import { localeEs } from 'src/app/app.locale.es.grid';
import moment from 'moment';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { IngresoFormComponent } from './ingreso-form/ingreso-form.component';
import { SwalAlertService } from 'src/app/utils/util.swal';
import Swal from 'sweetalert2';
import { IngresoService } from 'src/app/services/ingreso.service';
import { HandleErrorMessage } from 'src/app/utils/handle.errors';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-ingreso',
    templateUrl: './ingreso.component.html',
    styleUrl: './ingreso.component.css'
})
export class IngresoComponent implements OnInit, OnDestroy {

    private gridApi!: GridApi<Ingreso>;
    private gridColumnApi: unknown;
    public gridOptions: GridOptions = <GridOptions>{
        reactiveCustomComponents: true,
        components: {
            actionCellRenderer: RendererComponent
        },
        context: { componentParent: this }
    };

    public showForm: boolean = false;
    public dataIngreso: Ingreso[] = [] as Ingreso[];

    public localEs = localeEs;
    public paginationPageSize = 10;
    public paginationPageSizeSelector: number[] | boolean = [10, 50, 1000];
    public paginationNumberFormatter: (params: PaginationNumberFormatterParams) => string = (params: PaginationNumberFormatterParams) => {
        return params.value.toLocaleString();
    };
    public columnDefs: ColDef[] = [
        { headerName: 'Operaciones', field: 'id', minWidth: 100, maxWidth: 120, cellRenderer: RendererComponent, pinned: true },
        {
            headerName: 'Fecha Ingreso', field: 'fechaIngreso', filter: 'agDateColumnFilter', floatingFilter: true, type: 'date', minWidth: 190, maxWidth: 200,
            valueGetter: (p) => {
                if (p.data.fecha_solicitud) {
                    return moment(p.data.fecha_solicitud).toDate();
                }
                return null;
            },
            valueFormatter: (p) => {
                if (p.value) {
                    const f = new Date(p.value);
                    return moment(f).format('DD/MM/YYYY HH:mm:ss');
                }
                return '';
            }, filterParams: {
                comparator: (filter, cellValue) => {
                    const cellDate = moment(cellValue).format('DD/MM/YYYY');
                    const filterMoment = moment(filter).format('DD/MM/YYYY');
                    if (cellDate < filterMoment) {
                        return -1;
                    }
                    if (cellDate > filterMoment) {
                        return 1;
                    }
                    return 0;
                }
            }
        },
        { headerName: 'Estado', field: 'estado', filter: true, floatingFilter: true, minWidth: 190, maxWidth: 200 },
        { headerName: 'Código', field: 'codigo', filter: true, floatingFilter: true, minWidth: 180, maxWidth: 200 },
        { headerName: 'Descripción', field: 'descripcion', filter: true, floatingFilter: true, minWidth: 400, maxWidth: 410 },
        { headerName: '# Comprobante', field: 'comprobante', filter: true, floatingFilter: true, minWidth: 210, maxWidth: 220 },
        { headerName: 'Proveedor', field: 'proveedor', filter: true, floatingFilter: true, minWidth: 210, maxWidth: 220 },
        { headerName: 'Almacen', field: 'almacen', filter: true, floatingFilter: true, minWidth: 210, maxWidth: 220 },
        { headerName: 'Sub Almacen', field: 'subalmacen', filter: true, floatingFilter: true, minWidth: 210, maxWidth: 220 },
        {headerName:'Saldo', minWidth:100, maxWidth:120, field:'saldo', filter:true, floatingFilter:true},
    ]
    private gestionActual: number = (new Date()).getFullYear();
    private dataSuscription: Subscription | undefined;
    public formGestion: FormGroup;
    public dataGestiones: number[] = [] as number[];
    public dataIngresos: Ingreso[] = [] as Ingreso[];

    constructor(
        private fb: FormBuilder,
        private alertService: SwalAlertService,
        private ingresoService: IngresoService,
        private toastr: ToastrService,
        private dialog: MatDialog
    ) {
        this.formGestion = new FormGroup({});
        for (let g = 2018; g <= this.gestionActual; g++) {
            this.dataGestiones.push(g);
        }
    }

    ngOnInit(): void {
        this.cargarGestiones();
        this.getIngresos();
    }

    public cargarGestiones() {
        this.formGestion = this.fb.group({
            gestion: [this.gestionActual, [Validators.required]]
        });
    }

    public presionar(x: string) {
        alert(x);
    }
    public getIngresos() {
        this.dataSuscription = this.ingresoService.getIngresos().subscribe({
            next: (response) => {
                this.dataIngresos = response;
            }, error: (err) => {
                this.dataIngresos = [] as Ingreso[];
                this.toastr.error(HandleErrorMessage(err), 'Error');
            },
        });
    }


    
    public onActionNuevo() {
    this.showForm = true;
    this.dataIngreso ;
  
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

    public onActionEditar(pk: string, data: Ingreso) {
    const dialogRef = this.dialog.open(IngresoFormComponent, {
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
            if (result !== null) {
                this.getIngresos();
            }
        }
    );
}

    public onActionEliminar(pk: string, data: Ingreso) {
    this.alertService.showConfirmationDialog('Eliminar registro', 'Esta usted seguro de realizar esta acción?')
        .then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Espere un momento . .  .',
                    didOpen: () => {
                        Swal.showLoading()
                    }
                });
                this.ingresoService.deleteIngreso(pk).subscribe({
                    next: (response) => {
                        this.toastr.success('Acción realizada de manera correcta', 'Registro eliminado');
                       this.getIngresos();
                        Swal.close();
                    }, error: (err) => {
                        this.toastr.error(HandleErrorMessage(err), 'Error');
                        Swal.close();
                    }
                });
            }
        });
}

    public onSelectionChangedIngreso(event: unknown) {
    return event;
}

    public onGridReadyIngreso(event: unknown) {
    return event;
}

ngOnDestroy(): void {
    this.dataSuscription?.unsubscribe();
}
}
