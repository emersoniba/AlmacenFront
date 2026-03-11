import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Catalogo } from '../models/catalogo.model';


@Injectable({
    providedIn: 'root'
})
export class CatalogoService {

    private apiUrl = environment.apiUrl;

    constructor(
        private http: HttpClient
    ) { }

    public getCatalogos(): Observable<Catalogo[]>{
        return this.http.get<Catalogo[]>(`${this.apiUrl}/catalogo`);
    }

    public postCatalogo(data: Catalogo): Observable<Catalogo>{
        return this.http.post<Catalogo>(`${this.apiUrl}/catalogo`, data);
    }

    public putCatalogo(data: Catalogo, pk: string): Observable<Catalogo>{
        return this.http.put<Catalogo>(`${this.apiUrl}/catalogo/${pk}/`, data);
    }

    public deleteCatalogo(pk: string): Observable<Catalogo>{
        return this.http.delete<Catalogo>(`${this.apiUrl}/catalogo/${pk}/`);
    }
}
