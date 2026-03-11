import { Almacen } from "./almacen.model";
import { SubAlmacen } from "./almacen.model";

export interface Producto {
    id_ui           : number,
    nombre          : string,
    unidad_de_medida: string,
    stock           : number,
    imagen          : string,
    id_almacen      : Almacen,
    id_subalmacen    : SubAlmacen,
    selected?        : boolean,
    almacen?         : string,
    cantidad?        : number,
    descripcion     : string,
    codigo          : string,
    unidad?         : string,
}
