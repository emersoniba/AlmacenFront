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
    public remainingAttempts: number | null = null;
    public countdownInterval: any = null;

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

        this.formAuth.get('username')?.valueChanges.subscribe(() => {
            this.errorMessage = null;
            this.remainingAttempts = null;
        });
        this.formAuth.get('password')?.valueChanges.subscribe(() => {
            this.errorMessage = null;
            this.remainingAttempts = null;
        });
    }

    public authLogin() {
        this.errorMessage = null;
        this.remainingAttempts = null;

        Object.keys(this.formAuth.controls).forEach(key => {
            this.formAuth.get(key)?.markAsTouched();
        });

        if (this.formAuth.valid) {
            this.isLoading = true;
            this.formSubscription = this.authService.loginUser(this.formAuth.value).subscribe({
                next: (response: any) => {
                    this.isLoading = false;
                    this.remainingAttempts = null;
                    this.toastr.success(response.message || 'Inicio de sesión exitoso', 'Bienvenido');
                    this.router.navigate(['/dashboard/default']);
                },
                error: (error: any) => {
                    this.isLoading = false;
                    
                    console.log('Error en componente:', error);
                    
                    let message = error.message || 'Error de autenticación';
                    let waitMinutes = error.wait_minutes;
                    let remainingAttempts = error.remaining_attempts;
                    
                    // Si está bloqueado (waitMinutes existe)
                    if (waitMinutes !== undefined && waitMinutes !== null && waitMinutes > 0) {
                        message = `Demasiados intentos fallidos. Espere ${waitMinutes} minutos antes de volver a intentar`;
                        this.errorMessage = message;
                        this.toastr.error(message, 'Cuenta bloqueada temporalmente');
                        
                        // Deshabilitar el formulario
                        this.formAuth.disable();
                        
                        // Mostrar cuenta regresiva
                        this.startCountdown(waitMinutes);
                        
                        this.formAuth.patchValue({ password: '' });
                        return;
                    }
                    
                    // Si hay intentos restantes
                    if (remainingAttempts !== undefined && remainingAttempts !== null && remainingAttempts > 0) {
                        this.remainingAttempts = remainingAttempts;
                        message = `Contraseña incorrecta. Le quedan ${remainingAttempts} intento(s)`;
                        this.errorMessage = message;
                        this.toastr.error(message, 'Error de autenticación');
                        
                        this.formAuth.patchValue({ password: '' });
                        this.formAuth.get('password')?.markAsUntouched();
                        return;
                    }
                    
                    // Error normal
                    this.errorMessage = message;
                    this.toastr.error(message, 'Error de autenticación');
                    
                    this.formAuth.patchValue({ password: '' });
                    this.formAuth.get('password')?.markAsUntouched();
                }
            });
        } else {
            const usernameControl = this.formAuth.get('username');
            const passwordControl = this.formAuth.get('password');

            if (usernameControl?.hasError('required')) {
                this.toastr.warning('Ingrese su nombre de usuario', 'Campo requerido');
            } else if (passwordControl?.hasError('required')) {
                this.toastr.warning('Ingrese su contraseña', 'Campo requerido');
            } else if (usernameControl?.hasError('minlength')) {
                const minLength = usernameControl.getError('minlength').requiredLength;
                this.toastr.warning(`El usuario debe tener al menos ${minLength} caracteres`, 'Validación');
            } else if (passwordControl?.hasError('minlength')) {
                const minLength = passwordControl.getError('minlength').requiredLength;
                this.toastr.warning(`La contraseña debe tener al menos ${minLength} caracteres`, 'Validación');
            } else if (usernameControl?.hasError('maxlength')) {
                const maxLength = usernameControl.getError('maxlength').requiredLength;
                this.toastr.warning(`El usuario debe tener máximo ${maxLength} caracteres`, 'Validación');
            } else if (passwordControl?.hasError('maxlength')) {
                const maxLength = passwordControl.getError('maxlength').requiredLength;
                this.toastr.warning(`La contraseña debe tener máximo ${maxLength} caracteres`, 'Validación');
            } else {
                this.toastr.warning('Complete el formulario correctamente', 'Autenticación');
            }
        }
    }

    startCountdown(waitMinutes: number) {
        let totalSeconds = waitMinutes * 60;
        
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }

        this.countdownInterval = setInterval(() => {
            if (totalSeconds <= 0) {
                if (this.countdownInterval) {
                    clearInterval(this.countdownInterval);
                    this.countdownInterval = null;
                }
                this.formAuth.enable();
                this.errorMessage = null;
                this.remainingAttempts = null;
                this.toastr.info('Ya puedes volver a intentar iniciar sesión', 'Cuenta desbloqueada');
            } else {
                const minutes = Math.floor(totalSeconds / 60);
                const seconds = totalSeconds % 60;
                this.errorMessage = `Demasiados intentos fallidos. Espere ${minutes}:${seconds.toString().padStart(2, '0')} antes de volver a intentar`;
            }
            totalSeconds--;
        }, 1000);
    }

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
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
    }
}