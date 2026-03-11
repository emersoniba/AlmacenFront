import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { Almacen } from 'src/app/models/almacen.model';
import { AlmacenService } from 'src/app/services/almacen.service';
import { HandleErrorMessage } from 'src/app/utils/handle.errors';
import { SwalAlertService } from 'src/app/utils/util.swal';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-almacen-form',
    templateUrl: './almacen-form.component.html',
    styleUrl: './almacen-form.component.scss'
})
export class AlmacenFormComponent implements OnInit, OnDestroy {

    public labelForm: string = 'Registrar Datos';
    public formRegistro: FormGroup;
    private formSubscription: Subscription | undefined;

    constructor(
        private fb: FormBuilder,
        private toastr: ToastrService,
        private almacenService: AlmacenService,
        private alertService: SwalAlertService,
        @Inject(MAT_DIALOG_DATA) public data: Almacen,
        public dialogRef: MatDialogRef<AlmacenFormComponent>
    ) {
        this.formRegistro = this.fb.group({
            id: [''],
            Sigla: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
            Nombre: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(30)]]
        });
    }

    ngOnInit(): void {
        if (this.data && this.data.id) {
            this.labelForm = 'Actualizar Datos';
            this.cargarDatosFormulario();
        }
    }

    private cargarDatosFormulario(): void {
        this.formRegistro.patchValue({
            id: this.data.id,
            Sigla: this.data.sigla,  
            Nombre: this.data.nombre 
        });
    }
    
    public accionRegistrar() {
        if (this.formRegistro.valid) {
            this.alertService.showConfirmationDialog(this.labelForm, '¿Está seguro de realizar esta acción?')
                .then((result) => {
                    if (result.isConfirmed) {
                        Swal.fire({
                            title: 'Espere un momento...',
                            didOpen: () => {
                                Swal.showLoading();
                            }
                        });

                        const formData = this.formRegistro.value;

                        if (this.data && this.data.id) {
                            // Actualizar
                            this.formSubscription = this.almacenService.putAlmacen(formData, this.data.id).subscribe({
                                next: (response) => {
                                    Swal.close();
                                    this.toastr.success('Almacén actualizado correctamente', 'Éxito');
                                    if (response && response.data) {
                                        this.dialogRef.close(response.data);
                                    } else if (response) {
                                        this.dialogRef.close(response);
                                    } else {
                                        this.dialogRef.close(formData);
                                    }
                                },
                                error: (err) => {
                                    Swal.close();
                                    this.toastr.error(HandleErrorMessage(err), this.labelForm);
                                }
                            });
                        } else {
                            // Crear nuevo
                            const { id, ...dataWithoutId } = formData;

                            this.formSubscription = this.almacenService.postAlmacen(dataWithoutId).subscribe({
                                next: (response) => {
                                    Swal.close();
                                    this.toastr.success('Almacén creado correctamente', 'Éxito');

                                    if (response && response.data) {
                                        this.dialogRef.close(response.data);
                                    } else if (response) {
                                        this.dialogRef.close(response);
                                    } else {
                                        this.dialogRef.close(dataWithoutId);
                                    }
                                },
                                error: (err) => {
                                    Swal.close();
                                    console.error('Error completo:', err);
                                    this.toastr.error(HandleErrorMessage(err), this.labelForm);
                                }
                            });
                        }
                    }
                });
        } else {
            this.marcarCamposInvalidos();
            this.toastr.warning('Verificar los campos del formulario', this.labelForm);
        }
    }
    
    private marcarCamposInvalidos(): void {
        Object.keys(this.formRegistro.controls).forEach(key => {
            const control = this.formRegistro.get(key);
            if (control?.invalid) {
                control.markAsTouched();
            }
        });
    }

    public actionClose(data: Almacen | null) {
        this.dialogRef.close(data);
    }

    public accionCancel() {
        this.actionClose(null);
    }

    ngOnDestroy(): void {
        this.formSubscription?.unsubscribe();
    }
}