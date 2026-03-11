import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Almacen, SubAlmacen } from '../models/almacen.model';


@Injectable({
    providedIn: 'root'
})
export class SubAlmacenService {

    private apiUrl = environment.apiUrl;

    constructor(
        private http: HttpClient
    ) { }

    public getSubAlmacenes(): Observable<SubAlmacen[]>{
        return this.http.get<SubAlmacen[]>(`${this.apiUrl}/subalmacen`);
    }

    public getSubAlmacenesAlmacen(idAlmacen: string): Observable<SubAlmacen[]>{
        return this.http.get<SubAlmacen[]>(`${this.apiUrl}/subalmacen/?idSubAlmacen=${idAlmacen}`);
    }

    public postSubAlmacen(data: SubAlmacen): Observable<SubAlmacen>{
        return this.http.post<SubAlmacen>(`${this.apiUrl}/subalmacen`, data);
    }

    public putSubAlmacen(data: SubAlmacen, pk: string): Observable<SubAlmacen>{
        return this.http.put<SubAlmacen>(`${this.apiUrl}/subalmacen/${pk}/`, data);
    }

    public deleteSubAlmacen(pk: string): Observable<any>{
        return this.http.delete(`${this.apiUrl}/subalmacen/${pk}/`);
    }
}
