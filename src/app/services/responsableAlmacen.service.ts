import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ResponsableAlmacen } from '../models/responsableAlmacen.model';


@Injectable({
    providedIn: 'root'
})
export class ResponsableAlmacenService {

    private apiUrl = environment.apiUrl;

    constructor(
        private http: HttpClient
    ) { }

    public getResponsableAlmacenes(): Observable<ResponsableAlmacen[]>{
        return this.http.get<ResponsableAlmacen[]>(`${this.apiUrl}/responsableAlmacen`);
    }

    public postResponsableAlmacen(data: ResponsableAlmacen): Observable<ResponsableAlmacen>{
        return this.http.post<ResponsableAlmacen>(`${this.apiUrl}/responsableAlmacen`, data);
    }

    public putResponsableAlmacen(data: ResponsableAlmacen, pk: string): Observable<ResponsableAlmacen>{
        return this.http.put<ResponsableAlmacen>(`${this.apiUrl}/responsableAlmacen/${pk}/`, data);
    }

    public deleteResponsableAlmacen(pk: string): Observable<any>{
        return this.http.delete(`${this.apiUrl}/responsableAlmacen/${pk}/`);
    }
}
