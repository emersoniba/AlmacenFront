import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SolicitudService } from 'src/app/services/solicitud.service';
import { ProductoService } from 'src/app/services/producto.service';
import { Solicitud, DetalleSolicitud } from 'src/app/models/solicitud.model';
import { Producto } from 'src/app/models/producto.model';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import { SwalAlertService } from 'src/app/utils/util.swal';
//import { PdfGeneratorService } from 'src/app/services/pdf-generator.services';

@Component({
  selector: 'app-entrega-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent],
  templateUrl: './entrega-productos.component.html',
  styleUrls: ['./entrega-productos.component.scss']
})
export class EntregaProductosComponent implements OnInit {
  solicitud: Solicitud | null = null;
  detallesConStock: any[] = [];
  loading = true;
  error = false;
  comentarios = '';
  idSolicitud: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private solicitudService: SolicitudService,
    private productoService: ProductoService,
    private toastr: ToastrService,
    private swalAlert: SwalAlertService,
   // private pdfGenerator: PdfGeneratorService
  ) { }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.idSolicitud = idParam ? parseInt(idParam, 10) : 0;

    if (this.idSolicitud) {
      this.cargarDatosSolicitud();
    } else {
      this.error = true;
      this.loading = false;
      this.toastr.error('ID de solicitud no válido');
    }
  }

  private cargarDatosSolicitud(): void {
    this.loading = true;
    this.solicitudService.getSolicitudById(this.idSolicitud).subscribe({
      next: (solicitud) => {
        this.solicitud = solicitud;
        this.cargarStockProductos();
      },
      error: (error) => {
        console.error('Error al cargar solicitud:', error);
        this.error = true;
        this.loading = false;
        this.toastr.error('Error al cargar la solicitud');
      }
    });
  }

  private cargarStockProductos(): void {
    this.productoService.getProductos().subscribe({
      next: (productosBD) => {
        this.prepararDetallesConStock(productosBD);
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

  private prepararDetallesConStock(productosBD: Producto[]): void {
    if (!this.solicitud?.detalles) return;

    this.detallesConStock = this.solicitud.detalles.map(detalle => {
      const productoBD = productosBD.find(p => p.id === detalle.producto);
      
      return {
        ...detalle,
        nombre: detalle.producto_nombre,
        unidad_de_medida: detalle.producto_unidad,
        stock: productoBD ? productoBD.stocks : 0,
        cantidad_entregar: detalle.cantidad_solicitada,
      };
    });
  }

  incrementarCantidad(index: number): void {
    const detalle = this.detallesConStock[index];
    if (detalle.cantidad_entregar < detalle.cantidad_solicitada) {
      detalle.cantidad_entregar++;
    }
  }

  decrementarCantidad(index: number): void {
    const detalle = this.detallesConStock[index];
    if (detalle.cantidad_entregar > 0) {
      detalle.cantidad_entregar--;
    }
  }

  actualizarCantidad(index: number, event: any): void {
    const value = parseInt(event.target.value, 10);
    const detalle = this.detallesConStock[index];

    if (!isNaN(value) && value >= 0 && value <= detalle.cantidad_solicitada) {
      detalle.cantidad_entregar = value;
    } else {
      detalle.cantidad_entregar = detalle.cantidad_solicitada;
    }
  }

  get totalProductosSolicitados(): number {
    return this.solicitud?.detalles?.reduce((total, detalle) => total + detalle.cantidad_solicitada, 0) || 0;
  }

  get totalProductosAEntregar(): number {
    return this.detallesConStock.reduce((total, detalle) => total + detalle.cantidad_entregar, 0);
  }

  onMarcarRecibido(): void {
    if (!this.solicitud?.id) return;

    const tieneEntregaParcial = this.detallesConStock.some(
      detalle => detalle.cantidad_entregar < detalle.cantidad_solicitada
    );

    if (tieneEntregaParcial) {
      this.swalAlert.confirmarEntregaParcial().then((result) => {
        if (result.isConfirmed) {
          this.confirmarEntrega();
        }
      });
    } else {
      this.confirmarEntrega();
    }
  }

  private confirmarEntrega(): void {
    this.swalAlert.confirmarEntrega(
      this.detallesConStock,
      this.totalProductosSolicitados,
      this.totalProductosAEntregar
    ).then((result) => {
      if (result.isConfirmed) {
        this.procesarEntrega();
      }
    });
  }

  private procesarEntrega(): void {
    // Preparar entregas según formato del backend
    const entregas = this.detallesConStock.map(detalle => ({
      detalle_id: detalle.id,
      cantidad_entregada: detalle.cantidad_entregar
    }));

    this.loading = true;
    this.solicitudService.entregarSolicitud(this.solicitud!.id, entregas, this.comentarios)
      .subscribe({
        next: () => {
          this.toastr.success('Entrega realizada correctamente');
          this.router.navigate(['/recepcionar']);
        },
        error: (error) => {
          console.error('Error al procesar entrega:', error);
          this.toastr.error(error.error?.message || 'Error al procesar la entrega');
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
    if (!this.solicitud?.id) return;

    this.loading = true;
    this.solicitudService.aprobarRechazarSolicitud(this.solicitud.id, false, this.comentarios || 'Solicitud rechazada por el almacenero')
      .subscribe({
        next: () => {
          this.toastr.success('Solicitud rechazada correctamente');
          this.router.navigate(['/recepcionador']);
        },
        error: (error) => {
          console.error('Error al rechazar:', error);
          this.toastr.error(error.error?.message || 'Error al procesar el rechazo');
          this.loading = false;
        }
      });
  }
/*
  onReport(): void {
    if (!this.solicitud || this.detallesConStock.length === 0) {
      this.toastr.warning('No hay datos para generar el reporte');
      return;
    }

    try {
      this.pdfGenerator.generarReporteEntrega(this.solicitud, this.detallesConStock);
      this.toastr.success('Reporte PDF generado correctamente');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      this.toastr.error('Error al generar el reporte PDF');
    }
  }
*/
  onCancel(): void {
    this.router.navigate(['/recepcionador']);
  }
}