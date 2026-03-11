export interface Almacen {
    id      : string,
    nombre  : string,
    sigla   : string,
    //logo?   : string
    entity?: string 
}
// Interface para la respuesta del backend
export interface AlmacenResponse {
    data: Almacen;
}

export interface SubAlmacen {
    id          : string,
    idAlmacen   : string,
    almacen     : Almacen,
    nombre      : string,
    sigla       : string,
   // logo?       : string
}
