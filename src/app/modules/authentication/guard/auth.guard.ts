import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    constructor(
        private authService: AuthService,
        private router: Router,
        private toastr: ToastrService
    ) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

        if (!this.authService.verificarToken()) {

            this.toastr.warning(
                'Su sesión ha expirado. Por favor inicie sesión nuevamente.',
                'Sesión expirada'
            );

            this.authService.logout();
            this.router.navigate(['/login']);

            return false;
        }

        const requiredRoles = route.data['roles'] as string[];

        if (requiredRoles && requiredRoles.length > 0) {
            const hasRole = this.authService.hasAnyRole(requiredRoles);

            if (!hasRole) {
                this.router.navigate(['/dashboard/default']);
                return false;
            }
        }

        return true;
    }
}