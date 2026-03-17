import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SubAlmacen } from '../models/almacen.model';

@Injectable({
    providedIn: 'root'
})
export class SubAlmacenService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    public getSubAlmacenes(): Observable<SubAlmacen[]> {
        return this.http.get<any>(`${this.apiUrl}/subalmacenes/`).pipe(
            map(response => response.data || response)
        );
    }

    public getSubAlmacenesByAlmacen(almacenId: number): Observable<SubAlmacen[]> {
        return this.http.get<any>(`${this.apiUrl}/subalmacenes/?almacen=${almacenId}`).pipe(
            map(response => response.data || response)
        );
    }

    public getSubAlmacenById(id: number): Observable<SubAlmacen> {
        return this.http.get<any>(`${this.apiUrl}/subalmacenes/${id}/`).pipe(
            map(response => response.data || response)
        );
    }

    public postSubAlmacen(data: any): Observable<SubAlmacen> {
        return this.http.post<any>(`${this.apiUrl}/subalmacenes/`, data).pipe(
            map(response => response.data || response)
        );
    }

    public putSubAlmacen(data: any, pk: number): Observable<SubAlmacen> {
        return this.http.put<any>(`${this.apiUrl}/subalmacenes/${pk}/`, data).pipe(
            map(response => response.data || response)
        );
    }

    public deleteSubAlmacen(pk: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/subalmacenes/${pk}/`).pipe(
            map(response => response.data || response)
        );
    }
}