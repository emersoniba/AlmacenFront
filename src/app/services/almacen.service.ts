import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Almacen, AlmacenResponse } from '../models/almacen.model';


@Injectable({
    providedIn: 'root'
})
export class AlmacenService {

    private apiUrl = environment.apiUrl;

    constructor(
        private http: HttpClient
    ) { }

    public getAlmacenes(): Observable<Almacen[]> {
        return this.http.get<Almacen[]>(`${this.apiUrl}/Almacen`);
    }
    
    public postAlmacen(data: Omit<Almacen, 'id'>): Observable<AlmacenResponse> {
        const requestData = {
            ...data,
            entity: 'almacen'
        };

        return this.http.post<AlmacenResponse>(`${this.apiUrl}/Almacen`, requestData);
    }
    
    public putAlmacen(data: Almacen, pk: string): Observable<AlmacenResponse> {
        const requestData = {
            ...data,
            entity: 'almacen'
        };

        return this.http.put<AlmacenResponse>(`${this.apiUrl}/Almacen/${pk}/`, requestData);
    }

    public deleteAlmacen(pk: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/Almacen/${pk}/`);
    }
}
