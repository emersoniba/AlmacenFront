import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): boolean {
        // Verificar si está autenticado
        if (!this.authService.verificarToken()) {
            this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
            return false;
        }

        // Verificar roles si están especificados en la ruta
        const requiredRoles = route.data['roles'] as string[];
        if (requiredRoles && requiredRoles.length > 0) {
            const hasRole = this.authService.hasAnyRole(requiredRoles);
            if (!hasRole) {
                this.router.navigate(['/dashboard/default']); // o a una página de acceso denegado
                return false;
            }
        }

        return true;
    }
}