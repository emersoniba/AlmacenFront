import { Component, Inject, OnDestroy, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { Almacen } from 'src/app/models/almacen.model';
import { Producto } from 'src/app/models/producto.model';
import { AlmacenService } from 'src/app/services/almacen.service';
import { ProductoService } from 'src/app/services/producto.service';
import { HandleErrorMessage } from 'src/app/utils/handle.errors';
import { SwalAlertService } from 'src/app/utils/util.swal';
import Swal from 'sweetalert2';


@Component({
    selector: 'app-material-form',
    templateUrl: './material-form.component.html',
    styleUrl: './material-form.component.scss'
})
export class MaterialFormComponent implements OnInit, OnDestroy {

    public dataAlmacen: Almacen[] = [];
    public labelForm: string = 'Registrar Producto';
    public formRegistro: FormGroup;
    private formSubscription: Subscription | undefined;
    public selectedFileName: string = '';
    public uploading: boolean = false;
    public selectedFile: File | null = null;

    @ViewChild('fileInput') fileInput!: ElementRef;

    constructor(
        private fb: FormBuilder,
        private toastr: ToastrService,
        private productoService: ProductoService,
        private almacenService: AlmacenService,
        private alertService: SwalAlertService,
        @Inject(MAT_DIALOG_DATA) public data: Producto,
        public dialogRef: MatDialogRef<MaterialFormComponent>
    ) {
        this.formRegistro = new FormGroup({});
    }

    ngOnInit(): void {
        this.getAllAlmacenes();
        this.initForm();
        
        if (this.data && this.data.id_ui) {
            this.labelForm = 'Actualizar Producto';
            this.patchFormValues();
            if (this.data.imagen && this.data.imagen.includes('assets/images/')) {
                this.selectedFileName = this.data.imagen.split('/').pop() || 'Imagen actual';
            }
        }
    }

    private initForm() {
        this.formRegistro = this.fb.group({
            id_ui: [''],
            nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
            unidad_de_medida: ['', [Validators.required, Validators.maxLength(50)]],
            stock: [0, [Validators.required, Validators.min(0)]],
            imagen: ['', [Validators.required]],
            id_almacen: ['', [Validators.required]],
            almacen: ['']
        });
    }

    private patchFormValues() {
        this.formRegistro.patchValue({
            id_ui: this.data.id_ui,
            nombre: this.data.nombre,
            unidad_de_medida: this.data.unidad_de_medida,
            stock: this.data.stock,
            imagen: this.data.imagen,
            
        });
    }

    public onFileSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
            if (!file.type.match('image.*')) {
                this.toastr.error('Por favor, seleccione solo archivos de imagen', 'Error');
                this.resetFileInput();
                return;
            }

            if (file.size > 2 * 1024 * 1024) {
                this.toastr.error('La imagen no debe exceder los 2MB', 'Error');
                this.resetFileInput();
                return;
            }
            this.selectedFile = file;
            this.selectedFileName = file.name;
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.formRegistro.patchValue({
                    imagen: e.target.result
                });
            };
            reader.readAsDataURL(file);
        }
    }

    public removeImage(): void {
        this.formRegistro.patchValue({
            imagen: ''
        });
        this.selectedFileName = '';
        this.selectedFile = null;
        this.resetFileInput();
    }

    private resetFileInput(): void {
        if (this.fileInput) {
            this.fileInput.nativeElement.value = '';
        }
    }

    public getAllAlmacenes() {
        this.almacenService.getAlmacenes().subscribe({
            next: (response) => {
                this.dataAlmacen = response;
            }, error: (err) => {
                this.toastr.error(HandleErrorMessage(err), 'Error');
            }
        });
    }

    public onAlmacenChange(event: any) {
        const almacenId = event.value;
        const almacenSeleccionado = this.dataAlmacen.find(a => a.id === almacenId);
        if (almacenSeleccionado) {
            this.formRegistro.patchValue({
                almacen: almacenSeleccionado.nombre
            });
        }
    }

    public async accionRegistrar() {
        if (this.formRegistro.valid) {
            this.alertService.showConfirmationDialog(this.labelForm, '¿Está seguro de realizar esta acción?')
                .then(async (result) => {
                    if (result.isConfirmed) {
                        Swal.fire({
                            title: 'Procesando...',
                            didOpen: () => Swal.showLoading()
                        });

                        this.uploading = true;

                        try {
                            let imagenUrl = this.formRegistro.get('imagen')?.value;
                            if (this.selectedFile) {
                                imagenUrl = await this.uploadImageToAssets();
                            }

                            const productoData = {
                                ...this.formRegistro.value,
                                imagen: imagenUrl
                            };
                            if (this.data && this.data.id_ui) {
                                this.formSubscription = this.productoService.updateProducto(this.data.id_ui, productoData).subscribe({
                                    next: (response) => {
                                        this.handleSuccess(response);
                                    }, error: (err) => {
                                        this.handleError(err);
                                    }
                                });
                            } else {
                                this.formSubscription = this.productoService.createProducto(productoData).subscribe({
                                    next: (response) => {
                                        this.handleSuccess(response);
                                    }, error: (err) => {
                                        this.handleError(err);
                                    }
                                });
                            }
                        } catch (error) {
                            this.handleError(error);
                        }
                    }
                });
        } else {
            this.toastr.warning('Por favor, complete todos los campos requeridos', 'Formulario inválido');
        }
    }

    private async uploadImageToAssets(): Promise<string> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const timestamp = new Date().getTime();
                const extension = this.selectedFile?.name.split('.').pop();
                const fileName = `producto_${timestamp}.${extension}`;
                const imageUrl = `assets/images/${fileName}`;
                resolve(imageUrl);
            }, 1000);
        });
    }

    private handleSuccess(response: Producto) {
        Swal.close();
        this.uploading = false;
        this.toastr.success('Operación realizada correctamente', 'Éxito');
        this.dialogRef.close(response);
    }

    private handleError(error: any) {
        Swal.close();
        this.uploading = false;
        this.toastr.error(HandleErrorMessage(error), 'Error');
    }

    public accionCancel() {
        this.dialogRef.close(null);
    }

    ngOnDestroy(): void {
        this.formSubscription?.unsubscribe();
    }
}