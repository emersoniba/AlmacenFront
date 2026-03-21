export interface EstadoIngreso {
    id: number;
    nombre: string;
    codigo: string;
    descripcion: string;
    orden: number;
}

export interface IngresoDetalle {
    id: number;
    ingreso: number;
    producto: number;
    producto_nombre: string;
    producto_codigo: string;
    producto_unidad: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
    stock_actualizado: boolean;
    fecha_actualizacion_stock: string | null;
}

export interface Ingreso {
    id: number;
    codigo: string;
    descripcion: string;
    comprobante: string;
    fecha_ingreso: string;
    proveedor: number;
    proveedor_nombre: string;
    proveedor_nit: string;
    almacen: number;
    almacen_nombre: string;
    almacen_sigla: string;
    subalmacen: number | null;
    subalmacen_nombre: string | null;
    subalmacen_sigla: string | null;
    gestion: number;
    estado: number;
    estado_nombre: string;
    estado_codigo: string;
    observacion_anulacion: string | null;
    fecha_anulacion: string | null;
    detalles: IngresoDetalle[];
    total: number;
    creado_por: number;
    creado_por_nombre: string;
    fecha_creacion: string;
}

export interface IngresoCreate {
    descripcion: string;
    comprobante: string;
    fecha_ingreso: string;
    proveedor: number;
    almacen: number;
    subalmacen: number | null;
    detalles: {
        producto: number;
        cantidad: number;
        precio_unitario: number;
    }[];
}