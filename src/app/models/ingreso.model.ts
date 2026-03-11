
import { Almacen, SubAlmacen } from "./almacen.model";
//import { Material } from "./material.model";
import { Producto } from "./producto.model";
import { Proveedor } from "./proveedor.model";

export interface Ingreso {
    id              : string,
    codigo          : string,
    descripcion     : string,
    comprobante     : string,
    fechaIngreso    : Date,
    idProveedor     : Proveedor,
    idAlmacen       : Almacen,
    idSubAlmacen    : SubAlmacen,
    gestionInicial? : number,
    estado?         : string,
    detalles        : IngresoDetalle[],
    egreso?         : number,
    //idMaterial?     : Producto[],

}

export interface IngresoDetalle {
    id          : string,
    idIngreso   : Ingreso,
    idMaterial  : Producto,
    cantidad    : number,
    monto       : number,
}

export interface IngresoCustom {
    id              : string,
    codigo          : string,
    descripcion     : string,
    comprobante     : string,
    fechaIngreso    : Date,
    idProveedor     : Proveedor,
    idAlmacen       : Almacen,
    idSubAlmacen    : SubAlmacen,
    gestionInicial? : number,
    estado?         : string,
    detalles        : IngresoDetalle[],
}
