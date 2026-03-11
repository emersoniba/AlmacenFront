import { Almacen } from "./almacen.model";

export interface ResponsableAlmacen {
    id              : string,
    idAlmacen       : Almacen,
    idResponsable?  : number,
    fechaDesde      : Date,
    fechaHasta      : Date,
}
