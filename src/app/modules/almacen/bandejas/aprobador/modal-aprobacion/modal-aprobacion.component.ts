import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Solicitud } from 'src/app/models/solicitud.model';
import { SolicitudService } from 'src/app/services/solicitud.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { A11yModule } from '@angular/cdk/a11y';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-aprobacion',
  standalone: true,
  imports: [CommonModule, MatButtonModule, A11yModule],
  templateUrl: './modal-aprobacion.component.html',
  styleUrls: ['./modal-aprobacion.component.scss']
})
export class ModalAprobacionComponent implements OnInit, AfterViewInit {
  solicitud: Solicitud | null = null;
  loading = false;
  error = false;
  @ViewChild('closeButton') closeButton!: ElementRef;
  @ViewChild('primaryAction') primaryAction!: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<ModalAprobacionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private solicitudService: SolicitudService,
    private toastr: ToastrService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cargarDatosSolicitud();
  }

  private cargarDatosSolicitud(): void {
    if (this.data.solicitud) {
      // Si ya tenemos los datos, usarlos
      this.solicitud = this.data.solicitud;
      
      // Si no tiene los detalles, cargarlos
      if (!this.solicitud?.detalles || this.solicitud.detalles.length === 0) {
        this.cargarDetallesSolicitud();
      }
    } else if (this.data.solicitudId) {
      this.cargarDetallesSolicitud();
    }
  }

  private cargarDetallesSolicitud(): void {
    this.loading = true;
    const solicitudId = this.data.solicitud?.id || this.data.solicitudId;
    
    this.solicitudService.getSolicitudById(solicitudId).subscribe({
      next: (solicitudCompleta) => {
        this.solicitud = solicitudCompleta;
        //
          console.log('Solicitud cargada:', {
                id: solicitudCompleta.id,
                codigo: solicitudCompleta.codigo,
                solicitante_nombre: solicitudCompleta.solicitante_nombre,
                solicitante_cargo: solicitudCompleta.solicitante_cargo,
                detalles: solicitudCompleta.detalles?.length
            });
            
        //
        this.loading = false;
        this.cdRef.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar solicitud:', error);
        this.error = true;
        this.loading = false;
        this.toastr.error('Error al cargar los detalles de la solicitud');
        this.cdRef.detectChanges();
      }
    });
  }

    get totalProductos(): number {
    if (!this.solicitud?.detalles) return 0;
    
    return this.solicitud.detalles.reduce((total, detalle) => {
      // Convertir a número por si viene como string
      const cantidad = typeof detalle.cantidad_solicitada === 'string' 
        ? parseFloat(detalle.cantidad_solicitada) 
        : detalle.cantidad_solicitada;
      return total + (isNaN(cantidad) ? 0 : cantidad);
    }, 0);
  }
  get totalProductosFormateado(): string {
    const total = this.totalProductos;
    // Si es un número entero, mostrar sin decimales
    if (total % 1 === 0) {
      return total.toString();
    }
    // Si tiene decimales, mostrar con 2 decimales
    return total.toFixed(2);
  }

  onAprobar(): void {
    if (!this.solicitud?.id) return;

    Swal.fire({
      title: 'Aprobar Solicitud',
      text: `¿Está seguro de aprobar la solicitud ${this.solicitud.codigo}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, aprobar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d'
    }).then((result) => {
      if (result.isConfirmed) {
        this.procesarAprobacion(true);
      }
    });
  }

  onRechazar(): void {
    if (!this.solicitud?.id) return;

    Swal.fire({
      title: 'Rechazar Solicitud',
      text: `¿Está seguro de rechazar la solicitud ${this.solicitud.codigo}?`,
      icon: 'warning',
      input: 'textarea',
      inputLabel: 'Observación (opcional)',
      inputPlaceholder: 'Ingrese el motivo del rechazo...',
      showCancelButton: true,
      confirmButtonText: 'Sí, rechazar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d'
    }).then((result) => {
      if (result.isConfirmed) {
        const observacion = result.value || '';
        this.procesarRechazo(observacion);
      }
    });
  }

  private procesarAprobacion(aprobar: boolean): void {
    this.loading = true;
    
    // CORRECCIÓN: Llamar con tres parámetros separados
    this.solicitudService.aprobarRechazarSolicitud(
        this.solicitud!.id, 
        true,  // aprobar
        'Solicitud aprobada'  // observacion
    ).subscribe({
        next: (response) => {
            this.toastr.success('Solicitud aprobada correctamente');
            this.dialogRef.close(true);
        },
        error: (error) => {
            console.error('Error al aprobar:', error);
            this.toastr.error(error.error?.message || 'Error al aprobar la solicitud');
            this.loading = false;
        }
    });
}

private procesarRechazo(observacion: string): void {
    this.loading = true;
    
    // CORRECCIÓN: Llamar con tres parámetros separados
    this.solicitudService.aprobarRechazarSolicitud(
        this.solicitud!.id, 
        false,  // aprobar
        observacion  // observacion
    ).subscribe({
        next: (response) => {
            this.toastr.success('Solicitud rechazada');
            this.dialogRef.close(true);
        },
        error: (error) => {
            console.error('Error al rechazar:', error);
            this.toastr.error(error.error?.message || 'Error al rechazar la solicitud');
            this.loading = false;
        }
    });
}
  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.solicitud?.estado_codigo === 'ENVIADO' && this.primaryAction) {
        this.primaryAction.nativeElement.focus();
      } else if (this.closeButton) {
        this.closeButton.nativeElement.focus();
      }
    }, 0);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  ngOnDestroy(): void {
    // Limpiar
  }
}