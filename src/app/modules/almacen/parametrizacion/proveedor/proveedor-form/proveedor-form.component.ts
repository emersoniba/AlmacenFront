import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { Proveedor } from 'src/app/models/proveedor.model';
import { ProveedorService } from 'src/app/services/proveedor.service';
import { HandleErrorMessage } from 'src/app/utils/handle.errors';
import { SwalAlertService } from 'src/app/utils/util.swal';
import Swal from 'sweetalert2';


@Component({
    selector: 'app-proveedor-form',
    templateUrl: './proveedor-form.component.html',
    styleUrl: './proveedor-form.component.scss'
})
export class ProveedorFormComponent implements OnInit, OnDestroy {

    public labelForm: string = 'Registrar Datos';
    public formRegistro: FormGroup;
    private formSubscription: Subscription | undefined;

    constructor(
        private fb: FormBuilder,
        private toastr: ToastrService,
        private proveedorService: ProveedorService,
        private alertService: SwalAlertService,
        @Inject(MAT_DIALOG_DATA) public data: Proveedor,
        public dialogRef: MatDialogRef<ProveedorFormComponent>
    ) {
        this.formRegistro = new FormGroup({});
    }

    ngOnInit(): void {
        this.getFormBuilderRegistro();
        if (this.data.id) {
            this.labelForm = 'Actualizar Datos';
            this.formRegistro.controls['id'].setValue(this.data.id);
            this.formRegistro.controls['razonSocial'].setValue(this.data.razonSocial);
            this.formRegistro.controls['nit'].setValue(this.data.nit);
            this.formRegistro.controls['direccion'].setValue(this.data.direccion);
        }
    }

    public getFormBuilderRegistro() {
        this.formRegistro = this.fb.group({
            id          : [''],
            razonSocial : ['', [Validators.required, Validators.minLength(5), Validators.maxLength(150)]],
            nit         : ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]],
            direccion   : ['', [Validators.required, Validators.minLength(10), Validators.maxLength(170)]]
        });
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
                        if (this.data.id) {
                            this.formSubscription = this.proveedorService.putProveedor(this.formRegistro.value, this.data.id).subscribe({
                                next: (response) => {
                                    Swal.close();
                                    this.actionClose(response);
                                }, error: (err) => {
                                    Swal.close();
                                    this.toastr.error(HandleErrorMessage(err), this.labelForm);
                                }
                            });
                        } else {
                            this.formSubscription = this.proveedorService.postProveedor(this.formRegistro.value).subscribe({
                                next: (response) => {
                                    Swal.close();
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

    public actionClose(data: Proveedor | null) {
        if (data) {
            this.dialogRef.close(data);
        } else {
            this.dialogRef.close(null);
        }
    }

    public accionCancel() {
        this.actionClose(null);
    }

    ngOnDestroy(): void {
        this.formSubscription?.unsubscribe();
    }
}
