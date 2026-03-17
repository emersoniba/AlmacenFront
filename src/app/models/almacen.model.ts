export interface Almacen {
    id      : number,
    nombre  : string,
    sigla   : string,
    entity?: string 
}
export interface Almacen {
    id: number;           // El backend usa number, no string
    nombre: string;
    sigla: string;
    ubicacion?: string;
    activo?: boolean;
}

export interface SubAlmacen {
    id: number;           // El backend usa number, no string
    almacen: number;      // ID del almacén padre (esto es lo que necesitas para filtrar)
    nombre: string;
    sigla: string;
    ubicacion?: string;
    activo?: boolean;
    // Propiedades de solo lectura para mostrar en el grid
    almacen_nombre?: string;
    almacen_sigla?: string;
}