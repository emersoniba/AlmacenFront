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
    public labelForm: string = 'Registrar';
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
        this.formRegistro = this.fb.group({
            id: [''],
            nit: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(20)]],
            razon_social: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(150)]],
            direccion: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
            telefono: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(20)]],
            email: ['', [Validators.required, Validators.email]], // Cambiado a Validators.email
            contacto: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]]
        });
    }

    ngOnInit(): void {
        if (this.data?.id) {
            this.labelForm = 'Actualizar';
            this.formRegistro.patchValue({
                id: this.data.id,
                nit: this.data.nit,
                razon_social: this.data.razon_social,
                direccion: this.data.direccion,
                telefono: this.data.telefono,
                email: this.data.email,
                contacto: this.data.contacto
            });
        }
    }

    public accionRegistrar() {
        if (this.formRegistro.invalid) {
            this.formRegistro.markAllAsTouched();
            this.toastr.warning('Verificar los campos del formulario', this.labelForm);
            return;
        }

        this.alertService.showConfirmationDialog(this.labelForm, '¿Está seguro de realizar esta acción?')
            .then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        title: 'Procesando...',
                        didOpen: () => Swal.showLoading()
                    });

                    if (this.data?.id) {
                        // Actualizar
                        this.formSubscription = this.proveedorService.putProveedor(
                            this.formRegistro.value, 
                            Number(this.data.id)
                        ).subscribe({
                            next: (response) => {
                                Swal.close();
                                this.toastr.success('Proveedor actualizado correctamente', 'Éxito');
                                this.actionClose(response);
                            },
                            error: (err) => {
                                Swal.close();
                                this.toastr.error(HandleErrorMessage(err), 'Error');
                            }
                        });
                    } else {
                        // Crear
                        this.formSubscription = this.proveedorService.postProveedor(this.formRegistro.value).subscribe({
                            next: (response) => {
                                Swal.close();
                                this.toastr.success('Proveedor creado correctamente', 'Éxito');
                                this.actionClose(response);
                            },
                            error: (err) => {
                                Swal.close();
                                this.toastr.error(HandleErrorMessage(err), 'Error');
                            }
                        });
                    }
                }
            });
    }

    public actionClose(data: Proveedor | null) {
        this.dialogRef.close(data);
    }

    public accionCancel() {
        this.dialogRef.close(null);
    }

    ngOnDestroy(): void {
        this.formSubscription?.unsubscribe();
    }
}