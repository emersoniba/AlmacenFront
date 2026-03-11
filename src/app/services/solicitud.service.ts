import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SolicitudCustom } from '../models/solicitud.model';

@Injectable({
  providedIn: 'root'
})
export class SolicitudService {
 private usuarioActual = new BehaviorSubject<any>({
    usuario: 'jperez',
    cargo: 'Analista',
    departamento: 'TI'
  });

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getSolicitudes(): Observable<SolicitudCustom[]> {
    return this.http.get<SolicitudCustom[]>(`${this.apiUrl}/solicitudes`);
  }

  getSolicitudesByGestion(gestion: number): Observable<SolicitudCustom[]> {
    return this.http.get<SolicitudCustom[]>(`${this.apiUrl}/solicitudes?gestion=${gestion}`);
  }

  getSolicitudById(id: string): Observable<SolicitudCustom> {
    return this.http.get<SolicitudCustom>(`${this.apiUrl}/solicitudes/${id}`);
  }

  createSolicitud(solicitud: SolicitudCustom): Observable<SolicitudCustom> {
    return this.http.post<SolicitudCustom>(`${this.apiUrl}/solicitudes`, solicitud);
  }

  updateSolicitud(id: string, solicitud: SolicitudCustom): Observable<SolicitudCustom> {
    return this.http.put<SolicitudCustom>(`${this.apiUrl}/solicitudes/${id}`, solicitud);
  }

  deleteSolicitud(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/solicitudes/${id}`);
  }

  getDetallesSolicitud(idSolicitud: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/detallesSolicitud?idSolicitud=${idSolicitud}`);
  }
  
    obtenerUsuarioActual() {
    return this.usuarioActual.value;
  }
}