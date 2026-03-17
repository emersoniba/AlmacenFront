import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Categoria } from '../models/categoria.model';


@Injectable({
    providedIn: 'root'
})
export class CategoriaService {

    private apiUrl = environment.apiUrl;

    constructor(
        private http: HttpClient
    ) { }

    public getCategorias(): Observable<Categoria[]> {
        return this.http.get<any>(`${this.apiUrl}/categorias-producto/`).pipe(
            map(response => response.data || response)
        );
    }

    public getCategoriaById(id: number): Observable<Categoria> {
        return this.http.get<any>(`${this.apiUrl}/categorias-producto/${id}/`).pipe(
            map(response => response.data || response)
        );
    }

    public postCategoria(data: any): Observable<Categoria> {
        return this.http.post<any>(`${this.apiUrl}/categorias-producto/`, data).pipe(
            map(response => response.data || response)
        );
    }

    public putCategoria(data: any, pk: number): Observable<Categoria> {
        return this.http.put<any>(`${this.apiUrl}/categorias-producto/${pk}/`, data).pipe(
            map(response => response.data || response)
        );
    }

    public deleteCategoria(pk: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/categorias-producto/${pk}/`).pipe(
            map(response => response.data || response)
        );
    }
}