import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Almacen } from '../models/almacen.model';

@Injectable({
    providedIn: 'root'
})
export class AlmacenService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    public getAlmacenes(): Observable<Almacen[]> {
        return this.http.get<any>(`${this.apiUrl}/almacenes/`).pipe(
            map(response => response.data || response)
        );
    }

    public getAlmacenById(id: number): Observable<Almacen> {
        return this.http.get<any>(`${this.apiUrl}/almacenes/${id}/`).pipe(
            map(response => response.data || response)
        );
    }

    public postAlmacen(data: Omit<Almacen, 'id'>): Observable<Almacen> {
        return this.http.post<any>(`${this.apiUrl}/almacenes/`, data).pipe(
            map(response => response.data || response)
        );
    }

    public putAlmacen(data: Almacen, pk: number): Observable<Almacen> {
        return this.http.put<any>(`${this.apiUrl}/almacenes/${pk}/`, data).pipe(
            map(response => response.data || response)
        );
    }

    public deleteAlmacen(pk: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/almacenes/${pk}/`).pipe(
            map(response => response.data || response)
        );
    }
}