export interface EstadoSolicitud {
    id: number;
    nombre: string;
    codigo: string;
    descripcion: string;
    orden: number;
}

export interface DetalleSolicitud {
    id: number;
    producto: number;
    producto_nombre: string;
    producto_codigo: string;
    producto_unidad: string;
    cantidad_solicitada: number;
    cantidad_entregada: number;
    stock_actual: number;
    precio_unitario?: number;  // Opcional para solicitudes
}

export interface Solicitud {
    id: number;
    codigo: string;
    objetivo: string;
    solicitante: number;
    solicitante_nombre: string;
    solicitante_cargo: string;
    aprobador: number | null;
    aprobador_nombre: string | null;
    almacenero: number | null;
    almacenero_nombre: string | null;
    almacen: number;
    almacen_nombre: string;
    subalmacen: number;
    subalmacen_nombre: string | null;
    fecha_solicitud: string;
    fecha_envio: string | null;
    fecha_aprobacion: string | null;
    fecha_rechazo: string | null;
    fecha_recepcion: string | null;
    estado: number;
    estado_nombre: string;
    estado_codigo: string;
    estado_descripcion: string;
    observacion_aprobador: string | null;
    observacion_almacenero: string | null;
    detalles?: DetalleSolicitud[];
}

export interface SolicitudCreate {
    objetivo: string;
    almacen: number;
    subalmacen: number | null;
    detalles: {
        producto: number;
        cantidad_solicitada: number;
    }[];
}

export interface HistorialSolicitud {
    id: number;
    estado_anterior: string | null;
    estado_nuevo: string;
    usuario: string;
    observacion: string | null;
    fecha_cambio: string;
}