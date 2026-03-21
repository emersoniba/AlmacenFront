import { Component, Inject, OnDestroy, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { Producto, UnidadMedida, CategoriaProducto } from 'src/app/models/producto.model';
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
    public labelForm: string = 'Registrar Producto';
    public formRegistro: FormGroup;
    private formSubscription: Subscription | undefined;
    public selectedFileName: string = '';
    public uploading: boolean = false;
    public selectedFile: File | null = null;
    
    // Catálogos
    public dataUnidadesMedida: UnidadMedida[] = [];
    public dataCategorias: CategoriaProducto[] = [];

    @ViewChild('fileInput') fileInput!: ElementRef;

    constructor(
        private fb: FormBuilder,
        private toastr: ToastrService,
        private productoService: ProductoService,
        private alertService: SwalAlertService,
        @Inject(MAT_DIALOG_DATA) public data: Producto,
        public dialogRef: MatDialogRef<MaterialFormComponent>
    ) {
        this.formRegistro = this.fb.group({
            id: [''],
            codigo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
            nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
            descripcion: [''],
            unidad_medida: ['', Validators.required],
            categoria: ['', Validators.required],
            stock_minimo: [0, [Validators.required, Validators.min(0)]],
            stock_maximo: [0, [Validators.required, Validators.min(0)]],
            imagen: [''],
            activo: [true]
        });
    }

    ngOnInit(): void {
        this.cargarCatalogos();
        
        if (this.data && this.data.id) {
            this.labelForm = 'Actualizar Producto';
            this.patchFormValues();
        }
    }

    private cargarCatalogos(): void {
        // Cargar unidades de medida
        this.productoService.getUnidadesMedida().subscribe({
            next: (response) => {
                this.dataUnidadesMedida = response;
            },
            error: (err) => {
                this.toastr.error(HandleErrorMessage(err), 'Error');
            }
        });

        // Cargar categorías
        this.productoService.getCategorias().subscribe({
            next: (response) => {
                this.dataCategorias = response;
            },
            error: (err) => {
                this.toastr.error(HandleErrorMessage(err), 'Error');
            }
        });
    }

    private patchFormValues(): void {
        this.formRegistro.patchValue({
            id: this.data.id,
            codigo: this.data.codigo,
            nombre: this.data.nombre,
            descripcion: this.data.descripcion,
            unidad_medida: this.data.unidad_medida,
            categoria: this.data.categoria,
            stock_minimo: this.data.stock_minimo,
            stock_maximo: this.data.stock_maximo,
            imagen: this.data.imagen,
            activo: this.data.activo
        });

        if (this.data.imagen) {
            this.selectedFileName = this.data.imagen.split('/').pop() || 'Imagen actual';
        }
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

    public async accionRegistrar() {
        if (this.formRegistro.invalid) {
            this.formRegistro.markAllAsTouched();
            this.toastr.warning('Complete todos los campos requeridos', 'Validación');
            return;
        }

        this.alertService.showConfirmationDialog(this.labelForm, '¿Está seguro de realizar esta acción?')
            .then(async (result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        title: 'Procesando...',
                        didOpen: () => Swal.showLoading()
                    });

                    this.uploading = true;

                    const formValue = this.formRegistro.value;
                    
                    // Preparar datos para enviar
                    const productoData: any = {
                        codigo: formValue.codigo,
                        nombre: formValue.nombre,
                        descripcion: formValue.descripcion,
                        unidad_medida: formValue.unidad_medida,
                        categoria: formValue.categoria,
                        stock_minimo: formValue.stock_minimo,
                        stock_maximo: formValue.stock_maximo,
                        imagen: formValue.imagen || null,
                        activo: formValue.activo
                    };

                    if (this.data?.id) {
                        // Actualizar
                        this.formSubscription = this.productoService.updateProducto(this.data.id, productoData).subscribe({
                            next: (response) => {
                                this.handleSuccess(response);
                            },
                            error: (err) => {
                                this.handleError(err);
                            }
                        });
                    } else {
                        // Crear
                        this.formSubscription = this.productoService.createProducto(productoData).subscribe({
                            next: (response) => {
                                this.handleSuccess(response);
                            },
                            error: (err) => {
                                this.handleError(err);
                            }
                        });
                    }
                }
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