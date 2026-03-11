import { Component } from '@angular/core';
import autoTable from 'jspdf-autotable';
import { ReportBaseService } from '../service-report/report-base.service';
//
@Component({
  selector: 'app-report-material-kardex-unitario',
  templateUrl: './report-material-kardex-unitario.component.html',
  styleUrl: './report-material-kardex-unitario.component.scss'
})
export class ReportMaterialKardexUnitarioComponent extends ReportBaseService {

  constructor() {
    super();
  }

  async generarReporteKardexMaterial(
    materialData: any,
    movimientosFiltrados: any[]
  ): Promise<void> {

    // Cambiar a orientación horizontal (landscape)
    const doc = this.crearDocumentoHorizontal(); // Nuevo método para documento horizontal

    const fechaActual = new Date().toLocaleDateString('es-ES');
    const fechaInicio = '02/01/2025';
    const fechaFin = '08/10/2025';

    try {
      await this.cargarImagenes();
    } catch (error) {
      console.warn('No se pudieron cargar las imágenes, continuando sin ellas...');
    }

    // Agregar cabecera a la primera página
    this.agregarCabeceraCompletaHorizontal(doc, 'KARDEX FISICO VALORADO'); // Nueva cabecera para horizontal

    // Información del kardex
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    let yPosition = 50; // Ajustar posición Y para horizontal

    // Fechas del reporte
    this.agregarTexto(doc, `Del: ${fechaInicio} - Al: ${fechaFin}`, 20, yPosition);
    yPosition += 8;

    // Línea separadora
    doc.setDrawColor(0, 0, 0);
    doc.line(20, yPosition, 275, yPosition); // Ajustar longitud para horizontal
    yPosition += 5;

    // Información específica del material - en dos columnas para mejor uso del espacio
    this.agregarTexto(doc, `Código: ${materialData.codigo || 'N/A'}`, 20, yPosition);
    this.agregarTexto(doc, `Material: ${materialData.nombre || 'N/A'}`, 120, yPosition);
    yPosition += 5;

    this.agregarTexto(doc, `Sub Rubro: 25500 - Publicidad`, 20, yPosition);
    this.agregarTexto(doc, `Unidad: ${materialData.unidad_de_medida || 'N/A'}`, 120, yPosition);
    yPosition += 5;

    this.agregarTexto(doc, `Almacén: ${materialData.almacen || 'N/A'}`, 20, yPosition);
    this.agregarTexto(doc, `Alm - Proyecto/Actividad: 001 - ADMINISTRACION CENTRAL`, 120, yPosition);
    yPosition += 10;

    // Preparar datos para la tabla
    const tableData = this.prepararDatosKardex(movimientosFiltrados, materialData);
    autoTable(doc, {
      startY: yPosition,
      head: [
        [
          { content: 'FECHA', rowSpan: 2 },
          { content: 'DETALLE', rowSpan: 2 },
          { content: 'UNIDAD SOLICITANTE', rowSpan: 2 },
          { content: 'No. DOCUMENTO', rowSpan: 2 },
          { content: 'INGRESOS', colSpan: 3, styles: { halign: 'center' } },
          { content: 'EGRESOS', colSpan: 2, styles: { halign: 'center' } },
          { content: 'SALDOS', colSpan: 2, styles: { halign: 'center' } }
        ],
        [
          'Cant.',
          'Monto',
          'Unitario',
          'Cant.',
          'Valor',
          'Cant.',
          'Monto'
        ]
      ],
      body: tableData,
      theme: 'grid',

      headStyles: {
        fillColor: [80, 80, 80],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'center',
        cellPadding: 2,
        minCellHeight: 7
      },
      bodyStyles: {
        fontSize: 7,
        minCellHeight: 6
      },
      styles: {
        fontSize: 7,
        cellPadding: 1,
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
        valign: 'middle'
      },
      columnStyles: {
        0: { cellWidth: 18, halign: 'center' }, // FECHA
        1: { cellWidth: 30 },                   // DETALLE
        2: { cellWidth: 30 },                   // UNIDAD SOLICITANTE
        3: { cellWidth: 30 },                   // No. DOCUMENTO
        4: { cellWidth: 15, halign: 'right' },  // ING Cant.
        5: { cellWidth: 20, halign: 'right' },  // ING Monto
        6: { cellWidth: 18, halign: 'right' },  // ING Unitario
        7: { cellWidth: 15, halign: 'right' },  // EGR Cant.
        8: { cellWidth: 20, halign: 'right' },  // EGR Valor
        9: { cellWidth: 15, halign: 'right' },  // SAL Cant.
        10: { cellWidth: 20, halign: 'right' }  // SAL Monto
      },

      margin: { top: yPosition, bottom: 40, left: 20, right: 20 },

      didDrawPage: (data) => {
        this.agregarCabeceraCompletaHorizontal(doc, 'KARDEX FISICO VALORADO');
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Página ${data.pageNumber}`, 275, 15, { align: 'right' });
        this.agregarFirmasPiePaginaHorizontal(doc, data.pageNumber);
      }
    });


    // Guardar el PDF
    const nombreArchivo = `kardex_${materialData.nombre?.replace(/[^a-zA-Z0-9]/g, '_') || 'material'}.pdf`;
    doc.save(nombreArchivo);
  }

  // Resto del código (prepararDatosKardex) permanece igual...
  private prepararDatosKardex(movimientos: any[], materialData: any): any[] {
    const datosKardex: any[] = [];
    let saldoCantidad = 0;
    let saldoMonto = 0;

    const movimientosOrdenados = movimientos.sort((a, b) =>
      new Date(a.fechaIngreso).getTime() - new Date(b.fechaIngreso).getTime()
    );

    movimientosOrdenados.forEach((movimiento, index) => {
      if (movimiento.detalles && movimiento.detalles.length > 0) {
        movimiento.detalles.forEach((detalle: any) => {
          const materialId = materialData.id_ui || materialData.id;
          const detalleMaterialId = detalle.idMaterial?.id || detalle.id;
          const detalleMaterialNombre = detalle.idMaterial?.nombre;

          const coincideId = detalleMaterialId === materialId;
          const coincideNombre = detalleMaterialNombre === materialData.nombre;

          if (coincideId || coincideNombre) {
            const fecha = new Date(movimiento.fechaIngreso).toLocaleDateString('es-ES');
            const cantidadIngreso = detalle.cantidad || 0;
            const cantidadEgreso = movimiento.egreso || 0;
            const unitario = detalle.monto || 0;
            const montoTotalIngreso = cantidadIngreso * unitario;
            const montoTotalEgreso = cantidadEgreso * unitario;

            // Calcular saldos
            saldoCantidad += cantidadIngreso - cantidadEgreso;
            saldoMonto += montoTotalIngreso - montoTotalEgreso;

            const fila = [
              fecha,
              movimiento.descripcion || 'Sin descripción',
              cantidadEgreso > 0 ? 'EGRESO' : 'INGRESO', 
              movimiento.codigo || movimiento.comprobante || 'N/A',
              cantidadIngreso > 0 ? cantidadIngreso.toLocaleString() : '',
              cantidadIngreso > 0 ? `Bs. ${montoTotalIngreso.toFixed(2)}` : '',
              cantidadIngreso > 0 ? `Bs. ${unitario.toFixed(2)}` : '',
              cantidadEgreso > 0 ? cantidadEgreso.toLocaleString() : '',
              cantidadEgreso > 0 ? `Bs. ${montoTotalEgreso.toFixed(2)}` : '',
              // SALDOS
              saldoCantidad.toLocaleString(),
              `Bs. ${saldoMonto.toFixed(2)}`
            ];

            datosKardex.push(fila);
          }
        });
      }
    });

    // Si no hay datos, agregar una fila indicando que no hay movimientos
    if (datosKardex.length === 0) {
      datosKardex.push([
        '-',
        'No se encontraron movimientos para este material',
        '-',
        '-',
        '', '', '', '', '', '0', 'Bs. 0.00'
      ]);
    }

    return datosKardex;
}
}