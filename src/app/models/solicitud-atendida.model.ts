export interface SolicitudAtendida {
  id: string;
  solicitud_id: string;
  fecha_solicitud: string;
  solicitante: {
    usuario: string;
    cargo: string;
  };
  almacen: {
    id: string;
    nombre: string;
  };
  objetivo: string;
  productos: any[];
  estado: string;
  productos_count: number;
  fecha_aprobacion?: string;
  aprobador?: string;
  comentarios?: string;
  fecha_recepcion?: string;
  recepcionista?: string;
  comentarios_recepcion?: string;
  productos_entregados?: any[];
}