import { Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { Almacen, SubAlmacen } from 'src/app/models/almacen.model';
import { AlmacenService } from 'src/app/services/almacen.service';
import { SubAlmacenService } from 'src/app/services/subAlmacen.service';
import { HandleErrorMessage } from 'src/app/utils/handle.errors';
import { SwalAlertService } from 'src/app/utils/util.swal';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-subalmacen-form',
    templateUrl: './subalmacen-form.component.html',
    styleUrl: './subalmacen-form.component.scss'
})
export class SubAlmacenFormComponent implements OnInit, OnDestroy {

    public dataAlmacen: Almacen[] = [] as Almacen[];
    public labelForm: string = 'Registrar Datos';
    public formRegistro: FormGroup;
    private formSubscription: Subscription | undefined;
    public almacenPadre: Almacen | null = null;

    constructor(
        private fb: FormBuilder,
        private toastr: ToastrService,
        private subAlmacenService: SubAlmacenService,
        private almacenService: AlmacenService,
        private alertService: SwalAlertService,
        @Inject(MAT_DIALOG_DATA) public data: any, // Cambiado a 'any' para recibir diferentes tipos de datos
        public dialogRef: MatDialogRef<SubAlmacenFormComponent>
    ) {
        this.formRegistro = new FormGroup({});
    }

    ngOnInit(): void {
        if (this.data.almacenPadre) {
            this.almacenPadre = this.data.almacenPadre;
            this.getAllAlmacenes(true);
        } else if (this.data.id) {
            this.labelForm = 'Actualizar Datos';
            this.getAllAlmacenes(false);
        } else {
            this.getAllAlmacenes(false);
        }
        
        this.getFormBuilderRegistro();
        this.patchFormValues();
    }

    public getAllAlmacenes(desdeAlmacenSeleccionado: boolean = false) {
        this.almacenService.getAlmacenes().subscribe({
            next: (response: any) => {
                if (response && response.data && Array.isArray(response.data)) {
                    this.dataAlmacen = response.data;
                } else if (Array.isArray(response)) {
                    this.dataAlmacen = response;
                } else {
                    this.dataAlmacen = [];
                }

                // Si viene del almacén seleccionado, seleccionar automáticamente ese almacén
                if (desdeAlmacenSeleccionado && this.almacenPadre) {
                    this.seleccionarAlmacenPadre();
                }
            }, 
            error: (err) => {
                this.dataAlmacen = [] as Almacen[];
                this.toastr.error(HandleErrorMessage(err), 'Error');
            }
        });
    }

    private seleccionarAlmacenPadre(): void {
        if (this.almacenPadre && this.formRegistro) {
            this.formRegistro.patchValue({
                idAlmacen: this.almacenPadre.id
            });
            
            // Opcional: deshabilitar el campo si viene del almacén seleccionado
            // this.formRegistro.get('idAlmacen')?.disable();
        }
    }

    private patchFormValues(): void {
        if (this.data.id) {
            // Es edición de subalmacén existente
            this.formRegistro.patchValue({
                id: this.data.id,
                sigla: this.data.sigla,
                nombre: this.data.nombre,
                idAlmacen: this.data.idAlmacen
            });
        } else if (this.almacenPadre) {
            // Es nuevo subalmacén desde almacén seleccionado
            this.formRegistro.patchValue({
                idAlmacen: this.almacenPadre.id
            });
        }
    }

    public getFormBuilderRegistro() {
        this.formRegistro = this.fb.group({
            id: [''],
            sigla: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
            nombre: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
            idAlmacen: ['', [Validators.required]]
        });
    }

    public accionRegistrar() {
        if (this.formRegistro.valid) {
            this.alertService.showConfirmationDialog(this.labelForm, '¿Está usted seguro de realizar esta acción?')
                .then((result) => {
                    if (result.isConfirmed) {
                        Swal.fire({
                            title: 'Espere un momento . . .',
                            didOpen: () => {
                                Swal.showLoading()
                            }
                        });

                        const formData = this.formRegistro.value;

                        if (this.data.id) {
                            // Actualizar subalmacén existente
                            this.formSubscription = this.subAlmacenService.putSubAlmacen(formData, this.data.id).subscribe({
                                next: (response) => {
                                    Swal.close();
                                    this.toastr.success('Subalmacén actualizado correctamente', 'Éxito');
                                    this.actionClose(response);
                                }, 
                                error: (err) => {
                                    Swal.close();
                                    this.toastr.error(HandleErrorMessage(err), this.labelForm);
                                }
                            });
                        } else {
                            // Crear nuevo subalmacén
                            this.formSubscription = this.subAlmacenService.postSubAlmacen(formData).subscribe({
                                next: (response) => {
                                    Swal.close();
                                    this.toastr.success('Subalmacén creado correctamente', 'Éxito');
                                    this.actionClose(response);
                                }, 
                                error: (err) => {
                                    Swal.close();
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

    public actionClose(data: SubAlmacen | null) {
        if (data) {
            this.dialogRef.close(data);
        } else {
            this.dialogRef.close(null);
        }
    }

    public accionCancel() {
        this.actionClose(null);
    }

    // Método para obtener mensajes de error
    getErrorMessage(controlName: string): string {
        const control = this.formRegistro.get(controlName);
        
        if (control?.hasError('required')) {
            return 'Este campo es requerido';
        }
        
        if (control?.hasError('minlength')) {
            const minLength = control.errors?.['minlength']?.requiredLength;
            return `Mínimo ${minLength} caracteres`;
        }
        
        if (control?.hasError('maxlength')) {
            const maxLength = control.errors?.['maxlength']?.requiredLength;
            return `Máximo ${maxLength} caracteres`;
        }
        
        return '';
    }

    ngOnDestroy(): void {
        this.formSubscription?.unsubscribe();
    }
}