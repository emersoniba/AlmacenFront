// report-resumen-kardex.component.ts
import { Component } from '@angular/core';
import autoTable from 'jspdf-autotable';
import { ReportBaseService } from '../service-report/report-base.service';

interface ProductoKardex {
  codigo: string;
  nombre: string;
  unidad: string;
  fisico_inicial: number;
  fisico_ingresos: number;
  fisico_salidas: number;
  fisico_saldo: number;
  valorado_inicial: number;
  valorado_ingresos: number;
  valorado_salidas: number;
  valorado_saldo: number;
  rubro?: string;
}

@Component({
  selector: 'app-report-resumen-kardex',
  templateUrl: './report-resumen-kardex.component.html',
})
export class ReportResumenKardexComponent extends ReportBaseService {

  constructor() {
    super();
  }

  async generarReporteResumenKardex(
    almacen: string,
    subAlmacen: string,
    productos: ProductoKardex[]
  ): Promise<void> {
    // Usar orientación horizontal
    const doc = this.crearDocumentoHorizontal();
    const fechaActual = new Date().toLocaleDateString('es-ES');
    const fechaInicio = '02/01/2025';
    const fechaFin = '08/10/2025';

    try {
      await this.cargarImagenes();
    } catch (error) {
      console.warn('No se pudieron cargar las imágenes, continuando sin ellas...');
    }

    // Agregar cabecera
    this.agregarCabeceraCompletaHorizontal(doc, 'RESUMEN KARDEX');

    // Información del reporte
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    let yPosition = 45;
    // Fechas del reporte
    this.agregarTexto(doc, `Del: ${fechaInicio} - AL ${fechaFin}`, 20, yPosition);
    yPosition += 8;

    // Información del almacén
    this.agregarTexto(doc, `Almacén: ${almacen}`, 20, yPosition);
    this.agregarTexto(doc, `Alm - Proyecto/Actividad: ${subAlmacen}`, 120, yPosition);
    yPosition += 10;

    // Preparar datos agrupados por rubro
    const { datosAgrupados, rubros } = this.agruparPorRubro(productos);

    // Generar tabla para cada rubro
    rubros.forEach((rubro, rubroIndex) => {
      const productosRubro = datosAgrupados[rubro];
      
      // Si no es el primer rubro, agregar nueva página
      if (rubroIndex > 0) {
        doc.addPage();
        this.agregarCabeceraCompletaHorizontal(doc, 'RESUMEN KARDEX');
        yPosition = 45;
        this.agregarTexto(doc, `Del: ${fechaInicio} - AL ${fechaFin}`, 20, yPosition);
        yPosition += 8;
        this.agregarTexto(doc, `Almacén: ${almacen}`, 20, yPosition);
        this.agregarTexto(doc, `Alm - Proyecto/Actividad: ${subAlmacen}`, 120, yPosition);
        yPosition += 10;
      }

      // Agregar nombre del rubro
      doc.setFontSize(9);
      doc.setFont(undefined, 'bold');
      this.agregarTexto(doc, rubro, 20, yPosition);
      doc.setFont(undefined, 'normal');
      yPosition += 6;

      // Generar tabla para el rubro actual
      const tableData = this.prepararDatosRubro(productosRubro);

      autoTable(doc, {
        startY: yPosition,
        head: [
          [
            'CODIGO',
            'ARTICULO', 
            'UNIDAD',
            { content: 'FISICO', colSpan: 4, styles: { halign: 'center' } },
            { content: 'VALORADO', colSpan: 4, styles: { halign: 'center' } }
          ],
          [
            '', '', '',
            'INICIAL', 'INGRESOS', 'SALIDAS', 'SALDO',
            'INICIAL', 'INGRESOS', 'SALIDAS', 'SALDO'
          ]
        ],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [80, 80, 80],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 7,
          halign: 'center',
          cellPadding: 2,
          minCellHeight: 8
        },
        bodyStyles: {
          fontSize: 6,
          minCellHeight: 6
        },
        styles: {
          fontSize: 6,
          cellPadding: 1,
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
          valign: 'middle'
        },
        columnStyles: {
          0: { cellWidth: 25, halign: 'left' },    // CODIGO
          1: { cellWidth: 60 },                    // ARTICULO
          2: { cellWidth: 15, halign: 'center' },  // UNIDAD
          3: { cellWidth: 20, halign: 'right' },   // FISICO INICIAL
          4: { cellWidth: 20, halign: 'right' },   // FISICO INGRESOS
          5: { cellWidth: 20, halign: 'right' },   // FISICO SALIDAS
          6: { cellWidth: 20, halign: 'right' },   // FISICO SALDO
          7: { cellWidth: 15, halign: 'right' },   // VALORADO INICIAL
          8: { cellWidth: 20, halign: 'right' },   // VALORADO INGRESOS
          9: { cellWidth: 15, halign: 'right' },   // VALORADO SALIDAS
          10: { cellWidth: 15, halign: 'right' }   // VALORADO SALDO
        },
        margin: { top: yPosition, bottom: 40, left: 20, right: 20 },
        didDrawPage: (data) => {
          this.agregarCabeceraCompletaHorizontal(doc, 'RESUMEN KARDEX');
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text(`Página ${data.pageNumber}`, 275, 15, { align: 'right' });
          this.agregarFirmasPiePaginaHorizontal(doc, data.pageNumber);
        }
      });

      // Obtener la posición Y después de la tabla para el siguiente rubro
      const lastAutoTable = (doc as any).lastAutoTable;
      yPosition = lastAutoTable.finalY + 5;
    });

