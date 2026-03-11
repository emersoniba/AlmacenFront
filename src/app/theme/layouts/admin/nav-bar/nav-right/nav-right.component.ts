import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { Usuario } from 'src/app/models/usuario.models';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PerfilModalComponent } from 'src/app/modules/perfil-modal/perfil-modal.component';

@Component({
    selector: 'app-nav-right',
    templateUrl: './nav-right.component.html',
    styleUrls: ['./nav-right.component.scss']
})
export class NavRightComponent implements OnInit, OnDestroy {
    private subscription: Subscription | undefined;
    
    // Datos del usuario
    currentUser: Usuario | null = null;
    nombreCompleto: string = '';
    cargo: string = '';
    iniciales: string = '';
    fotoPerfil: string | null = null;

    constructor(
        private authService: AuthService,
        private modalService: NgbModal
    ) { }

    ngOnInit(): void {
        // Suscribirse a los cambios del usuario
        this.subscription = this.authService.currentUser$.subscribe(user => {
            this.currentUser = user;
            if (user) {
                this.actualizarDatosUsuario(user);
            }
        });
    }

    actualizarDatosUsuario(user: Usuario) {
        // Nombre completo desde persona
        if (user.persona) {
            this.nombreCompleto = user.persona.nombre_completo || 
                                  `${user.persona.nombres} ${user.persona.apellido_paterno || ''} ${user.persona.apellido_materno || ''}`.trim();
            this.cargo = user.persona.cargo || 'Sin cargo asignado';
            this.fotoPerfil = user.persona.imagen || null;
        } else {
            this.nombreCompleto = user.username;
            this.cargo = 'Sin cargo asignado';
            this.fotoPerfil = null;
        }
        
        // Iniciales para el avatar
        this.iniciales = this.obtenerIniciales(user);
    }

    obtenerIniciales(user: Usuario): string {
        if (user.persona?.nombre_completo) {
            const nombres = user.persona.nombre_completo.split(' ');
            if (nombres.length >= 2) {
                return (nombres[0].charAt(0) + nombres[1].charAt(0)).toUpperCase();
            }
            return user.persona.nombre_completo.charAt(0).toUpperCase();
        }
        
        if (user.persona?.nombres) {
            const nombres = user.persona.nombres.split(' ');
            if (nombres.length >= 2) {
                return (nombres[0].charAt(0) + nombres[1].charAt(0)).toUpperCase();
            }
            return user.persona.nombres.charAt(0).toUpperCase();
        }
        
        return user.username.charAt(0).toUpperCase();
    }

    abrirModalPerfil() {
        const modalRef = this.modalService.open(PerfilModalComponent, {
            size: 'lg',
            centered: true,
            backdrop: 'static'
        });
        
        // Pasar datos del usuario al modal
        modalRef.componentInstance.user = this.currentUser;
        
        // Escuchar cuando se cierra el modal
        modalRef.result.then(
            (result) => {
                if (result) {
                    // Actualizar datos si hubo cambios
                    this.actualizarDatosUsuario(result);
                }
            },
            (reason) => {
                console.log('Modal cerrado:', reason);
            }
        );
    }

    logout() {
        this.authService.logout();
    }

    ngOnDestroy(): void {
        this.subscription?.unsubscribe();
    }
}