import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Location, LocationStrategy } from '@angular/common';
import { NavigationItems } from '../navigation';
import { AuthService } from 'src/app/services/auth.service';
import { Usuario } from 'src/app/models/usuario.models';

@Component({
    selector: 'app-nav-content',
    templateUrl: './nav-content.component.html',
    styleUrls: ['./nav-content.component.scss']
})
export class NavContentComponent implements OnInit {
    @Output() NavCollapsedMob: EventEmitter<string> = new EventEmitter();
    title = 'Almacen';

    navigation = NavigationItems;
    windowWidth = window.innerWidth;
    
    // Propiedades para el usuario
    currentUser: Usuario | null = null;
    nombreCompleto: string = '';
    cargo: string = '';
    unidad: string = '';
    iniciales: string = '';
    fotoPerfil: string | null = null;

    constructor(
        private location: Location,
        private locationStrategy: LocationStrategy,
        public authService: AuthService
    ) { }

    ngOnInit() {
        if (this.windowWidth < 1025) {
            (document.querySelector('.coded-navbar') as HTMLDivElement).classList.add('menupos-static');
        }
        
        // Suscribirse a los cambios del usuario
        this.authService.currentUser$.subscribe(user => {
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
            this.unidad = user.persona.unidad || '';
            this.fotoPerfil = user.persona.imagen || null;
        } else {
            this.nombreCompleto = user.username;
            this.cargo = 'Sin cargo asignado';
            this.unidad = '';
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

    getRolesString(): string {
        if (!this.currentUser?.roles || this.currentUser.roles.length === 0) {
            return 'Sin roles';
        }
        return this.currentUser.roles.map(r => r.nombre).join(', ');
    }

    fireOutClick() {
        let current_url = this.location.path();
        const baseHref = this.locationStrategy.getBaseHref();
        if (baseHref) {
            current_url = baseHref + this.location.path();
        }
        const link = "a.nav-link[ href='" + current_url + "' ]";
        const ele = document.querySelector(link);
        if (ele !== null && ele !== undefined) {
            const parent = ele.parentElement;
            const up_parent = parent?.parentElement?.parentElement;
            const last_parent = up_parent?.parentElement;
            if (parent?.classList.contains('coded-hasmenu')) {
                parent.classList.add('coded-trigger');
                parent.classList.add('active');
            } else if (up_parent?.classList.contains('coded-hasmenu')) {
                up_parent.classList.add('coded-trigger');
                up_parent.classList.add('active');
            } else if (last_parent?.classList.contains('coded-hasmenu')) {
                last_parent.classList.add('coded-trigger');
                last_parent.classList.add('active');
            }
        }
    }

    navMob() {
        if (this.windowWidth < 1025 && document.querySelector('app-navigation.coded-navbar').classList.contains('mob-open')) {
            this.NavCollapsedMob.emit();
        }
    }

    logout() {
        this.authService.logout();
    }
}