import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Aprobacion } from '../models/aprobacion.model';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class AprobacionService {
    private apiUrl = `${environment.apiUrl}/aprobaciones`;


  constructor(private http: HttpClient) {}

  crearAprobacion(aprobacion: Aprobacion): Observable<Aprobacion> {
    return this.http.post<Aprobacion>(this.apiUrl, aprobacion);
  }

  obtenerAprobaciones(): Observable<Aprobacion[]> {
    return this.http.get<Aprobacion[]>(this.apiUrl);
  }

  obtenerAprobacionesGestion(gestion: number): Observable<Aprobacion[]>{
    return this.http.get<Aprobacion[]>(`${this.apiUrl}?gestion=${gestion}`);
  }

  obtenerAprobacionPorId(id: number): Observable<Aprobacion> {
    return this.http.get<Aprobacion>(`${this.apiUrl}/${id}`);
  }

  actualizarAprobacion(id: number, aprobacion: Aprobacion): Observable<Aprobacion> {
    return this.http.put<Aprobacion>(`${this.apiUrl}/${id}`, aprobacion);
  }

  eliminarAprobacion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}