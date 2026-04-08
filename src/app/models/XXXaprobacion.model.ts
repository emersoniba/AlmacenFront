export interface Aprobacion {
  id?: number;
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
  productos: ProductoSolicitud[];
  estado: string;
  fecha_aprobacion?: string;
  aprobador?: string;
  comentarios?: string;
  fecha_recepcion?: string;
}

export interface ProductoSolicitud {
  id_ui: number;
  nombre: string;
  cantidad: number;
  unidad_de_medida: string;
}