import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RecepcionadorService } from 'src/app/services/recepcionador.service';
import { ProductoService } from 'src/app/services/producto.service';
import { Aprobacion } from 'src/app/models/aprobacion.model';
import { Producto } from 'src/app/models/producto.model';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SolicitudAtendida } from 'src/app/models/solicitud-atendida.model';
import { AtendidasApiService } from 'src/app/services/atendidas.service';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import { SwalAlertService } from 'src/app/utils/util.swal';
import { PdfGeneratorService } from 'src/app/services/pdf-generator.services';

@Component({
  selector: 'app-entrega-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent],
  templateUrl: './entrega-productos.component.html',
  styleUrls: ['./entrega-productos.component.scss']
})
export class EntregaProductosComponent implements OnInit {
  aprobacion: Aprobacion | null = null;
  productosConStock: any[] = [];
  loading = true;
  error = false;
  comentarios = '';
  idAprobacion: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private recepcionadorService: RecepcionadorService,
    private productoService: ProductoService,
    private toastr: ToastrService,
    private atendidasApiService: AtendidasApiService,
    private swalAlert: SwalAlertService,
    private pdfGenerator: PdfGeneratorService

  ) { }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.idAprobacion = idParam ? parseInt(idParam, 10) : 0;

    if (this.idAprobacion) {
      this.cargarDatosAprobacion();
    } else {
      this.error = true;
      this.loading = false;
      this.toastr.error('ID de aprobación no válido');
    }
  }

  private cargarDatosAprobacion(): void {
    this.loading = true;
    this.recepcionadorService.obtenerSolicitudPorId(this.idAprobacion).subscribe({
      next: (aprobacion) => {
        this.aprobacion = aprobacion;
        this.cargarStockProductos();
      },
      error: (error) => {
        console.error('Error al cargar aprobación:', error);
        this.error = true;
        this.loading = false;
        this.toastr.error('Error al cargar la solicitud');
      }
    });
  }

  private cargarStockProductos(): void {
    this.productoService.getProductos().subscribe({
      next: (productosBD) => {
        this.prepararProductosConStock(productosBD);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.error = true;
        this.loading = false;
        this.toastr.error('Error al cargar el stock de productos');
      }
    });
  }

  private prepararProductosConStock(productosBD: Producto[]): void {
    if (!this.aprobacion) return;

    this.productosConStock = this.aprobacion.productos.map(productoSolicitado => {
      const productoBD = productosBD.find(p => p.id_ui === productoSolicitado.id_ui);

      return {
        ...productoSolicitado,
        stock: productoBD ? productoBD.stock : 0,
        cantidad_entregar: productoSolicitado.cantidad,
        stock_suficiente: productoBD ? (productoBD.stock >= productoSolicitado.cantidad) : false
      };
    });
  }

  incrementarCantidad(index: number): void {
    const producto = this.productosConStock[index];
    if (producto.cantidad_entregar < producto.cantidad) {
      producto.cantidad_entregar++;
    }
  }

  decrementarCantidad(index: number): void {
    const producto = this.productosConStock[index];
    if (producto.cantidad_entregar > 0) {
      producto.cantidad_entregar--;
    }
  }

  actualizarCantidad(index: number, event: any): void {
    const value = parseInt(event.target.value, 10);
    const producto = this.productosConStock[index];

    if (!isNaN(value) && value >= 0 && value <= producto.cantidad) {
      producto.cantidad_entregar = value;
    } else {
      producto.cantidad_entregar = producto.cantidad;
    }
  }

  get totalProductosSolicitados(): number {
    return this.aprobacion?.productos?.reduce((total, producto) => total + producto.cantidad, 0) || 0;
  }

  get totalProductosAEntregar(): number {
    return this.productosConStock.reduce((total, producto) => total + producto.cantidad_entregar, 0);
  }
  
  onMarcarRecibido(): void {
    if (!this.aprobacion?.id) return;

    const tieneEntregaParcial = this.productosConStock.some(
      producto => producto.cantidad_entregar < producto.cantidad
    );

    if (tieneEntregaParcial) {
      this.swalAlert.confirmarEntregaParcial().then((result) => {
        if (result.isConfirmed) {
          this.confirmarEntregaCompleta();
        }
      });
    } else {
      this.confirmarEntregaCompleta();
    }
  }

  private confirmarEntregaCompleta(): void {
    this.swalAlert.confirmarEntrega(
      this.productosConStock,
      this.totalProductosSolicitados,
      this.totalProductosAEntregar
    ).then((result) => {
      if (result.isConfirmed) {
        this.procesarEntrega();
      }
    });
  }

  private procesarEntrega(): void {
    const datosActualizados = {
      ...this.aprobacion,
      estado: 'recibido',
      fecha_recepcion: new Date().toISOString(),
      recepcionista: 'usuario_actual',
      comentarios_recepcion: this.comentarios,
      productos_entregados: this.productosConStock.map(producto => ({
        id_ui: producto.id_ui,
        nombre: producto.nombre,
        cantidad_solicitada: producto.cantidad,
        cantidad_entregada: producto.cantidad_entregar,
        unidad_de_medida: producto.unidad_de_medida
      }))
    };

    this.loading = true;
    this.recepcionadorService.actualizarEstadoRecepcion(this.aprobacion!.id, datosActualizados)
      .subscribe({
        next: () => {
          const atendida: SolicitudAtendida = {
            id: this.aprobacion!.id.toString(),
            solicitud_id: this.aprobacion!.solicitud_id,
            fecha_solicitud: this.aprobacion!.fecha_solicitud,
            solicitante: this.aprobacion!.solicitante,
            almacen: this.aprobacion!.almacen,
            objetivo: this.aprobacion!.objetivo,
            productos: this.aprobacion!.productos,
            estado: 'recibido',
            productos_count: this.totalProductosSolicitados,
            fecha_aprobacion: this.aprobacion!.fecha_aprobacion,
            aprobador: this.aprobacion!.aprobador,
            comentarios: this.aprobacion!.comentarios,
            fecha_recepcion: datosActualizados.fecha_recepcion,
            recepcionista: datosActualizados.recepcionista,
            comentarios_recepcion: this.comentarios,
            productos_entregados: datosActualizados.productos_entregados
          };

          this.atendidasApiService.agregarAtendida(atendida).subscribe({
            next: () => {
              this.toastr.success('Solicitud marcada como recibida correctamente');
              this.router.navigate(['/recepcionador']);
            },
            error: (error) => {
              console.error('Error al guardar atendida:', error);
              this.toastr.error('Error al guardar la solicitud atendida');
              this.loading = false;
            }
          });
        },
        error: (error) => {
          console.error('Error al marcar como recibido:', error);
          this.toastr.error('Error al procesar la recepción');
          this.loading = false;
        }
      });
  }

  onRechazar(): void {
    this.swalAlert.confirmarRechazo().then((result) => {
      if (result.isConfirmed) {
        this.procesarRechazo();
      }
    });
  }

  private procesarRechazo(): void {
    if (!this.aprobacion?.id) return;

    const datosRechazados = {
      ...this.aprobacion,
      estado: 'rechazado',
      fecha_recepcion: new Date().toISOString(),
      recepcionista: 'usuario_actual',
      comentarios_recepcion: this.comentarios || 'Solicitud rechazada por el almacenero',
      productos_entregados: []
    };

    this.loading = true;
    this.recepcionadorService.actualizarEstadoRecepcion(this.aprobacion.id, datosRechazados)
      .subscribe({
        next: () => {
          const atendida: SolicitudAtendida = {
            id: this.aprobacion!.id.toString(),
            solicitud_id: this.aprobacion!.solicitud_id,
            fecha_solicitud: this.aprobacion!.fecha_solicitud,
            solicitante: this.aprobacion!.solicitante,
            almacen: this.aprobacion!.almacen,
            objetivo: this.aprobacion!.objetivo,
            productos: this.aprobacion!.productos,
            estado: 'rechazado',
            productos_count: this.totalProductosSolicitados,
            fecha_aprobacion: this.aprobacion!.fecha_aprobacion,
            aprobador: this.aprobacion!.aprobador,
            comentarios: this.aprobacion!.comentarios,
            fecha_recepcion: datosRechazados.fecha_recepcion,
            recepcionista: datosRechazados.recepcionista,
            comentarios_recepcion: datosRechazados.comentarios_recepcion,
            productos_entregados: []
          };

          this.atendidasApiService.agregarAtendida(atendida).subscribe({
            next: () => {
              this.toastr.success('Solicitud rechazada correctamente');
              this.router.navigate(['/recepcionador']);
            },
            error: (error) => {
              console.error('Error al guardar atendida:', error);
              this.toastr.error('Error al guardar la solicitud atendida');
              this.loading = false;
            }
          });
        },
        error: (error) => {
          console.error('Error al rechazar la solicitud:', error);
          this.toastr.error('Error al procesar el rechazo');
          this.loading = false;
        }
      });
  }
  onReport(): void {
    if (!this.aprobacion || this.productosConStock.length === 0) {
      this.toastr.warning('No hay datos para generar el reporte');
      return;
    }

    try {
      this.pdfGenerator.generarReporteEntrega(this.aprobacion, this.productosConStock);
      this.toastr.success('Reporte PDF generado correctamente');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      this.toastr.error('Error al generar el reporte PDF');
    }
  }

  onCancel(): void {
    this.router.navigate(['/recepcionar']);
  }
}