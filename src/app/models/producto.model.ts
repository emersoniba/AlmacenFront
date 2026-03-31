export interface UnidadMedida {
    id: number;
    codigo: string;
    nombre: string;
    abreviatura: string;
}

export interface CategoriaProducto {
    id: number;
    nombre: string;
    descripcion: string;
}

export interface StockProducto {
    id: number;
    subalmacen: number;
    subalmacen_nombre: string;
    subalmacen_sigla: string;
    almacen_nombre: string;
    cantidad: number;
    ubicacion: string | null;
    fecha_ultimo_ingreso: string | null;
    fecha_ultimo_egreso: string | null;
}

export interface Producto {
    id: number;
    codigo: string;
    nombre: string;
    descripcion: string;
    unidad_medida: number;
    unidad_medida_nombre: string;
    unidad_medida_abrev: string;
    categoria: number;
    categoria_nombre: string;
    stock_minimo: number;
    stock_maximo: number;
    imagen: string | null;
    activo: boolean;
    stocks: StockProducto[];
    stock_total: number;
    ultimo_movimiento: {
        tipo: string;
        fecha: string;
        cantidad: number;
        subalmacen: string;
    } | null;
    creado_por: number;
    fecha_creacion: string;
    // Propiedes para el carrito de compras
    selected?: boolean;
    cantidad?: number;
}