import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { Almacen } from 'src/app/models/almacen.model';
import { ResponsableAlmacen } from 'src/app/models/responsableAlmacen.model';
import { AlmacenService } from 'src/app/services/almacen.service';
import { ResponsableAlmacenService } from 'src/app/services/responsableAlmacen.service';
import { HandleErrorMessage } from 'src/app/utils/handle.errors';
import { SwalAlertService } from 'src/app/utils/util.swal';
import Swal from 'sweetalert2';


@Component({
    selector: 'app-responsable-form',
    templateUrl: './responsable-form.component.html',
    styleUrl: './responsable-form.component.scss'
})
export class ResponsableFormComponent implements OnInit, OnDestroy {

    public dataAlmacen: Almacen[] = [] as Almacen[];
    public dataResponsable: ResponsableAlmacen[] = [] as ResponsableAlmacen[];
    public labelForm: string = 'Registrar Datos';
    public formRegistro: FormGroup;
    private formSubscription: Subscription | undefined;

    constructor(
        private fb: FormBuilder,
        private toastr: ToastrService,
        private responsableService: ResponsableAlmacenService,
        private almacenService: AlmacenService,
        private alertService: SwalAlertService,
        @Inject(MAT_DIALOG_DATA) public data: ResponsableAlmacen,
        public dialogRef: MatDialogRef<ResponsableFormComponent>
    ) {
        this.formRegistro = new FormGroup({});
    }

    ngOnInit(): void {
        this.getAllAlmacenes();
        this.getFormBuilderRegistro();
        if (this.data.id) {
            this.labelForm = 'Actualizar Datos';
            this.formRegistro.controls['id'].setValue(this.data.id);
            this.formRegistro.controls['idAlmacen'].setValue(this.data.idAlmacen);
            this.formRegistro.controls['idResponsable'].setValue(this.data.idResponsable);
            this.formRegistro.controls['fechaDesde'].setValue(this.data.fechaDesde);
            this.formRegistro.controls['fechaHasta'].setValue(this.data.fechaHasta);
        }
    }

    public getAllAlmacenes(){
        this.almacenService.getAlmacenes().subscribe({
            next: (response) => {
                this.dataAlmacen = response;
            }, error: (err) => {
                this.dataAlmacen = [] as Almacen[];
                this.toastr.error(HandleErrorMessage(err), 'Error');
            }
        });
    }

    public getFormBuilderRegistro() {
        this.formRegistro = this.fb.group({
            id          : [''],
            idAlmacen   : ['', [Validators.required,]],
            idResponsable  : ['', [Validators.required,]],
            fechaDesde  : ['', [Validators.required, ]],
            fechaHasta  : ['', [Validators.required, ]],
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
                            this.formSubscription = this.responsableService.putResponsableAlmacen(this.formRegistro.value, this.data.id).subscribe({
                                next: (response) => {
                                    Swal.close();
                                    this.actionClose(response);
                                }, error: (err) => {
                                    Swal.close();
                                    this.toastr.error(HandleErrorMessage(err), this.labelForm);
                                }
                            });
                        } else {
                            this.formSubscription = this.responsableService.postResponsableAlmacen(this.formRegistro.value).subscribe({
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

    public actionClose(data: ResponsableAlmacen | null) {
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
