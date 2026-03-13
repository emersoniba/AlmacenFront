import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Usuario, Persona, RolInfo } from '../models/usuario.models';

@Injectable({
    providedIn: 'root'
})
export class UsuariosService {
    private apiUrl = environment.apiUrl;

    constructor(
        private http: HttpClient
    ) { }

    // Obtener todos los usuarios
    public getUsuarios(): Observable<Usuario[]> {
        return this.http.get<any>(`${this.apiUrl}/usuarios/`).pipe(
            map(response => response.data || response)
        );
    }

    // Obtener un usuario por ID
    public getUsuarioById(id: number): Observable<Usuario> {
        return this.http.get<any>(`${this.apiUrl}/usuarios/${id}/`).pipe(
            map(response => response.data || response)
        );
    }

    // Obtener todas las personas (para el selector)
    public getPersonas(): Observable<Persona[]> {
        return this.http.get<any>(`${this.apiUrl}/personas/`).pipe(
            map(response => response.data || response)
        );
    }

    // Obtener una persona por CI
    public getPersonaByCi(ci: string): Observable<Persona> {
        return this.http.get<any>(`${this.apiUrl}/personas/${ci}/`).pipe(
            map(response => response.data || response)
        );
    }

    // Obtener todos los roles
    public getRoles(): Observable<RolInfo[]> {
        return this.http.get<any>(`${this.apiUrl}/roles/`).pipe(
            map(response => response.data || response)
        );
    }

    // Crear una persona
    public postPersona(data: any): Observable<Persona> {
        return this.http.post<any>(`${this.apiUrl}/personas/`, data).pipe(
            map(response => response.data || response)
        );
    }

    // Actualizar una persona
    public putPersona(data: any, ci: string): Observable<Persona> {
        return this.http.put<any>(`${this.apiUrl}/personas/${ci}/`, data).pipe(
            map(response => response.data || response)
        );
    }

    // Crear un usuario
    public postUsuario(data: any): Observable<Usuario> {
        return this.http.post<any>(`${this.apiUrl}/usuarios/`, data).pipe(
            map(response => response.data || response)
        );
    }

    // Actualizar un usuario
    public putUsuario(data: any, pk: number): Observable<Usuario> {
        return this.http.put<any>(`${this.apiUrl}/usuarios/${pk}/`, data).pipe(
            map(response => response.data || response)
        );
    }

    // Asignar rol a usuario
    public asignarRol(usuarioId: number, rolId: number): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/usuarios/${usuarioId}/asignar-rol/`, { rol_id: rolId }).pipe(
            map(response => response.data || response)
        );
    }

    // Eliminar usuario
    public deleteUsuario(pk: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/usuarios/${pk}/`).pipe(
            map(response => response.data || response)
        );
    }

    // Quitar rol de usuario
    public quitarRol(usuarioId: number, rolId: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/usuarios/${usuarioId}/quitar-rol/${rolId}/`).pipe(
            map(response => response.data || response)
        );
    }
}