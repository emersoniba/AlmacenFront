import { Component } from '@angular/core';
import autoTable from 'jspdf-autotable';
import { ReportBaseService } from '../service-report/report-base.service';

interface ProductoInventario {
  codigo: string;
  nombre: string;
  unidad: string;
  ingresos: number;
  egresos: number;
  saldo: number;
}

@Component({
  selector: 'app-report-inv-fisico',
  templateUrl: './report-inv-fisico.component.html',
})
export class ReportInvFisicoComponent extends ReportBaseService {

  constructor() {
    super();
  }

  async generarReporteInventarioFisico(
    almacen: string, 
    subAlmacen: string, 
    productos: ProductoInventario[]
  ): Promise<void> {
    const doc = this.crearDocumento();
    const fecha = new Date().toLocaleDateString('es-ES');

    try {
      await this.cargarImagenes();
    } catch (error) {
      console.warn('No se pudieron cargar las imágenes, continuando sin ellas...');
    }

    // Agregar cabecera a la primera página
    this.agregarCabeceraCompleta(doc, 'INVENTARIO FÍSICO');

    // Información del inventario
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    let yPosition = this.agregarInformacionAlmacen(doc, almacen, subAlmacen, fecha);

    // Preparar datos para la tabla
    const tableData = this.prepararDatosInventario(productos);

    autoTable(doc, {
      startY: yPosition,
      head: [['N°', 'Código', 'Artículo', 'Unidad', 'Ingresos', 'Egresos', 'Saldo']],
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
        4: { cellWidth: 18, halign: 'center' }, // Ingresos
        5: { cellWidth: 18, halign: 'center' }, // Egresos
        6: { cellWidth: 18, halign: 'center' }  // Saldo
      },
      margin: { top: 55, bottom: 60 },
      didDrawPage: (data) => {
        this.agregarCabeceraCompleta(doc, 'INVENTARIO FÍSICO');
        // Número de página
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Página ${data.pageNumber}`, 195, 15, { align: 'right' });

        // PIE DE PÁGINA en cada hoja
        this.agregarFirmasPiePagina(doc, data.pageNumber);
      }
    });

    // Guardar el PDF
    //doc.save(`inventario_fisico_${almacen}_${subAlmacen}_${fecha.replace(/\//g, '-')}.pdf`);
    doc.save(`inventario_fisico.pdf`);
  }

  private prepararDatosInventario(productos: ProductoInventario[]): any[] {
    console.log('Datos recibidos en prepararDatosInventario:', productos);

    const datosProductos = productos.map((producto, index) => [
      (index + 1).toString(),
      producto.codigo,
      producto.nombre,
      producto.unidad,
      producto.ingresos.toString(),
      producto.egresos.toString(),
      producto.saldo.toString(),
    ]);

    // Totales
    const totalIngresos = productos.reduce((sum, p) => sum + p.ingresos, 0);
    const totalEgresos = productos.reduce((sum, p) => sum + p.egresos, 0);
    const totalSaldo = productos.reduce((sum, p) => sum + p.saldo, 0);

    const filaTotal = [
      '',
      'TOTAL GENERAL',
      '',
      '',
      totalIngresos.toString(),
      totalEgresos.toString(),
      totalSaldo.toString(),
    ];

    return [...datosProductos, filaTotal];
  }
}