import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Location, LocationStrategy } from '@angular/common';
import { NavigationItems, NavigationItem } from '../navigation';
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

    navigation: NavigationItem[] = []; // Cambiar a array vacío
    filteredNavigation: NavigationItem[] = []; // <-- NUEVO: menú filtrado
    windowWidth = window.innerWidth;
    
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
                this.filtrarMenuPorRol(user); // <-- NUEVO: filtrar menú
            } else {
                this.filteredNavigation = []; // Si no hay usuario, menú vacío
            }
        });
    }

    // <-- NUEVO MÉTODO: Filtrar menú según roles del usuario
    filtrarMenuPorRol(user: Usuario): void {
        const userRoles = user.roles?.map(rol => rol.nombre) || [];
        
        // Verificar si el usuario tiene Admin (acceso total)
        const esAdmin = userRoles.includes('Admin');
        
        if (esAdmin) {
            // Admin ve TODO el menú sin filtrar
            this.filteredNavigation = NavigationItems;
            return;
        }
        
        // Filtrar grupos y sus hijos según roles
        this.filteredNavigation = NavigationItems
            .map(group => this.filtrarGrupo(group, userRoles))
            .filter(group => group !== null) as NavigationItem[];
    }

    // Filtrar un grupo y sus hijos
    private filtrarGrupo(group: NavigationItem, userRoles: string[]): NavigationItem | null {
        // Verificar si el grupo tiene restricción de roles
        if (group.roles && !this.tieneRolPermitido(group.roles, userRoles)) {
            return null; // Grupo no permitido
        }
        
        // Si tiene hijos, filtrarlos también
        if (group.children && group.children.length > 0) {
            const childrenFiltrados = group.children
                .map(child => this.filtrarItem(child, userRoles))
                .filter(child => child !== null) as NavigationItem[];
            
            if (childrenFiltrados.length === 0) {
                return null; // Si no quedan hijos, ocultar el grupo
            }
            
            return {
                ...group,
                children: childrenFiltrados
            };
        }
        
        return group;
    }

    // Filtrar un ítem individual
    private filtrarItem(item: NavigationItem, userRoles: string[]): NavigationItem | null {
        // Verificar si el ítem tiene restricción de roles
        if (item.roles && !this.tieneRolPermitido(item.roles, userRoles)) {
            return null;
        }
        
        // Si tiene hijos recursivos
        if (item.children && item.children.length > 0) {
            const childrenFiltrados = item.children
                .map(child => this.filtrarItem(child, userRoles))
                .filter(child => child !== null) as NavigationItem[];
            
            if (childrenFiltrados.length === 0) {
                return null;
            }
            
            return {
                ...item,
                children: childrenFiltrados
            };
        }
        
        return item;
    }

    // Verificar si el usuario tiene al menos uno de los roles permitidos
    private tieneRolPermitido(rolesPermitidos: string[], userRoles: string[]): boolean {
        return rolesPermitidos.some(rol => userRoles.includes(rol));
    }

    actualizarDatosUsuario(user: Usuario) {
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