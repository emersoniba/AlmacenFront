import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Ingreso, IngresoCreate, IngresoDetalle } from '../models/ingreso.model';

@Injectable({
    providedIn: 'root'
})
export class IngresoService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getIngresos(): Observable<Ingreso[]> {
        return this.http.get<any>(`${this.apiUrl}/ingresos/`).pipe(
            map(response => response.data || response)
        );
    }

    getIngresoById(id: number): Observable<Ingreso> {
        return this.http.get<any>(`${this.apiUrl}/ingresos/${id}/`).pipe(
            map(response => response.data || response)
        );
    }

    getIngresosByGestion(gestion: number): Observable<Ingreso[]> {
        return this.http.get<any>(`${this.apiUrl}/ingresos/?gestion=${gestion}`).pipe(
            map(response => response.data || response)
        );
    }

    getDetallesIngreso(idIngreso: number): Observable<IngresoDetalle[]> {
        return this.http.get<any>(`${this.apiUrl}/ingresos-detalle/?ingreso=${idIngreso}`).pipe(
            map(response => response.data || response)
        );
    }

    postIngreso(data: IngresoCreate): Observable<Ingreso> {
        return this.http.post<any>(`${this.apiUrl}/ingresos/`, data).pipe(
            map(response => response.data || response)
        );
    }

    completarIngreso(id: number): Observable<Ingreso> {
        return this.http.post<any>(`${this.apiUrl}/ingresos/${id}/completar/`, {}).pipe(
            map(response => response.data || response)
        );
    }

    anularIngreso(id: number, observacion: string): Observable<Ingreso> {
        return this.http.post<any>(`${this.apiUrl}/ingresos/${id}/anular/`, { observacion }).pipe(
            map(response => response.data || response)
        );
    }

    agregarDetalle(idIngreso: number, detalle: any): Observable<IngresoDetalle> {
        return this.http.post<any>(`${this.apiUrl}/ingresos/${idIngreso}/agregar_detalle/`, detalle).pipe(
            map(response => response.data || response)
        );
    }

    quitarDetalle(idIngreso: number, detalleId: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/ingresos/${idIngreso}/quitar_detalle/?detalle_id=${detalleId}`).pipe(
            map(response => response.data || response)
        );
    }

    deleteIngreso(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/ingresos/${id}/`).pipe(
            map(response => response.data || response)
        );
    }
}