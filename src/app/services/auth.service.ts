import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, Observable, throwError, tap, map } from 'rxjs';
import { AuthUser, LoginResponse, Usuario } from 'src/app/models/usuario.models';
import { environment } from 'src/environments/environment';
import { jwtDecode } from "jwt-decode";

export interface AuthError {
    message: string;
    code?: string;
    field?: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private apiUrl = environment.apiUrl;
    private _authenticatedSubject = new BehaviorSubject<boolean>(this.verificarToken());
    authenticated$ = this._authenticatedSubject.asObservable();

    // Almacenar datos del usuario
    private currentUserSubject = new BehaviorSubject<Usuario | null>(this.getUserFromStorage());
    currentUser$ = this.currentUserSubject.asObservable();

    constructor(
        private http: HttpClient,
        private router: Router
    ) { }

    private getUserFromStorage(): Usuario | null {
        const userData = localStorage.getItem('user-almacen');
        if (userData) {
            try {
                return JSON.parse(userData);
            } catch {
                return null;
            }
        }
        return null;
    }

    loginUser(data: AuthUser): Observable<LoginResponse> {
        if (this.verificarToken()) {
            return throwError(() => new Error('Usuario ya se encuentra autenticado'));
        }

        return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login/`, data).pipe(
            tap((response: LoginResponse) => {
                // Guardar tokens
                localStorage.setItem('tkn-almacen', response.data.access);
                localStorage.setItem('refresh-tkn-almacen', response.data.refresh);

                // Guardar datos del usuario
                localStorage.setItem('user-almacen', JSON.stringify(response.data.user));
                this.currentUserSubject.next(response.data.user);
                this._authenticatedSubject.next(true);
            }),
            map((response: LoginResponse) => response),
            catchError((error: HttpErrorResponse) => {
                let errorMessage = 'Error de autenticación';
                let errorCode: string | undefined;
                
                console.log('Error de login:', error);
                
                // Manejar errores del backend
                if (error.status === 401 || error.status === 400) {
                    // Intentar extraer mensaje del response del backend
                    if (error.error && error.error.message) {
                        errorMessage = error.error.message;
                    } else if (error.error && error.error.errors) {
                        // Si hay errors object, extraer el primer mensaje
                        const errors = error.error.errors;
                        if (typeof errors === 'object') {
                            // Buscar en non_field_errors
                            if (errors.non_field_errors && errors.non_field_errors[0]) {
                                const errDetail = errors.non_field_errors[0];
                                if (typeof errDetail === 'object' && errDetail.message) {
                                    errorMessage = errDetail.message;
                                    errorCode = errDetail.code;
                                } else {
                                    errorMessage = errDetail;
                                }
                            } 
                            // Buscar errores de campo específico
                            else if (errors.username && errors.username[0]) {
                                errorMessage = `Usuario: ${errors.username[0]}`;
                            } 
                            else if (errors.password && errors.password[0]) {
                                errorMessage = `Contraseña: ${errors.password[0]}`;
                            }
                            else {
                                errorMessage = 'Credenciales inválidas';
                            }
                        } else if (typeof errors === 'string') {
                            errorMessage = errors;
                        }
                    }
                } else if (error.status === 0) {
                    errorMessage = 'Error de conexión con el servidor';
                } else if (error.status === 500) {
                    errorMessage = 'Error interno del servidor. Intente más tarde';
                }
                
                return throwError(() => ({ 
                    message: errorMessage, 
                    code: errorCode,
                    status: error.status 
                }));
            })
        );
    }

    logout() {
        const refreshToken = localStorage.getItem('refresh-tkn-almacen');

        if (refreshToken) {
            this.http.post(`${this.apiUrl}/auth/logout/`, { refresh: refreshToken }).subscribe({
                error: (err) => console.error('Error en logout:', err)
            });
        }

        localStorage.removeItem('tkn-almacen');
        localStorage.removeItem('refresh-tkn-almacen');
        localStorage.removeItem('user-almacen');
        this._authenticatedSubject.next(false);
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
    }

    public accessToken(): string | null {
        return localStorage.getItem('tkn-almacen');
    }

    public refreshToken(): string | null {
        return localStorage.getItem('refresh-tkn-almacen');
    }

    public verificarToken(): boolean {
        const token = localStorage.getItem('tkn-almacen');

        if (!token) return false;

        try {
            const decoded: any = jwtDecode(token);
            const exp = decoded.exp * 1000;
            return Date.now() < exp;
        } catch {
            return false;
        }
    }

    public getCurrentUser(): Usuario | null {
        return this.currentUserSubject.value;
    }

    public getUserFullName(): string {
        const user = this.getCurrentUser();
        return user?.persona?.nombre_completo || user?.username || 'Usuario';
    }

    public getUserCargo(): string {
        const user = this.getCurrentUser();
        return user?.persona?.cargo || 'Sin cargo';
    }

    public getUserUnidad(): string {
        const user = this.getCurrentUser();
        return user?.persona?.unidad || 'Sin unidad';
    }

    public getUserEmail(): string {
        const user = this.getCurrentUser();
        return user?.persona?.correo || '';
    }

    public getUserTelefono(): string {
        const user = this.getCurrentUser();
        return user?.persona?.telefono || '';
    }

    public getUserRoles(): string[] {
        const user = this.getCurrentUser();
        return user?.roles?.map(r => r.nombre) || [];
    }

    public hasRole(roleName: string): boolean {
        const roles = this.getUserRoles();
        return roles.includes(roleName);
    }

    public hasAnyRole(roleNames: string[]): boolean {
        const roles = this.getUserRoles();
        return roleNames.some(role => roles.includes(role));
    }

    refreshTokenRequest(refreshToken: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/auth/refresh/`, { refresh: refreshToken });
    }
}