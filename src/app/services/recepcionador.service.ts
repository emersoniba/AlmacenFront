// recepcionador.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Aprobacion } from '../models/aprobacion.model';
import { Producto } from '../models/producto.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RecepcionadorService {
    private apiUrl = `${environment.apiUrl}/aprobaciones`;

  constructor(private http: HttpClient) { }

  obtenerSolicitudesAprobadas(): Observable<Aprobacion[]> {
    return this.http.get<Aprobacion[]>(`${this.apiUrl}?estado=aprobado`);
  }

  actualizarEstadoRecepcion(id: number, datos: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, datos);
  }
  
marcarComoRecibido(id: number, datos: any): Observable<any> {
    return this.actualizarEstadoRecepcion(id, datos);
  }
 obtenerSolicitudPorId(id: number): Observable<Aprobacion> {
    return this.http.get<Aprobacion>(`${this.apiUrl}/${id}`);
  }

}