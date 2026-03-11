import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Proveedor } from '../models/proveedor.model';


@Injectable({
    providedIn: 'root'
})
export class ProveedorService {

    private apiUrl = environment.apiUrl;

    constructor(
        private http: HttpClient
    ) { }

    public getProveedores(): Observable<Proveedor[]>{
        return this.http.get<Proveedor[]>(`${this.apiUrl}/proveedor`);
    }

    public postProveedor(data: Proveedor): Observable<Proveedor>{
        return this.http.post<Proveedor>(`${this.apiUrl}/proveedor`, data);
    }

    public putProveedor(data: Proveedor, pk: string): Observable<Proveedor>{
        return this.http.put<Proveedor>(`${this.apiUrl}/proveedor/${pk}/`, data);
    }

    public deleteProveedor(pk: string): Observable<any>{
        return this.http.delete(`${this.apiUrl}/proveedor/${pk}/`);
    }
}
