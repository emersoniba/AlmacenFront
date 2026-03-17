import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Proveedor } from '../models/proveedor.model';

@Injectable({
    providedIn: 'root'
})
export class ProveedorService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    public getProveedores(): Observable<Proveedor[]> {
        return this.http.get<any>(`${this.apiUrl}/proveedores/`).pipe(
            map(response => response.data || response)
        );
    }

    public getProveedorById(id: number): Observable<Proveedor> {
        return this.http.get<any>(`${this.apiUrl}/proveedores/${id}/`).pipe(
            map(response => response.data || response)
        );
    }

    public postProveedor(data: any): Observable<Proveedor> {
        return this.http.post<any>(`${this.apiUrl}/proveedores/`, data).pipe(
            map(response => response.data || response)
        );
    }

    public putProveedor(data: any, pk: number): Observable<Proveedor> {
        return this.http.put<any>(`${this.apiUrl}/proveedores/${pk}/`, data).pipe(
            map(response => response.data || response)
        );
    }

    public deleteProveedor(pk: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/proveedores/${pk}/`).pipe(
            map(response => response.data || response)
        );
    }
}