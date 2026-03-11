import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SolicitudAtendida } from '../models/solicitud-atendida.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AtendidasApiService {
    private apiUrl = `${environment.apiUrl}/atendidas`;

  constructor(private http: HttpClient) { }

  obtenerAtendidas(): Observable<SolicitudAtendida[]> {
    return this.http.get<SolicitudAtendida[]>(this.apiUrl);
  }

  agregarAtendida(atendida: SolicitudAtendida): Observable<SolicitudAtendida> {
    return this.http.post<SolicitudAtendida>(this.apiUrl, atendida);
  }
}