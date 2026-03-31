import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Producto, UnidadMedida, CategoriaProducto } from '../models/producto.model';



@Injectable({
    providedIn: 'root'
})
export class ProductoService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getProductos(): Observable<Producto[]> {
        return this.http.get<any>(`${this.apiUrl}/productos/`).pipe(
            map(response => response.data || response)
        );
    }

    getProductoById(id: number): Observable<Producto> {
        return this.http.get<any>(`${this.apiUrl}/productos/${id}/`).pipe(
            map(response => response.data || response)
        );
    }

    getProductosConStockBajo(): Observable<Producto[]> {
        return this.http.get<any>(`${this.apiUrl}/productos/con_stock_bajo/`).pipe(
            map(response => response.data || response)
        );
    }

    getMovimientosProducto(productoId: number, subalmacenId?: number): Observable<any[]> {
        let url = `${this.apiUrl}/productos/${productoId}/movimientos/`;
        if (subalmacenId) {
            url += `?subalmacen=${subalmacenId}`;
        }
        return this.http.get<any>(url).pipe(
            map(response => response.data || response)
        );
    }

    createProducto(producto: any): Observable<Producto> {
        return this.http.post<any>(`${this.apiUrl}/productos/`, producto).pipe(
            map(response => response.data || response)
        );
    }

    updateProducto(id: number, producto: any): Observable<Producto> {
        return this.http.put<any>(`${this.apiUrl}/productos/${id}/`, producto).pipe(
            map(response => response.data || response)
        );
    }

    deleteProducto(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/productos/${id}/`).pipe(
            map(response => response.data || response)
        );
    }
    // Obtener unidades de medida
    getUnidadesMedida(): Observable<UnidadMedida[]> {
        return this.http.get<any>(`${this.apiUrl}/unidades-medida/`).pipe(
            map(response => response.data || response)
        );
    }

    // Obtener categorías
    getCategorias(): Observable<CategoriaProducto[]> {
        return this.http.get<any>(`${this.apiUrl}/categorias-producto/`).pipe(
            map(response => response.data || response)
        );
    }
    // En producto.service.ts
    getProductosByAlmacen(almacenId: string): Observable<Producto[]> {
        return this.http.get<any>(`${this.apiUrl}/productos/?almacen=${almacenId}`).pipe(
            map(response => response.data || response)
        );
    }
}