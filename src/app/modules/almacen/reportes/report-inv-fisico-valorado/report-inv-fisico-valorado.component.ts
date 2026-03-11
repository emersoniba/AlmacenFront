import { Component } from '@angular/core';
import autoTable from 'jspdf-autotable';
import { ReportBaseService } from '../service-report/report-base.service';

interface ProductoInventarioValorado {
  codigo: string;
  nombre: string;
  unidad: string;
  cantidad: number;
  unitario: number;
  monto: number;
}

@Component({
  selector: 'app-report-inv-fisico-valorado',
  templateUrl: './report-inv-fisico-valorado.component.html',
})
export class ReportInvFisicoValoradoComponent extends ReportBaseService {

  constructor() {
    super();
  }

  async generarReporteInventarioFisicoValorado(
    almacen: string,
    subAlmacen: string,
    productos: ProductoInventarioValorado[]
  ): Promise<void> {
    const doc = this.crearDocumento();
    const fecha = new Date().toLocaleDateString('es-ES');

    try {
      await this.cargarImagenes();
    } catch (error) {
      console.warn('No se pudieron cargar las imágenes, continuando sin ellas...');
    }

    // Agregar cabecera a la primera página
    this.agregarCabeceraCompleta(doc, 'INVENTARIO FÍSICO VALORADO');

    // Información del inventario
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    let yPosition = this.agregarInformacionAlmacen(doc, almacen, subAlmacen, fecha);

    // Preparar datos para la tabla
    const tableData = this.prepararDatosInventario(productos);

    autoTable(doc, {
      startY: yPosition,
      head: [['N°', 'Código', 'Artículo', 'Unidad', 'Cantidad', 'Unitario', 'Monto']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [95, 95, 95],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 8
      },
      bodyStyles: {
        fontSize: 7
      },
      styles: {
        fontSize: 7,
        cellPadding: 2,
        lineColor: [0, 0, 0],
        lineWidth: 0.1
      },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },  // N°
        1: { cellWidth: 25 },                   // Código
        2: { cellWidth: 60 },                   // Artículo
        3: { cellWidth: 15, halign: 'center' }, // Unidad
        4: { cellWidth: 18, halign: 'center' }, // Cantidad
        5: { cellWidth: 18, halign: 'center' }, // Unitario
        6: { cellWidth: 18, halign: 'center' }  // Monto
      },
      margin: { top: 55, bottom: 60 },
      didDrawPage: (data) => {
        this.agregarCabeceraCompleta(doc, 'INVENTARIO FÍSICO VALORADO');
        // Número de página
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Página ${data.pageNumber}`, 195, 15, { align: 'right' });

        // PIE DE PÁGINA en cada hoja
        this.agregarFirmasPiePagina(doc, data.pageNumber);
      }
    });

    // Guardar el PDF
    //doc.save(`inventario_fisico_valorado_${almacen}_${subAlmacen}_${fecha.replace(/\//g, '-')}.pdf`);
    doc.save(`inventario_fisico_valorado.pdf`);
  }

  private prepararDatosInventario(productos: ProductoInventarioValorado[]): any[] {
    console.log('Datos recibidos en prepararDatosInventario:', productos);

    const datosProductos = productos.map((producto, index) => [
      (index + 1).toString(),
      producto.codigo,
      producto.nombre,
      producto.unidad,
      producto.cantidad.toString(),
      producto.unitario.toFixed(2),
      producto.monto.toFixed(2),
    ]);

    // Totales
    const totalCantidad = productos.reduce((sum, p) => sum + p.cantidad, 0);
    const totalUnitario = productos.reduce((sum, p) => sum + p.unitario, 0);
    const totalMonto = productos.reduce((sum, p) => sum + p.monto, 0);

    const filaTotal = [
      '',
      'TOTAL GENERAL',
      '',
      '',
      totalCantidad.toString(),
      totalUnitario.toFixed(2),
      totalMonto.toFixed(2),
    ];

    return [...datosProductos, filaTotal];
  }
}