    // Guardar el PDF
    const nombreArchivo = `resumen_kardex_${almacen.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    doc.save(nombreArchivo);
  }

  private agruparPorRubro(productos: ProductoKardex[]): { datosAgrupados: any, rubros: string[] } {
    const datosAgrupados: { [key: string]: ProductoKardex[] } = {};
    const rubros: string[] = [];

    productos.forEach(producto => {
      const rubro = producto.rubro || 'SIN RUBRO';
      
      if (!datosAgrupados[rubro]) {
        datosAgrupados[rubro] = [];
        rubros.push(rubro);
      }
      
      datosAgrupados[rubro].push(producto);
    });

    return { datosAgrupados, rubros };
  }

  private prepararDatosRubro(productos: ProductoKardex[]): any[] {
    const tableData: any[] = [];
    let totalFisicoInicial = 0;
    let totalFisicoIngresos = 0;
    let totalFisicoSalidas = 0;
    let totalFisicoSaldo = 0;
    let totalValoradoInicial = 0;
    let totalValoradoIngresos = 0;
    let totalValoradoSalidas = 0;
    let totalValoradoSaldo = 0;

    productos.forEach((producto, index) => {
      const fila = [
        producto.codigo,
        producto.nombre,
        producto.unidad,
        // FISICO
        producto.fisico_inicial.toLocaleString(),
        producto.fisico_ingresos.toLocaleString(),
        producto.fisico_salidas.toLocaleString(),
        producto.fisico_saldo.toLocaleString(),
        // VALORADO
        `Bs. ${producto.valorado_inicial.toFixed(2)}`,
        `Bs. ${producto.valorado_ingresos.toFixed(2)}`,
        `Bs. ${producto.valorado_salidas.toFixed(2)}`,
        `Bs. ${producto.valorado_saldo.toFixed(2)}`
      ];

      tableData.push(fila);

      // Acumular totales
      totalFisicoInicial += producto.fisico_inicial;
      totalFisicoIngresos += producto.fisico_ingresos;
      totalFisicoSalidas += producto.fisico_salidas;
      totalFisicoSaldo += producto.fisico_saldo;
      totalValoradoInicial += producto.valorado_inicial;
      totalValoradoIngresos += producto.valorado_ingresos;
      totalValoradoSalidas += producto.valorado_salidas;
      totalValoradoSaldo += producto.valorado_saldo;
    });

    // Agregar fila de totales del rubro
    const filaTotal = [
      `Total: ${productos[0]?.rubro || 'SIN RUBRO'}`,
      '', '', // Código, Artículo, Unidad vacíos
      // FISICO
      totalFisicoInicial.toLocaleString(),
      totalFisicoIngresos.toLocaleString(),
      totalFisicoSalidas.toLocaleString(),
      totalFisicoSaldo.toLocaleString(),
      // VALORADO
      `Bs. ${totalValoradoInicial.toFixed(2)}`,
      `Bs. ${totalValoradoIngresos.toFixed(2)}`,
      `Bs. ${totalValoradoSalidas.toFixed(2)}`,
      `Bs. ${totalValoradoSaldo.toFixed(2)}`
    ];

    tableData.push(filaTotal);

    return tableData;
  }
}