import { Component } from '@angular/core';
import autoTable from 'jspdf-autotable';
import { ReportBaseService } from '../service-report/report-base.service';

@Component({
  selector: 'app-report-material-egreso',
  standalone: true,
  imports: [],
  templateUrl: './report-material-egreso.component.html',
  styleUrl: './report-material-egreso.component.scss'
})
export class ReportMaterialEgresoComponent extends ReportBaseService {
  constructor() {
    super();
  }

  async generarReporteDetalleEgresosMaterial(
    materialData: any,
    egresosFiltrados: any[]
  ): Promise<void> {

    const doc = this.crearDocumento();
    const fecha = new Date().toLocaleDateString('es-ES');

    try {
      await this.cargarImagenes();
    } catch (error) {
      console.warn('No se pudieron cargar las imágenes, continuando sin ellas...');
    }

    // Agregar cabecera a la primera página
    this.agregarCabeceraCompleta(doc, 'DETALLE DE EGRESOS');

    // Información del material
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    let yPosition = 55;

    // Información específica del material (similar al PDF)
    this.agregarTexto(doc, `Código: ${materialData.codigo || 'N/A'}`, 15, yPosition);
    yPosition += 7;
    this.agregarTexto(doc, `Material: ${materialData.nombre || 'N/A'}`, 15, yPosition);
    yPosition += 7;
    this.agregarTexto(doc, `Unidad: ${materialData.unidad_de_medida || 'N/A'}`, 15, yPosition);
    yPosition += 7;
    this.agregarTexto(doc, `Almacén: ${materialData.almacen || 'N/A'}`, 15, yPosition);
    yPosition += 7;
    this.agregarTexto(doc, `Alm - Proyecto/Actividad: 001 - ADMINISTRACION CENTRAL`, 15, yPosition);
    yPosition += 10;

    // Preparar datos para la tabla
    const tableData = this.prepararDatosEgresosMaterial(egresosFiltrados, materialData);
    autoTable(doc, {
      startY: yPosition,
      head: [['No', 'FECHA', 'DETALLE', 'SOLICITANTE', 'OFICINA', 'CANT.']],
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
        3: { cellWidth: 35 },                    // SOLICITANTE
        4: { cellWidth: 45 },                    // OFICINA
        5: { cellWidth: 15, halign: 'center' }   // CANT.
      },
      margin: { top: 55, bottom: 60 },
      didDrawPage: (data) => {
        this.agregarCabeceraCompleta(doc, 'DETALLE DE EGRESOS');
        // Número de página
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Página ${data.pageNumber}`, 195, 15, { align: 'right' });

        // PIE DE PÁGINA en cada hoja
        this.agregarFirmasPiePagina(doc, data.pageNumber);
      }
    });

    // Guardar el PDF
    const nombreArchivo = `detalle_egresos_${materialData.nombre?.replace(/[^a-zA-Z0-9]/g, '_') || 'material'}.pdf`;
    doc.save(nombreArchivo);
  }

  private prepararDatosEgresosMaterial(egresos: any[], materialData: any): any[] {
    const datosEgresos: any[] = [];
    let totalCantidad = 0;
    egresos.forEach((egreso, index) => {

      // En tu estructura, los egresos también están en el array de ingresos con egreso = 1
      if (egreso.detalles && egreso.detalles.length > 0) {

        egreso.detalles.forEach((detalle: any, detalleIndex: number) => {

          // Verificar si este detalle corresponde al material seleccionado
          const materialId = materialData.id_ui || materialData.id;
          const detalleMaterialId = detalle.idMaterial?.id || detalle.id;
          const detalleMaterialNombre = detalle.idMaterial?.nombre;
          const coincideId = detalleMaterialId === materialId;
          const coincideNombre = detalleMaterialNombre === materialData.nombre;
          if (coincideId || coincideNombre) {

            const fecha = new Date(egreso.fechaIngreso).toLocaleDateString('es-ES');
            const cantidad = detalle.cantidad || 0;

            // Para egresos, necesitamos información adicional como solicitante y oficina
            // Como no está en tu modelo actual, usaremos datos por defecto o del ingreso
            const solicitante = egreso.idProveedor?.nombre || 'SOLICITANTE NO ESPECIFICADO';
            const oficina = egreso.idAlmacen?.nombre || 'OFICINA NO ESPECIFICADA';

            const fila = [
              (datosEgresos.length + 1).toString(),
              fecha,
              egreso.descripcion || 'Sin descripción',
              solicitante,
              oficina,
              cantidad.toString()
            ];

            datosEgresos.push(fila);

            totalCantidad += cantidad;

          } else {
          }
        });
      } else {
      }
    });


    // Si no hay datos, agregar una fila indicando que no hay egresos
    if (datosEgresos.length === 0) {
      datosEgresos.push([
        '1',
        '-',
        'No se encontraron egresos para este material',
        '-',
        '-',
        '0'
      ]);
    }

    // Fila de totales
    const filaTotal = [
      '',
      '',
      'TOTAL',
      '',
      '',
      totalCantidad.toString()
    ];
    return [...datosEgresos, filaTotal];
  }
}