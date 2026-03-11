import { Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { Catalogo } from 'src/app/models/catalogo.model';
import { CatalogoService } from 'src/app/services/catalogo.service';
import { HandleErrorMessage } from 'src/app/utils/handle.errors';
import { SwalAlertService } from 'src/app/utils/util.swal';
import Swal from 'sweetalert2';


@Component({
    selector: 'app-catalogo-form',
    templateUrl: './catalogo-form.component.html',
    styleUrl: './catalogo-form.component.scss'
})
export class CatalogoFormComponent implements OnInit, OnDestroy {

    public labelForm: string = 'Registrar Datos';
    public formRegistro: FormGroup;
    private formSubscription: Subscription | undefined;

    constructor(
        private fb: FormBuilder,
        private toastr: ToastrService,
        private catologoService: CatalogoService,
        private alertService: SwalAlertService,
        @Inject(MAT_DIALOG_DATA) public data: Catalogo,
        public dialogRef: MatDialogRef<CatalogoFormComponent>
    ) {
        this.formRegistro = new FormGroup({});
    }

    ngOnInit(): void {
        this.getFormBuilderRegistro();
        if (this.data.id) {
            this.labelForm = 'Actualizar Datos';
            this.formRegistro.controls['id'].setValue(this.data.id);
            this.formRegistro.controls['descripcion'].setValue(this.data.descripcion);
            this.formRegistro.controls['categoria'].setValue(this.data.categoria);
        }
    }

    public getFormBuilderRegistro() {
        this.formRegistro = this.fb.group({
            id: [''],
            descripcion: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(150)]],
            categoria: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]],
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
                            this.formSubscription = this.catologoService.putCatalogo(this.formRegistro.value, this.data.id).subscribe({
                                next: (response) => {
                                    Swal.close();
                                    this.actionClose(response);
                                }, error: (err) => {
                                    Swal.close();
                                    this.toastr.error(HandleErrorMessage(err), this.labelForm);
                                }
                            });
                        } else {
                            this.formSubscription = this.catologoService.postCatalogo(this.formRegistro.value).subscribe({
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

    public actionClose(data: Catalogo | null) {
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
