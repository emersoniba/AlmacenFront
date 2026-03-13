// services/auth.interceptor.ts
import { Injectable } from '@angular/core';
import {
    HttpInterceptor,
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {
    private isRefreshing = false;
    private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(
        private authService: AuthService,
        private toastr: ToastrService,
        private router: Router
    ) { }

    intercept(
        req: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        let newReq = req.clone();

        // Agregar token si existe y no es login
        if (this.authService.verificarToken() && !req.url.includes('/auth/login')) {
            const token = this.authService.accessToken();
            if (token) {
                newReq = req.clone({
                    setHeaders: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            }
        }

        return next.handle(newReq).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status === 401) {
                    const errorMsg = error.error?.messages?.[0]?.message || '';
                    if (errorMsg.includes('expired') || error.error?.code === 'token_not_valid') {
                        return this.handle401Error(newReq, next);
                    }
                } else if (error.status === 403) {
                    this.toastr.error('No tiene permisos para realizar esta acción', 'Acceso Denegado');
                } else if (error.status === 400) {
                    const errorMsg = error.error?.message || 'Error en la solicitud';
                    this.toastr.error(errorMsg, 'Error');
                } else if (error.status === 500) {
                    this.toastr.error('Error interno del servidor', 'Error');
                }
                return throwError(() => error);
            })
        );
    }

    private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
        if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.refreshTokenSubject.next(null);

            const refreshToken = this.authService.refreshToken();

            if (refreshToken) {
                return this.authService.refreshTokenRequest(refreshToken).pipe(
                    /*  switchMap((response: any) => {
                          this.isRefreshing = false;
          
                          localStorage.setItem('tkn-almacen', response.access);//cambio gpt
                          this.refreshTokenSubject.next(response.data.access);
                          
                          // Reintentar la petición original
                          return next.handle(this.addTokenToRequest(request, response.access));//cambio gpt
                      }),*/
                    switchMap((response: any) => {
                        this.isRefreshing = false;

                        const newAccess = response.access;

                        localStorage.setItem('tkn-almacen', newAccess);
                        this.refreshTokenSubject.next(newAccess);

                        return next.handle(this.addTokenToRequest(request, newAccess));
                    }),
                    catchError((err) => {
                        this.isRefreshing = false;

                        // Si el refresh token también expiró, cerrar sesión
                        this.toastr.warning('Su sesión ha expirado. Por favor, inicie sesión nuevamente.', 'Sesión Expirada');
                        this.authService.logout();
                        this.router.navigate(['/login']);

                        return throwError(() => err);
                    })
                );
            } else {
                this.isRefreshing = false;
                this.toastr.warning('Su sesión ha expirado. Por favor, inicie sesión nuevamente.', 'Sesión Expirada');
                this.authService.logout();
                this.router.navigate(['/login']);
                return throwError(() => new Error('No hay token de refresco'));
            }
        } else {
            return this.refreshTokenSubject.pipe(
                filter(token => token !== null),
                take(1),
                switchMap(token => next.handle(this.addTokenToRequest(request, token)))
            );
        }
    }

    private addTokenToRequest(request: HttpRequest<any>, token: string): HttpRequest<any> {
        return request.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }
}