import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Solicitud, SolicitudCreate, DetalleSolicitud, HistorialSolicitud } from '../models/solicitud.model';

@Injectable({
    providedIn: 'root'
})
export class SolicitudService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    // Obtener todas las solicitudes (según rol)
    getSolicitudes(): Observable<Solicitud[]> {
        return this.http.get<any>(`${this.apiUrl}/solicitudes/`).pipe(
            map(response => response.data || response)
        );
    }

    // Obtener solicitudes por gestión
    getSolicitudesByGestion(gestion: number): Observable<Solicitud[]> {
        return this.http.get<any>(`${this.apiUrl}/solicitudes/?gestion=${gestion}`).pipe(
            map(response => response.data || response)
        );
    }

    // Obtener mis solicitudes (solo del usuario actual)
    getMisSolicitudes(): Observable<Solicitud[]> {
        return this.http.get<any>(`${this.apiUrl}/solicitudes/mis_solicitudes/`).pipe(
            map(response => response.data || response)
        );
    }

    // Obtener solicitud por ID
    getSolicitudById(id: number): Observable<Solicitud> {
        return this.http.get<any>(`${this.apiUrl}/solicitudes/${id}/`).pipe(
            map(response => response.data || response)
        );
    }

    // Crear solicitud
    createSolicitud(solicitud: SolicitudCreate): Observable<Solicitud> {
        return this.http.post<any>(`${this.apiUrl}/solicitudes/`, solicitud).pipe(
            map(response => response.data || response)
        );
    }

    // Enviar solicitud para aprobación
    enviarSolicitud(id: number): Observable<Solicitud> {
        return this.http.post<any>(`${this.apiUrl}/solicitudes/${id}/enviar/`, {}).pipe(
            map(response => response.data || response)
        );
    }

    // Aprobar/Rechazar solicitud
    aprobarRechazarSolicitud(id: number, aprobar: boolean, observacion?: string): Observable<Solicitud> {
        return this.http.post<any>(`${this.apiUrl}/solicitudes/${id}/aprobar_rechazar/`, {
            aprobar: aprobar,
            observacion: observacion || ''
        }).pipe(
            map(response => response.data || response)
        );
    }

    // Entregar solicitud
    entregarSolicitud(id: number, entregas: { detalle_id: number; cantidad_entregada: number }[], observacion?: string): Observable<Solicitud> {
        return this.http.post<any>(`${this.apiUrl}/solicitudes/${id}/entregar/`, {
            entregas: entregas,
            observacion: observacion || ''
        }).pipe(
            map(response => response.data || response)
        );
    }

    // Obtener historial de solicitud
    getHistorialSolicitud(id: number): Observable<HistorialSolicitud[]> {
        return this.http.get<any>(`${this.apiUrl}/solicitudes/${id}/historial/`).pipe(
            map(response => response.data || response)
        );
    }

    // Eliminar solicitud (solo si está pendiente)
    deleteSolicitud(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/solicitudes/${id}/`).pipe(
            //map(response => response.data || response)
            map(() => undefined)

        );
    }

    // Obtener detalles de solicitud
    getDetallesSolicitud(idSolicitud: number): Observable<DetalleSolicitud[]> {
        return this.http.get<any>(`${this.apiUrl}/solicitudes/${idSolicitud}/`).pipe(
            map(response => response.data?.detalles || response?.detalles || [])
        );
    }
    // Actualizar solicitud existente
    updateSolicitud(id: number, data: SolicitudCreate): Observable<Solicitud> {
        return this.http.put<any>(`${this.apiUrl}/solicitudes/${id}/`, data).pipe(
            map(response => response.data || response)
        );
    }
    // Obtener solicitudes pendientes de aprobación
    getSolicitudesPendientes(): Observable<Solicitud[]> {
        return this.http.get<any>(`${this.apiUrl}/solicitudes/`).pipe(
            map(response => {
                const data = response.data || response;
                // Filtrar solicitudes en estado ENVIADO (pendientes de aprobación)
                return data.filter((s: Solicitud) => s.estado_codigo === 'ENVIADO');
            })
        );
    }
    getTodasSolicitudes(): Observable<Solicitud[]> {
        return this.http.get<any>(`${this.apiUrl}/solicitudes/`).pipe(
            map(response => response.data || response)
        );
    }

}