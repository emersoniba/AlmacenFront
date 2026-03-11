import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, map, Observable, of, switchMap, throwError, tap } from 'rxjs';
import { AuthUser, LoginResponse } from 'src/app/models/usuario.models';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private apiUrl = environment.apiUrl;
    private _authenticatedSubject = new BehaviorSubject<boolean>(this.verificarToken());
    authenticated$ = this._authenticatedSubject.asObservable();

    // Almacenar datos del usuario
    private currentUserSubject = new BehaviorSubject<any>(null);
    currentUser$ = this.currentUserSubject.asObservable();

    constructor(
        private http: HttpClient,
        private router: Router
    ) {
        // Cargar usuario del localStorage si existe
        const userData = localStorage.getItem('user-almacen');
        if (userData) {
            this.currentUserSubject.next(JSON.parse(userData));
        }
    }

    loginUser(data: AuthUser): Observable<any> {
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
            map((response: LoginResponse) => response.data),
            catchError((error: HttpErrorResponse) => {
                let errorMessage = 'Error de autenticación';
                if (error.status === 400) {
                    errorMessage = error.error?.message || 'Credenciales inválidas';
                } else if (error.status === 401) {
                    errorMessage = 'Credenciales inválidas';
                }
                return throwError(() => new Error(errorMessage));
            })
        );
    }

    logout() {
        const refreshToken = localStorage.getItem('refresh-tkn-almacen');

        // Opcional: llamar al endpoint de logout
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
        return !!token; // !! convierte a booleano
    }

    public getCurrentUser(): any {
        return this.currentUserSubject.value;
    }

    public hasRole(roleName: string): boolean {
        const user = this.getCurrentUser();
        if (!user || !user.roles) return false;
        return user.roles.some((rol: any) => rol.nombre === roleName);
    }

    public hasAnyRole(roleNames: string[]): boolean {
        const user = this.getCurrentUser();
        if (!user || !user.roles) return false;
        return user.roles.some((rol: any) => roleNames.includes(rol.nombre));
    }

    // Agrega este método a AuthService
    refreshTokenRequest(refreshToken: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/auth/refresh/`, { refresh: refreshToken });
    }
}