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
            username: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(20)]],
            password: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(50)]]
        });
    }
    public authLogin() {
        if (this.formAuth.valid) {
            this.formSubscription = this.authService.loginUser(this.formAuth.value).subscribe({
                next: (response: any) => {
                    //console.log('Login exitoso:', response);
                    this.toastr.success('Inicio de sesión exitoso', 'Bienvenido');
                    this.router.navigate(['/dashboard/default']);
                },
                error: (error: Error) => {
                    this.toastr.error(error.message || 'Error de autenticación', 'Autenticación');
                }
            });
        } else {
            this.toastr.warning('Complete el formulario con los datos solicitados', 'Autenticación');
        }
    }

    ngOnDestroy(): void {
        this.formSubscription?.unsubscribe();
    }
}