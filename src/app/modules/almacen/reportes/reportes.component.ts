import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ColDef, GridOptions, PaginationNumberFormatterParams } from 'ag-grid-community';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { Almacen, SubAlmacen } from 'src/app/models/almacen.model';
import { Ingreso } from 'src/app/models/ingreso.model';
import { AlmacenService } from 'src/app/services/almacen.service';
import { IngresoService } from 'src/app/services/ingreso.service';
import { SubAlmacenService } from 'src/app/services/subAlmacen.service';
import { HandleErrorMessage } from 'src/app/utils/handle.errors';
import { SwalAlertService } from 'src/app/utils/util.swal';
import { localeEs } from 'src/app/app.locale.es.grid';
import { ReportInvFisicoComponent } from './report-inv-fisico/report-inv-fisico.component';
import { ReportInvFisicoValoradoComponent } from './report-inv-fisico-valorado/report-inv-fisico-valorado.component';
import { RendererReportComponent } from './action-render/renderer-report.component';
import { ReportResumenKardexComponent } from './report-resumen-kardex/report-resumen-kardex.component';



@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.scss'
})
export class ReportesComponent {
  public labelForm: string = 'Reportes';
  public formRegistro: FormGroup;
  private dataSuscription: Subscription | undefined;
  public dataAlmacen: Almacen[] = [] as Almacen[];
  public dataIngreso: any[] = [];
  public dataSubAlmacen: SubAlmacen[] = [] as SubAlmacen[];

  public rowSelection: 'single' | 'multiple' = 'single';

  public gridOptions: GridOptions = <GridOptions>{
    reactiveCustomComponents: true,
    components: {
      actionRenderReport: RendererReportComponent
    },
    context: { componentParent: this }
  };

  public localEs = localeEs;
  public paginationPageSize = 10;
  public paginationPageSizeSelector: number[] | boolean = [10, 20, 50];

  public paginationNumberFormatter: (params: PaginationNumberFormatterParams) => string = (params: PaginationNumberFormatterParams) => {
    return params.value.toLocaleString();
  };

