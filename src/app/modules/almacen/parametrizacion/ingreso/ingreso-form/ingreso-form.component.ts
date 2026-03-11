import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { Almacen, SubAlmacen } from 'src/app/models/almacen.model';
import { Ingreso, IngresoDetalle } from 'src/app/models/ingreso.model';
//import { Material } from 'src/app/models/material.model';
import { Producto } from 'src/app/models/producto.model';
import { Proveedor } from 'src/app/models/proveedor.model';
import { AlmacenService } from 'src/app/services/almacen.service';
import { IngresoService } from 'src/app/services/ingreso.service';
import { ProveedorService } from 'src/app/services/proveedor.service';
import { SubAlmacenService } from 'src/app/services/subAlmacen.service';
import { HandleErrorMessage } from 'src/app/utils/handle.errors';
import { SwalAlertService } from 'src/app/utils/util.swal';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-ingreso-form',
    templateUrl: './ingreso-form.component.html',
    styleUrl: './ingreso-form.component.css'
})
export class IngresoFormComponent implements OnInit, OnDestroy {

    @Input('pk') pk: string = '';
    @Input('objeto') objeto: Ingreso;

    public labelForm: string = 'Registrar Datos';
    public formRegistro: FormGroup;
    private formSubscription: Subscription | undefined;
    public dataAlmacen: Almacen[] = [] as Almacen[];
    public dataSubAlmacen: SubAlmacen[] = [] as SubAlmacen[];
    public dataProveedor: Proveedor[] = [] as Proveedor[];
    public dataMaterial: Producto[] = [] as Producto[];

    constructor(
        private fb: FormBuilder,
        private toastr: ToastrService,
        private ingresoService: IngresoService,
        private almacenService: AlmacenService,
        private subAlmacenService: SubAlmacenService,
        private proveedorService: ProveedorService,
        private alertService: SwalAlertService,
    ) {
        this.formRegistro = new FormGroup({});
    }

    ngOnInit(): void {
        this.getAllAlmacenes();
        this.getAllProveedores();
        this.getFormBuilderRegistro();
    }

    public getAllAlmacenes(){
         this.almacenService.getAlmacenes().subscribe({
            next: (response) => {
                this.dataAlmacen = response;
            }, error: (err) => {
                this.toastr.error(HandleErrorMessage(err), 'Error');
            }
        });
    }

    public getAllProveedores(){
        this.proveedorService.getProveedores().subscribe({
            next: (response) => {
                this.dataProveedor = response;
            }, error: (err) => {
                this.toastr.error(HandleErrorMessage(err), 'Error');
                this.dataProveedor = [] as Proveedor[];
            }
        });
    }

    public getSubAlmacenes(idAlmacen: string){
        this.subAlmacenService.getSubAlmacenesAlmacen(idAlmacen).subscribe({
            next: (response) => {
                this.dataSubAlmacen = response;
            }, error: (err) => {
                this.toastr.error(HandleErrorMessage(err), 'Error');
                this.dataSubAlmacen = [] as SubAlmacen[];
            }
        });
    }

    public onChangeAlmacen(e: any){
        if (e.value) {
            this.getSubAlmacenes(e.value);
        }
    }

    public getFormBuilderRegistro() {
        this.formRegistro = this.fb.group({
            id          : [''],
            codigo      : ['', [Validators.required, Validators.minLength(5), Validators.maxLength(50)]],
            descripcion : ['', [Validators.required, Validators.minLength(10), Validators.maxLength(300)]],
            comprobante : ['', [Validators.required, Validators.minLength(5), Validators.maxLength(300)]],
            fechaIngreso: ['', [Validators.required, ]],
            idProveedor : ['', [Validators.required, ]],
            idAlmacen   : ['', [Validators.required, ]],
            idSubAlmacen: ['', ],
            //detalles    : this.fb.array([this.formMaterialGroup({} as IngresoDetalle)]),
        });
    }

    public formMaterialGroup(ingresoDetalle: IngresoDetalle): FormGroup{
        if (ingresoDetalle){
            return this.fb.group({
                id: [ingresoDetalle.id ],
                idProducto: [ingresoDetalle.idMaterial, [Validators.required,]],
                cantidad  : [ingresoDetalle.cantidad,   [Validators.required, Validators.pattern(/^[1-9]\d*$/)]],
                monto     : [ingresoDetalle.monto,      [Validators.required, Validators.pattern(/^(?!0(\.0+)?$)(\d+(\.\d{2})?)$/)]]
            });
        }
        return this.fb.group({
            idProducto: ['', [Validators.required,]],
            cantidad  : ['', [Validators.required, Validators.pattern(/^[1-9]\d*$/)]],
            monto     : ['', [Validators.required, Validators.pattern(/^(?!0(\.0+)?$)(\d+(\.\d{2})?)$/)]]
        });
    }

    get materialArray(): FormArray {
		return this.formRegistro.get('detalles') as FormArray;
	}

    public accionRegistrar() {
        if (this.formRegistro.valid) {
            this.alertService.showConfirmationDialog(this.labelForm, 'Esta usted seguro de realizar esta acción?')
                .then((result) => {
                    if (result.isConfirmed) {
                        Swal.fire({
                            title: 'Espere un momento . .  .',
                            didOpen: () => {
                                Swal.showLoading()
                            }
                        });
                        if (this.objeto.id) {
                            this.formSubscription = this.ingresoService.putIngreso(this.pk, this.formRegistro.value).subscribe({
                                next: (response) => {
                                    Swal.close();
                                    this.toastr.success('Actualización de datos, satisfactorio', this.labelForm);
                                    this.actionClose(response);
                                }, error: (err) => {
                                    Swal.close();
                                    this.toastr.error(HandleErrorMessage(err), this.labelForm);
                                }
                            });
                        } else {
                            this.formSubscription = this.ingresoService.postIngreso(this.formRegistro.value).subscribe({
                                next: (response) => {
                                    Swal.close();
                                    this.toastr.success('Registro de datos, satisfactorio', this.labelForm);
                                    this.actionClose(response);
                                }, error: (err) => {
                                    Swal.close();
                                    this.toastr.error(HandleErrorMessage(err), this.labelForm);
                                }
                            });
                        }
                    }
                });
        } else {
            this.toastr.warning('Verificar los campos del formulario', this.labelForm);
        }
    }

    public accionAdicionarMaterial(){

    }

    public accionEliminarMaterial(){

    }

    public actionClose(data: Ingreso | null) {
        if (data) {
            //this.dialogRef.close(data);
        } else {
            //this.dialogRef.close(null);
        }
    }

    public accionCancel() {
        this.actionClose(null);
    }

    ngOnDestroy(): void {
        this.formSubscription?.unsubscribe();
    }
}
