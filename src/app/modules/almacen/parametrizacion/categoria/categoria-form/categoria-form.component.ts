import { Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { Categoria } from 'src/app/models/categoria.model';
import { CategoriaService } from 'src/app/services/categoria.service';
import { HandleErrorMessage } from 'src/app/utils/handle.errors';
import { SwalAlertService } from 'src/app/utils/util.swal';
import Swal from 'sweetalert2';


@Component({
    selector: 'app-categoria-form',
    templateUrl: './categoria-form.component.html',
    styleUrl: './categoria-form.component.scss'
})
export class CategoriaFormComponent implements OnInit, OnDestroy {

    public labelForm: string = 'Registrar Datos';
    public formRegistro: FormGroup;
    private formSubscription: Subscription | undefined;

    constructor(
        private fb: FormBuilder,
        private toastr: ToastrService,
        private categoriaService: CategoriaService,
        private alertService: SwalAlertService,
        @Inject(MAT_DIALOG_DATA) public data: Categoria,
        public dialogRef: MatDialogRef<CategoriaFormComponent>
    ) {
        this.formRegistro = new FormGroup({});
    }

    ngOnInit(): void {
        this.getFormBuilderRegistro();
        if (this.data.id) {
            this.labelForm = 'Actualizar Datos';
            this.formRegistro.controls['id'].setValue(this.data.id);
            this.formRegistro.controls['descripcion'].setValue(this.data.descripcion);
            this.formRegistro.controls['nombre'].setValue(this.data.nombre);
        }
    }

    public getFormBuilderRegistro() {
        this.formRegistro = this.fb.group({
            id: [''],
            nombre: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]],
            descripcion: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(150)]],
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
                            this.formSubscription = this.categoriaService.putCategoria(this.formRegistro.value, Number(this.data.id)
                            ).subscribe({
                                next: (response) => {
                                    Swal.close();
                                    this.actionClose(response);
                                }, error: (err) => {
                                    Swal.close();
                                    this.toastr.error(HandleErrorMessage(err), this.labelForm);
                                }
                            });
                        } else {
                            this.formSubscription = this.categoriaService.postCategoria(this.formRegistro.value).subscribe({
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

    public actionClose(data: Categoria | null) {
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
