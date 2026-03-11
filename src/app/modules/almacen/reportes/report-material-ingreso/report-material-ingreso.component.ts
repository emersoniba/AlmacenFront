import { Component } from '@angular/core';
import autoTable from 'jspdf-autotable';
import { ReportBaseService } from '../service-report/report-base.service';

interface DetalleIngresoMaterial {
  fecha: string;
  codigoIngreso: string;
  detalle: string;
  proveedor: string;
  cantidad: number;
  precioUnitario: number;
  precioTotal: number;
}

@Component({
  selector: 'app-report-detalle-ingresos-material',
  templateUrl: './report-material-ingreso.component.html',
  styleUrl: './report-material-ingreso.component.scss'
})
export class ReportMaterialIngresoComponent extends ReportBaseService {

  constructor() {
    super();
  }

  async generarReporteDetalleIngresosMaterial(
    materialData: any,
    ingresosFiltrados: any[]
  ): Promise<void> {
    const doc = this.crearDocumento();
    const fecha = new Date().toLocaleDateString('es-ES');

    try {
      await this.cargarImagenes();
    } catch (error) {
      console.warn('No se pudieron cargar las imágenes, continuando sin ellas...');
    }

    // Agregar cabecera a la primera página
    this.agregarCabeceraCompleta(doc, 'DETALLE DE INGRESOS');

    // Información del material
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    let yPosition = 55;

    // Información específica del material
    this.agregarTexto(doc, `Código: ${materialData.codigo || 'N/A'}`, 15, yPosition);
    yPosition += 7;
    this.agregarTexto(doc, `Material: ${materialData.nombre || 'N/A'}`, 15, yPosition);
    yPosition += 7;
    this.agregarTexto(doc, `Unidad: ${materialData.unidad_de_medida || 'N/A'}`, 15, yPosition);
    yPosition += 7;
    this.agregarTexto(doc, `Almacén: ${materialData.almacen || 'N/A'}`, 15, yPosition);
    yPosition += 7;
    this.agregarTexto(doc, `Sub Almacén: ${materialData.subalmacen || 'N/A'}`, 15, yPosition);
    yPosition += 10;

    // Preparar datos para la tabla
    const tableData = this.prepararDatosIngresosMaterial(ingresosFiltrados, materialData);
    autoTable(doc, {
      startY: yPosition,
      head: [['No', 'FECHA', 'DETALLE', 'PROVEEDOR', 'CANT.', 'P. UNIDAD', 'P. TOTAL (Bs.)']],
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
        0: { cellWidth: 8, halign: 'center' },   // No
        1: { cellWidth: 20 },                    // FECHA
        2: { cellWidth: 40 },                    // DETALLE
        3: { cellWidth: 35 },                    // PROVEEDOR
        4: { cellWidth: 15, halign: 'center' },  // CANT.
        5: { cellWidth: 20, halign: 'right' },   // P. UNIDAD
        6: { cellWidth: 25, halign: 'right' }    // P. TOTAL
      },
      margin: { top: 55, bottom: 60 },
      didDrawPage: (data) => {
        this.agregarCabeceraCompleta(doc, 'DETALLE DE INGRESOS');
        // Número de página
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Página ${data.pageNumber}`, 195, 15, { align: 'right' });

        // PIE DE PÁGINA en cada hoja
        this.agregarFirmasPiePagina(doc, data.pageNumber);
      }
    });

    // Guardar el PDF
    const nombreArchivo = `detalle_ingresos_${materialData.nombre?.replace(/[^a-zA-Z0-9]/g, '_') || 'material'}.pdf`;
    doc.save(nombreArchivo);
  }

  private prepararDatosIngresosMaterial(ingresos: any[], materialData: any): any[] {
    const datosIngresos: any[] = [];
    let totalCantidad = 0;
    let totalMonto = 0;
    ingresos.forEach((ingreso, index) => {

      if (ingreso.detalles && ingreso.detalles.length > 0) {

        ingreso.detalles.forEach((detalle: any, detalleIndex: number) => {

          const materialId = materialData.id_ui || materialData.id;
          const detalleMaterialId = detalle.idMaterial?.id || detalle.id;
          const detalleMaterialNombre = detalle.idMaterial?.nombre;
          const coincideId = detalleMaterialId === materialId;
          const coincideNombre = detalleMaterialNombre === materialData.nombre;

          if (coincideId || coincideNombre) {

            const fecha = new Date(ingreso.fechaIngreso).toLocaleDateString('es-ES');
            const cantidad = detalle.cantidad || 0;
            const precioUnitario = detalle.monto || 0;
            const precioTotal = cantidad * precioUnitario;

            const fila = [
              (datosIngresos.length + 1).toString(),
              fecha,
              ingreso.descripcion || 'Sin descripción',
              ingreso.idProveedor?.nombre || 'N/A',
              cantidad.toString(),
              `Bs. ${precioUnitario.toFixed(2)}`,
              `Bs. ${precioTotal.toFixed(2)}`
            ];

            datosIngresos.push(fila);

            totalCantidad += cantidad;
            totalMonto += precioTotal;

          } else {
          }
        });
      } else {
      }
    });


    // Si no hay datos, agregar una fila indicando que no hay ingresos
    if (datosIngresos.length === 0) {
      datosIngresos.push([
        '1',
        '-',
        'No se encontraron ingresos para este material',
        '-',
        '0',
        'Bs. 0.00',
        'Bs. 0.00'
      ]);
    }

    // Fila de totales
    const filaTotal = [
      '',
      'TOTAL',
      '',
      '',
      totalCantidad.toString(),
      '',
      `Bs. ${totalMonto.toFixed(2)}`
    ];


    return [...datosIngresos, filaTotal];
  }
}