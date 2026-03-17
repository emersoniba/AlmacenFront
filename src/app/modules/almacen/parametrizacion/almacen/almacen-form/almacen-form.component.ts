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
    public labelForm: string = 'Registrar';
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
            sigla: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20)]],
            nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
            ubicacion: [''],
            activo: [true]
        });
    }

    ngOnInit(): void {
        if (this.data?.id) {
            this.labelForm = 'Actualizar';
            this.cargarDatosFormulario();
        }
    }

    private cargarDatosFormulario(): void {
        this.formRegistro.patchValue({
            id: this.data.id,
            sigla: this.data.sigla,
            nombre: this.data.nombre,
            ubicacion: this.data.ubicacion || '',
            activo: this.data.activo !== undefined ? this.data.activo : true
        });
    }

    public accionRegistrar() {
        if (this.formRegistro.invalid) {
            this.marcarCamposInvalidos();
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

                    const formData = this.formRegistro.value;

                    if (this.data?.id) {
                        // Actualizar
                        this.formSubscription = this.almacenService.putAlmacen(formData, this.data.id).subscribe({
                            next: (response) => {
                                Swal.close();
                                this.toastr.success('Almacén actualizado correctamente', 'Éxito');
                                this.dialogRef.close(response);
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
                                this.dialogRef.close(response);
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
    }

    private marcarCamposInvalidos(): void {
        Object.keys(this.formRegistro.controls).forEach(key => {
            const control = this.formRegistro.get(key);
            if (control?.invalid) {
                control.markAsTouched();
            }
        });
    }

    public accionCancel() {
        this.dialogRef.close(null);
    }

    ngOnDestroy(): void {
        this.formSubscription?.unsubscribe();
    }
}