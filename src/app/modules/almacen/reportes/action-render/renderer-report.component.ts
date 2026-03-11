import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { ToastrService } from 'ngx-toastr';
import { ReportMaterialIngresoComponent } from '../report-material-ingreso/report-material-ingreso.component';
import { ReportMaterialEgresoComponent } from '../report-material-egreso/report-material-egreso.component';
import { ReportMaterialKardexUnitarioComponent } from '../report-material-kardex-unitario/report-material-kardex-unitario.component';



@Component({
  selector: 'app-renderer-report',
  templateUrl: './renderer-report.component.html',
  styleUrl:'./renderer-report.component.scss'
})
export class RendererReportComponent implements ICellRendererAngularComp {
  public params: any;
  public isDisabled: boolean = false;

  constructor(private toastr: ToastrService) { }

  agInit(params: any): void {
    this.params = params;
    this.isDisabled = !params.data.nombre || params.data.nombre === 'Sin detalles';
  }

  refresh(params: ICellRendererParams): boolean {
    this.params = params;
    return true;
  }

  async ingresoMaterial(): Promise<void> {
    if (this.isDisabled) return;

    const materialData = this.params.data;
    try {
      this.toastr.info(`Generando reporte de ingresos para: ${materialData.nombre}`, 'Procesando');
      const parentComponent = this.params.context.componentParent;
      const ingresosFiltrados = await parentComponent.obtenerIngresosPorMaterial(materialData);
      const reportService = new ReportMaterialIngresoComponent();
      await reportService.generarReporteDetalleIngresosMaterial(materialData, ingresosFiltrados);
      this.toastr.success('Reporte generado correctamente', 'Éxito');

    } catch (error) {
      this.toastr.error('Error al generar el reporte', 'Error');
    }
  }

  async egresoMaterial(): Promise<void> {
    if (this.isDisabled) return;
    const materialData = this.params.data;
    try {
      this.toastr.info(`Buscando egresos para: ${materialData.nombre}`, 'Procesando');
      const parentComponent = this.params.context.componentParent;
      const egresosFiltrados = await parentComponent.obtenerEgresosPorMaterial(materialData);

      if (egresosFiltrados.length === 0) {
        this.toastr.warning(
          `No se encontraron egresos para el material: ${materialData.nombre}`,
          'Sin datos',
          {
            timeOut: 5000,
            progressBar: true,
            closeButton: true
          }
        );
        return;
      }

      const totalEgresos = egresosFiltrados.reduce((total, egreso) => total + (egreso.egreso || 0), 0);
      this.toastr.info(
        `Encontrados ${egresosFiltrados.length} egresos (${totalEgresos} unidades) para: ${materialData.nombre}`,
        'Generando PDF'
      );

      const reportService = new ReportMaterialEgresoComponent();
      await reportService.generarReporteDetalleEgresosMaterial(materialData, egresosFiltrados);

      this.toastr.success(
        `Reporte de egresos generado correctamente para: ${materialData.nombre}`,
        'Éxito',
        {
          timeOut: 3000,
          progressBar: true
        }
      );

    } catch (error) {
      this.toastr.error(
        `Error al generar el reporte de egresos para: ${materialData.nombre}`,
        'Error',
        {
          timeOut: 5000,
          progressBar: true,
          closeButton: true
        }
      );
    }
  }
  /*async egresoMaterial(): Promise<void> {
     if (this.isDisabled) return;
     const materialData = this.params.data;
     try {
         this.toastr.info(`Generando reporte de egresos para: ${materialData.nombre}`, 'Procesando');
         const parentComponent = this.params.context.componentParent;
         const egresosFiltrados = await parentComponent.obtenerEgresosPorMaterial(materialData);
         const reportService = new ReportMaterialEgresoComponent();
         await reportService.generarReporteDetalleEgresosMaterial(materialData, egresosFiltrados);
         this.toastr.success('Reporte de egresos generado correctamente', 'Éxito');
     } catch (error) {
         this.toastr.error('Error al generar el reporte de egresos', 'Error');
     }
 }
*/

  async kardexMaterial(): Promise<void> {
    if (this.isDisabled) return;

    const materialData = this.params.data;

    try {
      this.toastr.info(`Buscando movimientos para kardex: ${materialData.nombre}`, 'Procesando');

      const parentComponent = this.params.context.componentParent;
      const movimientosFiltrados = await parentComponent.obtenerMovimientosKardex(materialData);

      if (movimientosFiltrados.length === 0) {
        this.toastr.warning(
          `No se encontraron movimientos para el kardex del material: ${materialData.nombre}`,
          'Sin datos',
          { timeOut: 5000, progressBar: true, closeButton: true }
        );
        return;
      }

      this.toastr.info(`Generando kardex para: ${materialData.nombre}`, 'Generando PDF');
      const reportService = new ReportMaterialKardexUnitarioComponent();
      await reportService.generarReporteKardexMaterial(materialData, movimientosFiltrados);

      this.toastr.success(
        `Kardex generado correctamente para: ${materialData.nombre}`,
        'Éxito',
        { timeOut: 3000, progressBar: true }
      );

    } catch (error) {
      console.error('🔴 RENDERER - Error al generar kardex:', error);
      this.toastr.error(
        `Error al generar el kardex para: ${materialData.nombre}`,
        'Error',
        { timeOut: 5000, progressBar: true, closeButton: true }
      );
    }
  }
}