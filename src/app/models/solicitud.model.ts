export interface Solicitud {
    id                  : string,
    codigo              : string,
    nombre_solicitante  : string,
    nombre_aprobador    : string,
    nombre_recepcionador: string,
    fecha_solicitud     : Date,
    fecha_envio         : Date,
    fecha_aprobacion    : Date,
    fecha_rechazo       : Date,
    fecha_recepcion     : Date,
    almacen             : string,
    estado              :string,
}

export interface DetalleSolicitud {
    id                  : string,
    idSolicitud         : string,
    nombreProducto      : string,
    unidad_medida       : string,
    cantidad_solicitada : number,
    cantidad_entregada  : number,
}

export interface SolicitudCustom {
    id                  : string,
    codigo              : string,
    nombre_solicitante  : string,
    nombre_aprobador    : string,
    nombre_recepcionador: string,
    fecha_solicitud     : Date,
    fecha_envio         : Date,
    fecha_aprobacion    : Date
    fecha_rechazo       : Date
    fecha_recepcion     : Date
    almacen             : string,
    estado              : string, 
    detalles            : DetalleSolicitud[]
}
/*
export interface Solicitud {
    id                  : string;
    codigo              : string;
    nombre_solicitante  : string;
    nombre_aprobador    : string;
    nombre_recepcionador: string;
    fecha_solicitud     : Date;
    fecha_envio         : Date;
    fecha_aprobacion    : Date;
    fecha_rechazo       : Date;
    fecha_recepcion     : Date;
    almacen             : Almacen; 
    estado              : string;
    objetivo            : string; 
    solicitante         : {      
        usuario: string;
        cargo: string;
    };
    productos           : DetalleSolicitud[]; 
}

export interface Almacen {
    id: string;
    nombre: string;
}

export interface DetalleSolicitud {
    id                  : string;
    idSolicitud         : string;
    nombreProducto      : string;
    unidad_medida       : string;
    cantidad_solicitada : number;
    cantidad_entregada  : number;
    stock_actual        : number; 
    id_ui               : string; 
}

export interface SolicitudCustom {
    id                  : string;
    codigo              : string;
    nombre_solicitante  : string;
    nombre_aprobador    : string;
    nombre_recepcionador: string;
    fecha_solicitud     : Date;
    fecha_envio         : Date;
    fecha_aprobacion    : Date;
    fecha_rechazo       : Date;
    fecha_recepcion     : Date;
    almacen             : Almacen; 
    estado              : string;
    objetivo            : string; 
    solicitante         : {       
        usuario: string;
        cargo: string;
    };
    detalles            : DetalleSolicitud[];
}*/