  public columnDefs: ColDef[] = [
    // { field: 'id_ui', headerName: 'Opciones', cellRenderer: 'actionRenderReport' },
    { field: 'id_ui', headerName: 'Opciones', filter: false, minWidth: 130, maxWidth: 130, cellRenderer: 'actionRenderReport', pinned: true, resizable: false, sortable: false },
    { field: 'nombre', headerName: 'Nombre Material', filter: true, minWidth: 200, floatingFilter: true },
    { field: 'unidad_de_medida', headerName: 'Unidad de medida', filter: true, minWidth: 150, floatingFilter: true },
    { headerName: 'Código', field: 'codigo', filter: true, floatingFilter: true, minWidth: 180, maxWidth: 200 },
    { field: 'stock', headerName: 'Stock', filter: true, minWidth: 100, floatingFilter: true },
    { field: 'egreso', headerName: 'Egresos', filter: true, minWidth: 100, floatingFilter: true },
    { field: 'almacen', headerName: 'Almacen', filter: true, minWidth: 200, floatingFilter: true },
    { headerName: 'Sub Almacen', field: 'subalmacen', filter: true, floatingFilter: true, minWidth: 210, maxWidth: 220 },
    { headerName: 'Cantidad', field: 'cantidad', filter: true, floatingFilter: true, minWidth: 100 },
    { headerName: 'Monto', field: 'monto', filter: true, floatingFilter: true, minWidth: 100, valueFormatter: (params) => { return params.value ? `$${params.value.toFixed(2)}` : ''; } },
  ];

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private almacenService: AlmacenService,
    private subAlmacenService: SubAlmacenService,
    private alertService: SwalAlertService,
    private ingresoServce: IngresoService
  ) {
    this.formRegistro = this.fb.group({
      idAlmacen: ['', Validators.required],
      idSubAlmacen: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.getAllAlmacenes();
    this.getIngresos();
  }

  public getIngresos() {
    this.dataSuscription = this.ingresoServce.getIngresos().subscribe({
      next: (response: Ingreso[]) => {
        this.dataIngreso = this.mapIngresosToGridData(response);
      },
      error: (err) => {
        this.dataIngreso = [];
        this.toastr.error(HandleErrorMessage(err), 'Error');
      },
    });
  }

  private mapIngresosToGridData(ingresos: Ingreso[]): any[] {
    const gridData: any[] = [];

    ingresos.forEach(ingreso => {

      if (ingreso.detalles && ingreso.detalles.length > 0) {
        ingreso.detalles.forEach(detalle => {
          gridData.push({
            id_ui: detalle.id,
            nombre: detalle.idMaterial?.nombre || 'N/A',
            unidad_de_medida: detalle.idMaterial?.unidad || 'N/A',
            codigo: ingreso.codigo,
            egreso: ingreso.egreso,
            stock: detalle.cantidad,
            almacen: ingreso.idAlmacen?.nombre || 'N/A',
            subalmacen: ingreso.idSubAlmacen?.nombre || 'N/A',
            cantidad: detalle.cantidad,
            monto: detalle.monto,
            idIngreso: ingreso.id,
            descripcion: ingreso.descripcion,
            fechaIngreso: ingreso.fechaIngreso
          });
        });
      } else {
        gridData.push({
          id_ui: ingreso.id,
          nombre: 'Sin detalles',
          unidad_de_medida: 'N/A',
          codigo: ingreso.codigo,
          stock: 0,
          almacen: ingreso.idAlmacen?.nombre || 'N/A',
          subalmacen: ingreso.idSubAlmacen?.nombre || 'N/A',
          cantidad: 0,
          monto: 0,
          idIngreso: ingreso.id,
          descripcion: ingreso.descripcion,
          fechaIngreso: ingreso.fechaIngreso
        });
      }
    });

    return gridData;
  }

  public getAllAlmacenes() {
    this.almacenService.getAlmacenes().subscribe({
      next: (response) => {
        this.dataAlmacen = response;
      },
      error: (err) => {
        this.toastr.error(HandleErrorMessage(err), 'Error');
      }
    });
  }

  public getSubAlmacenes(idAlmacen: string) {
    this.subAlmacenService.getSubAlmacenesAlmacen(idAlmacen).subscribe({
      next: (response) => {
        this.dataSubAlmacen = response;
      },
      error: (err) => {
        this.toastr.error(HandleErrorMessage(err), 'Error');
        this.dataSubAlmacen = [] as SubAlmacen[];
      }
    });
  }
  //
  public async inventarioFisico() {
    // Comenta la validación temporalmente para probar sin filtros
    // if (this.formRegistro.invalid) {
    //   this.toastr.warning('Por favor, seleccione almacén y sub almacén', 'Advertencia');
    //   return;
    // }

    try {
      // Usar todos los datos sin filtrar temporalmente
      const ingresosFiltrados = await this.obtenerTodosLosIngresos();
      const productosInventario = this.calcularInventario(ingresosFiltrados);
      this.toastr.success('Reporte PDF generado correctamente');
      if (productosInventario.length === 0) {
        this.toastr.warning('No hay datos para generar el reporte', 'Advertencia');
        return;
      }

      const reportService = new ReportInvFisicoComponent();
      await reportService.generarReporteInventarioFisico('Todos los Almacenes', 'Todos los Sub Almacenes', productosInventario);

    } catch (error) {
      this.toastr.error('Error al generar el reporte de inventario físico', 'Error');
      console.error('Error:', error);
      this.toastr.error('Error al generar el reporte PDF');

    }
  }

  private async obtenerTodosLosIngresos(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.ingresoServce.getIngresos().subscribe({
        next: (response: Ingreso[]) => {
          resolve(response);
        },
        error: (err) => {
          reject(err);
        }
      });
    });
  }
  /*public async inventarioFisico() {
    if (this.formRegistro.invalid) {
      this.toastr.warning('Por favor, seleccione almacén y sub almacén', 'Advertencia');
      return;
    }

    const idAlmacen = this.formRegistro.get('idAlmacen')?.value;
    const idSubAlmacen = this.formRegistro.get('idSubAlmacen')?.value;

    // Obtener nombres de almacén y sub almacén
    const almacen = this.dataAlmacen.find(a => a.id === idAlmacen)?.nombre || 'N/A';
    const subAlmacen = this.dataSubAlmacen.find(sa => sa.id === idSubAlmacen)?.nombre || 'N/A';

    try {
      // Obtener datos filtrados por almacén y sub almacén
      const ingresosFiltrados = await this.obtenerIngresosFiltrados(idAlmacen, idSubAlmacen);
      const productosInventario = this.calcularInventario(ingresosFiltrados);

      // Generar reporte
      const reportService = new ReportInvFisicoComponent();
      await reportService.generarReporteInventarioFisico(almacen, subAlmacen, productosInventario);

    } catch (error) {
      this.toastr.error('Error al generar el reporte de inventario físico', 'Error');
      console.error('Error:', error);
    }
  }
  */

  private async obtenerIngresosFiltrados(idAlmacen: string, idSubAlmacen: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.ingresoServce.getIngresos().subscribe({
        next: (response: Ingreso[]) => {
          // Filtrar ingresos por almacén y sub almacén seleccionados
          const filtrados = response.filter(ingreso => {
            // Verificar si los objetos existen antes de acceder a sus propiedades
            const matchAlmacen = ingreso.idAlmacen?.id === idAlmacen;
            const matchSubAlmacen = ingreso.idSubAlmacen?.id === idSubAlmacen;
            return matchAlmacen && matchSubAlmacen;
          });
          //console.log('Ingresos filtrados:', filtrados);
          resolve(filtrados);
        },
        error: (err) => {
          reject(err);
        }
      });
    });
  }

  private calcularInventario(ingresos: Ingreso[]): any[] {
    const inventarioMap = new Map();

    ingresos.forEach(ingreso => {

      if (ingreso.detalles && ingreso.detalles.length > 0) {
        ingreso.detalles.forEach(detalle => {
          const materialCodigo = detalle.idMaterial?.codigo || ingreso.codigo;
          const materialNombre = detalle.idMaterial?.nombre || 'N/A';
          const materialUnidad = detalle.idMaterial?.unidad || 'N/A';

          const key = `${materialCodigo}-${materialNombre}`;

          if (!inventarioMap.has(key)) {
            inventarioMap.set(key, {
              codigo: materialCodigo,
              nombre: materialNombre,
              unidad: materialUnidad,
              ingresos: 0,
              egresos: 0,
              saldo: 0
            });
          }
          const producto = inventarioMap.get(key);
          producto.ingresos = detalle.cantidad;
          producto.egresos = ingreso.egreso;
          producto.saldo = detalle.cantidad - ingreso.egreso;
        });
      }
    });

    return Array.from(inventarioMap.values());
  }

  public onChangeAlmacen(e: any) {
    if (e.value) {
      this.getSubAlmacenes(e.value);
    }
  }
  //fisicos valorados
  public async inventarioFisicoValorado() {
    try {
      const ingresosFiltrados = await this.obtenerTodosLosIngresos();
      const productosInventario = this.calcularInventarioValorado(ingresosFiltrados);
      this.toastr.success('Reporte PDF generado correctamente');
      if (productosInventario.length === 0) {
        this.toastr.warning('No hay datos para generar el reporte', 'Advertencia');
        return;
      }

      const reportService = new ReportInvFisicoValoradoComponent();
      await reportService.generarReporteInventarioFisicoValorado('Todos los Almacenes', 'Todos los Sub Almacenes', productosInventario);

    } catch (error) {
      this.toastr.error('Error al generar el reporte de inventario físico', 'Error');
      console.error('Error:', error);
      this.toastr.error('Error al generar el reporte PDF');

    }
  }

  private calcularInventarioValorado(ingresos: Ingreso[]): any[] {
    const inventarioMap = new Map();

    ingresos.forEach(ingreso => {

      if (ingreso.detalles && ingreso.detalles.length > 0) {
        ingreso.detalles.forEach(detalle => {
          const materialCodigo = detalle.idMaterial?.codigo || ingreso.codigo;
          const materialNombre = detalle.idMaterial?.nombre || 'N/A';
          const materialUnidad = detalle.idMaterial?.unidad || 'N/A';

          const key = `${materialCodigo}-${materialNombre}`;

          if (!inventarioMap.has(key)) {
            inventarioMap.set(key, {
              codigo: materialCodigo,
              nombre: materialNombre,
              unidad: materialUnidad,
              cantidad: 0,
              unitario: 0,
              monto: 0
            });
          }
          const producto = inventarioMap.get(key);
          producto.cantidad = detalle.cantidad;
          producto.unitario = detalle.monto;
          producto.monto = detalle.cantidad * detalle.monto;
        });
      }
    });

    return Array.from(inventarioMap.values());
  }
  //kardex
  // En reportes.component.ts - agrega este método
  public async resumenKardex() {
    try {
      const ingresosFiltrados = await this.obtenerTodosLosIngresos();
      const productosResumen = this.calcularResumenKardex(ingresosFiltrados);

      if (productosResumen.length === 0) {
        this.toastr.warning('No hay datos para generar el reporte', 'Advertencia');
        return;
      }

      const reportService = new ReportResumenKardexComponent();
      await reportService.generarReporteResumenKardex(
        'Todos los Almacenes',
        'Todos los Sub Almacenes',
        productosResumen
      );

      this.toastr.success('Reporte PDF generado correctamente');

    } catch (error) {
      this.toastr.error('Error al generar el reporte de resumen kardex', 'Error');
      console.error('Error:', error);
    }
  }

  private calcularResumenKardex(ingresos: Ingreso[]): any[] {
    const inventarioMap = new Map();

    ingresos.forEach(ingreso => {
      if (ingreso.detalles && ingreso.detalles.length > 0) {
        ingreso.detalles.forEach(detalle => {
          const materialCodigo = detalle.idMaterial?.codigo || ingreso.codigo;
          const materialNombre = detalle.idMaterial?.nombre || 'N/A';
          const materialUnidad = detalle.idMaterial?.unidad || 'N/A';

          // Extraer rubro del código (primeros 5 dígitos)
          const rubro = materialCodigo.substring(0, 5) + '00';

          const key = `${materialCodigo}-${materialNombre}`;

          if (!inventarioMap.has(key)) {
            inventarioMap.set(key, {
              codigo: materialCodigo,
              nombre: materialNombre,
              unidad: materialUnidad,
              rubro: rubro,
              fisico_inicial: 0,
              fisico_ingresos: 0,
              fisico_salidas: 0,
              fisico_saldo: 0,
              valorado_inicial: 0,
              valorado_ingresos: 0,
              valorado_salidas: 0,
              valorado_saldo: 0
            });
          }

          const producto = inventarioMap.get(key);

          // Determinar si es ingreso o egreso
          const esIngreso = ingreso.egreso === 0;
          const esEgreso = ingreso.egreso > 0;

          if (esIngreso) {
            producto.fisico_ingresos += detalle.cantidad;
            producto.valorado_ingresos += detalle.cantidad * detalle.monto;
          } else if (esEgreso) {
            producto.fisico_salidas += ingreso.egreso;
            producto.valorado_salidas += ingreso.egreso * detalle.monto;
          }

          // Calcular saldos
          producto.fisico_saldo = producto.fisico_ingresos - producto.fisico_salidas;
          producto.valorado_saldo = producto.valorado_ingresos - producto.valorado_salidas;
        });
      }
    });

    return Array.from(inventarioMap.values());
  }
  //metodos para kardex material individual
  public async obtenerIngresosPorMaterial(materialData: any): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.ingresoServce.getIngresos().subscribe({
        next: (response: Ingreso[]) => {
          // Filtrar ingresos que contengan el material específico
          const ingresosFiltrados = response.filter(ingreso =>
            ingreso.detalles.some(detalle =>
              detalle.idMaterial?.id_ui === materialData.id_ui ||
              detalle.idMaterial?.nombre === materialData.nombre
            )
          );
          resolve(ingresosFiltrados);
          console.log(ingresosFiltrados, 'xxxxxxxxxxxxxxxxxxxx')
        },
        error: (err) => {
          reject(err);
        }
      });
    });
  }
  // metodo para egresos individual
  public async obtenerEgresosPorMaterial(materialData: any): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.ingresoServce.getIngresos().subscribe({
        next: (response: Ingreso[]) => {
          const egresosFiltrados = response.filter(ingreso => {
            //if (ingreso.egreso !== 1) {
            if (ingreso.egreso <= 0) {

              return false;
            }
            const tieneMaterial = ingreso.detalles.some(detalle => {

              const coincideId = detalle.idMaterial?.id_ui === materialData.id_ui;
              const coincideNombre = detalle.idMaterial?.nombre === materialData.nombre;
              return coincideId || coincideNombre;
            });

            return tieneMaterial;
          });
          resolve(egresosFiltrados);
        },
        error: (err) => {
          reject(err);
        }
      });
    });
  }
  //metodo para kardex unitario del material
  public async obtenerMovimientosKardex(materialData: any): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.ingresoServce.getIngresos().subscribe({
        next: (response: Ingreso[]) => {

          // Filtrar todos los movimientos (tanto ingresos como egresos) que contengan el material
          const movimientosFiltrados = response.filter(movimiento => {
            const tieneMaterial = movimiento.detalles.some(detalle => {
              const coincideId = detalle.idMaterial?.id_ui === materialData.id_ui;
              const coincideNombre = detalle.idMaterial?.nombre === materialData.nombre;
              return coincideId || coincideNombre;
            });

            return tieneMaterial;
          });


          resolve(movimientosFiltrados);
        },
        error: (err) => {
          reject(err);
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.dataSuscription?.unsubscribe();
  }
}