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
    status?: number;
    remaining_attempts?: number | null;
    wait_minutes?: number | null;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private apiUrl = environment.apiUrl;
    private _authenticatedSubject = new BehaviorSubject<boolean>(this.verificarToken());
    authenticated$ = this._authenticatedSubject.asObservable();

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
                localStorage.setItem('tkn-almacen', response.data.access);
                localStorage.setItem('refresh-tkn-almacen', response.data.refresh);
                localStorage.setItem('user-almacen', JSON.stringify(response.data.user));
                this.currentUserSubject.next(response.data.user);
                this._authenticatedSubject.next(true);
            }),
            map((response: LoginResponse) => response),
            catchError((error: HttpErrorResponse) => {
                let errorMessage = 'Error de autenticación';
                let errorCode: string | undefined;
                let remainingAttempts: number | null = null;
                let waitMinutes: number | null = null;

                console.log('=== ERROR COMPLETO ===');
                console.log('Status:', error.status);
                console.log('error.error:', error.error);
                
                if (error.status === 401 || error.status === 400) {
                    if (error.error) {
                        // Extraer mensaje principal
                        if (error.error.message) {
                            errorMessage = error.error.message;
                        }
                        
                        // Buscar en error.error.errors.errors (estructura anidada)
                        if (error.error.errors && error.error.errors.errors) {
                            const nestedErrors = error.error.errors.errors;
                            
                            // Extraer wait_minutes del array
                            if (nestedErrors.wait_minutes && nestedErrors.wait_minutes[0]) {
                                waitMinutes = parseInt(nestedErrors.wait_minutes[0]);
                                console.log('waitMinutes encontrado:', waitMinutes);
                            }
                            
                            // Extraer remaining_attempts si existe
                            if (nestedErrors.remaining_attempts && nestedErrors.remaining_attempts[0]) {
                                remainingAttempts = parseInt(nestedErrors.remaining_attempts[0]);
                                console.log('remainingAttempts encontrado:', remainingAttempts);
                            }
                            
                            // Extraer mensaje del error
                            if (nestedErrors.message && nestedErrors.message[0]) {
                                errorMessage = nestedErrors.message[0];
                            }
                        }
                        
                        // También buscar directamente en error.error.errors
                        if (error.error.errors) {
                            if (error.error.errors.wait_minutes !== undefined) {
                                waitMinutes = error.error.errors.wait_minutes;
                            }
                            if (error.error.errors.remaining_attempts !== undefined) {
                                remainingAttempts = error.error.errors.remaining_attempts;
                            }
                        }
                        
                        // Buscar en error.error directamente
                        if (error.error.wait_minutes !== undefined) {
                            waitMinutes = error.error.wait_minutes;
                        }
                        if (error.error.remaining_attempts !== undefined) {
                            remainingAttempts = error.error.remaining_attempts;
                        }
                    }
                } else if (error.status === 0) {
                    errorMessage = 'Error de conexión con el servidor';
                } else if (error.status === 500) {
                    errorMessage = 'Error interno del servidor. Intente más tarde';
                }

                console.log('Datos extraídos:', { errorMessage, remainingAttempts, waitMinutes });

                return throwError(() => ({
                    message: errorMessage,
                    code: errorCode,
                    status: error.status,
                    remaining_attempts: remainingAttempts,
                    wait_minutes: waitMinutes
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