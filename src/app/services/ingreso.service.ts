import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IngresoCustom, IngresoDetalle } from '../models/ingreso.model';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';


@Injectable({
    providedIn: 'root'
})
export class IngresoService {

    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getIngresos(): Observable<IngresoCustom[]> {
        return this.http.get<IngresoCustom[]>(`${this.apiUrl}/ingresos/`);
    }

    getIngresosGestion(gestion: number): Observable<IngresoCustom[]> {
        return this.http.get<IngresoCustom[]>(`${this.apiUrl}/ingresos/?gestion=${gestion}/`);
    }

    getDetalleIngresoOne(idIngreso: string): Observable<IngresoDetalle[]> {
        return this.http.get<IngresoDetalle[]>(`${this.apiUrl}/ingresosDetalle/${idIngreso}`);
    }

    postIngreso(data: IngresoCustom): Observable<IngresoCustom> {
        return this.http.post<IngresoCustom>(`${this.apiUrl}/ingresos/`, data);
    }

    putIngreso(idIngreso: string, data: IngresoCustom): Observable<IngresoCustom> {
        return this.http.put<IngresoCustom>(`${this.apiUrl}/ingresos/${idIngreso}/`, data);
    }

    deleteIngreso(idIngreso: string): Observable<IngresoCustom> {
        return this.http.delete<IngresoCustom>(`${this.apiUrl}/ingresos/${idIngreso}/`);
    }
}
