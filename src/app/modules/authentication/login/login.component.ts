import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export default class LoginComponent implements OnInit, OnDestroy {
    public formAuth: FormGroup = new FormGroup({});
    private formSubscription: Subscription | undefined;
    public fecha = new Date().getFullYear();
    public isLoading = false;
    public errorMessage: string | null = null;

    constructor(
        private fb: FormBuilder,
        private toastr: ToastrService,
        private authService: AuthService,
        private router: Router
    ) {
        this.formAuth = new FormGroup({});
    }

    ngOnInit(): void {
        this.formAuth = this.fb.group({
            username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
            password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(50)]]
        });
        
        // Limpiar error cuando el usuario empiece a escribir
        this.formAuth.get('username')?.valueChanges.subscribe(() => {
            this.errorMessage = null;
        });
        this.formAuth.get('password')?.valueChanges.subscribe(() => {
            this.errorMessage = null;
        });
    }
    
    public authLogin() {
        this.errorMessage = null;
        
        if (this.formAuth.valid) {
            this.isLoading = true;
            this.formSubscription = this.authService.loginUser(this.formAuth.value).subscribe({
                next: (response: any) => {
                    this.isLoading = false;
                    this.toastr.success(response.message || 'Inicio de sesión exitoso', 'Bienvenido');
                    this.router.navigate(['/dashboard/default']);
                },
                error: (error: any) => {
                    this.isLoading = false;
                    // Mostrar error específico del backend
                    const message = error.message || 'Error de autenticación';
                    this.errorMessage = message;
                    this.toastr.error(message, 'Error de autenticación');
                    
                    // Limpiar campo de contraseña por seguridad
                    this.formAuth.patchValue({ password: '' });
                }
            });
        } else {
            // Validar campos específicos
            const usernameControl = this.formAuth.get('username');
            const passwordControl = this.formAuth.get('password');
            
            if (usernameControl?.hasError('required')) {
                this.toastr.warning('Ingrese su nombre de usuario', 'Campo requerido');
            } else if (passwordControl?.hasError('required')) {
                this.toastr.warning('Ingrese su contraseña', 'Campo requerido');
            } else if (usernameControl?.hasError('minlength')) {
                this.toastr.warning('El usuario debe tener al menos 3 caracteres', 'Validación');
            } else if (passwordControl?.hasError('minlength')) {
                this.toastr.warning('La contraseña debe tener al menos 4 caracteres', 'Validación');
            } else {
                this.toastr.warning('Complete el formulario correctamente', 'Autenticación');
            }
        }
    }

    // Método para obtener mensaje de error específico del campo
    getErrorMessage(field: string): string {
        const control = this.formAuth.get(field);
        if (control?.hasError('required')) {
            return 'Este campo es requerido';
        }
        if (control?.hasError('minlength')) {
            const minLength = control.getError('minlength').requiredLength;
            return `Mínimo ${minLength} caracteres`;
        }
        if (control?.hasError('maxlength')) {
            const maxLength = control.getError('maxlength').requiredLength;
            return `Máximo ${maxLength} caracteres`;
        }
        return '';
    }

    ngOnDestroy(): void {
        this.formSubscription?.unsubscribe();
    }
}