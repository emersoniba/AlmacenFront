import { Component, OnDestroy, OnInit, Inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { Usuario } from 'src/app/models/usuario.models';
import { MatDialog } from '@angular/material/dialog';
import { PerfilModalComponent } from 'src/app/modules/perfil-modal/perfil-modal.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

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
        private dialog: MatDialog,
        private breakpointObserver: BreakpointObserver  // Para detectar tamaño de pantalla
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
        // Detectar tamaño de pantalla para ajustar el modal
        const isMobile = this.breakpointObserver.isMatched('(max-width: 768px)');
        const isTablet = this.breakpointObserver.isMatched('(min-width: 769px) and (max-width: 1024px)');
        
        let dialogConfig: any = {
            data: { user: this.currentUser },
            disableClose: true,
            autoFocus: true,
            panelClass: 'perfil-dialog'
        };

        if (isMobile) {
            // Configuración para móviles
            dialogConfig = {
                ...dialogConfig,
                width: '95vw',
                maxWidth: '95vw',
                height: '90vh',
                maxHeight: '90vh',
                panelClass: ['perfil-dialog', 'perfil-dialog-mobile']
            };
        } else if (isTablet) {
            // Configuración para tablets
            dialogConfig = {
                ...dialogConfig,
                width: '80vw',
                maxWidth: '80vw',
                height: 'auto',
                maxHeight: '85vh',
                panelClass: ['perfil-dialog', 'perfil-dialog-tablet']
            };
        } else {
            // Configuración para desktop
            dialogConfig = {
                ...dialogConfig,
                width: '600px',
                //width:'80vw',
                maxWidth: '600px',
                height: '35vw',
                maxHeight: '90vh',
                panelClass: ['perfil-dialog', 'perfil-dialog-desktop']
            };
        }

        const dialogRef = this.dialog.open(PerfilModalComponent, dialogConfig);

        // Escuchar cuando se cierra el modal
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                // Actualizar datos si hubo cambios
                this.actualizarDatosUsuario(result);
                console.log('Perfil actualizado correctamente');
            }
        });
    }

    logout() {
        this.authService.logout();
    }

    ngOnDestroy(): void {
        this.subscription?.unsubscribe();
    }
}