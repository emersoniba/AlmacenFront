import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';
import { Usuario } from 'src/app/models/usuario.models';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
//
@Component({
    selector: 'app-perfil-modal',
    templateUrl: './perfil-modal.component.html',
    styleUrls: ['./perfil-modal.component.scss']
})
export class PerfilModalComponent implements OnInit {
    @Input() user: Usuario | null = null;

    perfilForm: FormGroup;
    fotoPreview: string | ArrayBuffer | null = null;
    fotoFile: File | null = null;
    cargando: boolean = false;
    apiUrl = environment.apiUrl;

    constructor(
        public activeModal: NgbActiveModal,
        private fb: FormBuilder,
        private authService: AuthService,
        private toastr: ToastrService,
        private http: HttpClient
    ) {
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

            // Cargar foto si existe
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
            this.toastr.warning('Complete correctamente el formulario', 'Validación');
            return;
        }

        this.cargando = true;

        // Actualizar persona
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

        // Si hay foto, usar FormData
        if (this.fotoFile) {
            const formData = new FormData();
            Object.keys(datosPersona).forEach(key => {
                if (datosPersona[key]) {
                    formData.append(key, datosPersona[key]);
                }
            });
            formData.append('imagen', this.fotoFile);

            this.http.patch(`${this.apiUrl}/personas/${this.user?.persona?.ci}/`, formData).subscribe({
                next: (response: any) => {
                    this.actualizarContraseña();
                },
                error: (error) => this.manejarError(error)
            });
        } else {
            this.http.patch(`${this.apiUrl}/personas/${this.user?.persona?.ci}/`, datosPersona).subscribe({
                next: (response: any) => {
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
                next: (response: any) => {
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
                this.cargando = false;
                this.toastr.success('Perfil actualizado correctamente', 'Éxito');
                
                const updatedUser = response.data || response;
                localStorage.setItem('user-almacen', JSON.stringify(updatedUser));
                this.authService['currentUserSubject'].next(updatedUser);
                this.activeModal.close(updatedUser);
            },
            error: (error) => this.manejarError(error)
        });
    }

    manejarError(error: any) {
        this.cargando = false;
        console.error('Error al actualizar perfil:', error);
        this.toastr.error('Error al actualizar el perfil', 'Error');
    }

    cancelar() {
        this.activeModal.dismiss('cancel');
    }
}