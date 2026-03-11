import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'Almacen';
/*
    constructor(private authService: AuthService) {}

    ngOnInit() {
        // Cargar usuario si ya está autenticado al iniciar la aplicación
        if (this.authService.verificarToken()) {
            this.authService.cargarUsuarioDesdeStorage();
        }
    }
        */
}