import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';
import { Usuario } from 'src/app/models/usuario.models';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SwalAlertService } from 'src/app/utils/util.swal';
import { HandleErrorMessage } from 'src/app/utils/handle.errors';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-perfil-modal',
    templateUrl: './perfil-modal.component.html',
    styleUrls: ['./perfil-modal.component.scss']
})
export class PerfilModalComponent implements OnInit {
    user: Usuario | null = null;
    perfilForm: FormGroup;
    fotoPreview: string | ArrayBuffer | null = null;
    fotoFile: File | null = null;
    cargando: boolean = false;
    apiUrl = environment.apiUrl;

    constructor(
        public dialogRef: MatDialogRef<PerfilModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private fb: FormBuilder,
        private authService: AuthService,
        private toastr: ToastrService,
        private http: HttpClient,
        private alertService: SwalAlertService
    ) {
        this.user = data.user;
        
        this.perfilForm = this.fb.group({
            nombres: ['', Validators.required],
            apellido_paterno: [''],
            apellido_materno: [''],
            cargo: ['', Validators.required],
            telefono: [''],
            correo: ['', [Validators.email]],
            direccion: [''],
            unidad: [''],
            password: [''],
            confirmPassword: ['']
        }, { validator: this.checkPasswords });
    }

    ngOnInit(): void {
        if (this.user?.persona) {
            this.perfilForm.patchValue({
                nombres: this.user.persona.nombres || '',
                apellido_paterno: this.user.persona.apellido_paterno || '',
                apellido_materno: this.user.persona.apellido_materno || '',
                cargo: this.user.persona.cargo || '',
                telefono: this.user.persona.telefono || '',
                correo: this.user.persona.correo || '',
                direccion: this.user.persona.direccion || '',
                unidad: this.user.persona.unidad || ''
            });

            if (this.user.persona.imagen) {
                this.fotoPreview = this.user.persona.imagen;
            }
        }
    }

    checkPasswords(group: FormGroup) {
        const password = group.get('password')?.value;
        const confirmPassword = group.get('confirmPassword')?.value;

        if (password || confirmPassword) {
            return password === confirmPassword ? null : { notSame: true };
        }
        return null;
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                this.toastr.error('Solo se permiten imágenes', 'Error');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                this.toastr.error('La imagen no debe superar los 5MB', 'Error');
                return;
            }

            this.fotoFile = file;

            const reader = new FileReader();
            reader.onload = (e) => {
                this.fotoPreview = e.target?.result || null;
            };
            reader.readAsDataURL(file);
        }
    }

    guardarCambios() {
        if (this.perfilForm.invalid) {
            this.toastr.warning('Verificar los campos del formulario', 'Validación');
            return;
        }

        this.alertService.showConfirmationDialog(
            'Actualizar Perfil', 
            '¿Está seguro de realizar esta acción?'
        ).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Espere un momento . . .',
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                this.cargando = true;
                this.procesarActualizacion();
            }
        });
    }

    procesarActualizacion() {
        const datosPersona: any = {
            nombres: this.perfilForm.get('nombres')?.value,
            apellido_paterno: this.perfilForm.get('apellido_paterno')?.value,
            apellido_materno: this.perfilForm.get('apellido_materno')?.value,
            cargo: this.perfilForm.get('cargo')?.value,
            telefono: this.perfilForm.get('telefono')?.value,
            correo: this.perfilForm.get('correo')?.value,
            direccion: this.perfilForm.get('direccion')?.value,
            unidad: this.perfilForm.get('unidad')?.value
        };

        if (this.fotoFile) {
            const formData = new FormData();
            Object.keys(datosPersona).forEach(key => {
                if (datosPersona[key]) {
                    formData.append(key, datosPersona[key]);
                }
            });
            formData.append('imagen', this.fotoFile);

            this.http.patch(`${this.apiUrl}/personas/${this.user?.persona?.ci}/`, formData).subscribe({
                next: () => {
                    this.actualizarContraseña();
                },
                error: (error) => this.manejarError(error)
            });
        } else {
            this.http.patch(`${this.apiUrl}/personas/${this.user?.persona?.ci}/`, datosPersona).subscribe({
                next: () => {
                    this.actualizarContraseña();
                },
                error: (error) => this.manejarError(error)
            });
        }
    }

    actualizarContraseña() {
        const password = this.perfilForm.get('password')?.value;
        
        if (password) {
            const datosUsuario = { password: password };
            
            this.http.patch(`${this.apiUrl}/usuarios/${this.user?.id}/`, datosUsuario).subscribe({
                next: () => {
                    this.obtenerUsuarioActualizado();
                },
                error: (error) => this.manejarError(error)
            });
        } else {
            this.obtenerUsuarioActualizado();
        }
    }

    obtenerUsuarioActualizado() {
        this.http.get(`${this.apiUrl}/usuarios/${this.user?.id}/`).subscribe({
            next: (response: any) => {
                Swal.close();
                this.cargando = false;
                
                const updatedUser = response.data || response;
                localStorage.setItem('user-almacen', JSON.stringify(updatedUser));
                this.authService['currentUserSubject'].next(updatedUser);
                
                this.toastr.success('Perfil actualizado correctamente', 'Éxito');
                this.dialogRef.close(updatedUser);
            },
            error: (error) => this.manejarError(error)
        });
    }

    manejarError(error: any) {
        Swal.close();
        this.cargando = false;
        console.error('Error al actualizar perfil:', error);
        this.toastr.error(HandleErrorMessage(error), 'Error');
    }

    cancelar() {
        this.dialogRef.close();
    }
}