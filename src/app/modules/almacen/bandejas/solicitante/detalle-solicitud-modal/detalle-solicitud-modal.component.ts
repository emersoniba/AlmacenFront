import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Solicitud } from 'src/app/models/solicitud.model';
import { SolicitudService } from 'src/app/services/solicitud.service';
import { ToastrService } from 'ngx-toastr';
import moment from 'moment';

@Component({
    selector: 'app-detalle-solicitud-modal',
   // standalone: true,
   // imports: [CommonModule, MatButtonModule],
    templateUrl: './detalle-solicitud-modal.component.html',
    styleUrls: ['./detalle-solicitud-modal.component.css']
})
export class DetalleSolicitudModalComponent implements OnInit {
    solicitud: Solicitud | null = null;
    loading = false;
    error = false;

    constructor(
        public dialogRef: MatDialogRef<DetalleSolicitudModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { solicitud: Solicitud; solicitudId?: number },
        private solicitudService: SolicitudService,
        private toastr: ToastrService
    ) { }

    ngOnInit(): void {
        this.cargarDatos();
    }

    private cargarDatos(): void {
        // Si ya tenemos la solicitud completa con detalles
        if (this.data.solicitud && this.data.solicitud.detalles && this.data.solicitud.detalles.length > 0) {
            this.solicitud = this.data.solicitud;
            return;
        }

        // Si solo tenemos el ID, cargar desde el servicio
        const solicitudId = this.data.solicitud?.id || this.data.solicitudId;
        if (solicitudId) {
            this.loading = true;
            this.solicitudService.getSolicitudById(solicitudId).subscribe({
                next: (solicitud) => {
                    this.solicitud = solicitud;
                    this.loading = false;
                },
                error: (error) => {
                    console.error('Error al cargar solicitud:', error);
                    this.error = true;
                    this.loading = false;
                    this.toastr.error('Error al cargar los detalles de la solicitud');
                }
            });
        } else if (this.data.solicitud) {
            this.solicitud = this.data.solicitud;
        }
    }

    getTotalProductos(): number {
        if (!this.solicitud?.detalles) return 0;
        return this.solicitud.detalles.reduce((total, detalle) => {
            const cantidad = typeof detalle.cantidad_solicitada === 'string'
                ? parseFloat(detalle.cantidad_solicitada)
                : detalle.cantidad_solicitada;
            return total + (isNaN(cantidad) ? 0 : cantidad);
        }, 0);
    }

    getTotalEntregados(): number {
        if (!this.solicitud?.detalles) return 0;
        return this.solicitud.detalles.reduce((total, detalle) => {
            const cantidad = typeof detalle.cantidad_entregada === 'string'
                ? parseFloat(detalle.cantidad_entregada)
                : detalle.cantidad_entregada;
            return total + (isNaN(cantidad) ? 0 : cantidad);
        }, 0);
    }

    getEstadoBadgeClass(): string {
        if (!this.solicitud) return 'bg-secondary';

        switch (this.solicitud.estado_codigo) {
            case 'PENDIENTE': return 'bg-secondary';
            case 'ENVIADO': return 'bg-primary';
            case 'APROBADO': return 'bg-success';
            case 'RECHAZADO': return 'bg-danger';
            case 'ENTREGADO': return 'bg-info';
            default: return 'bg-warning';
        }
    }

    getEstadoIcon(): string {
        if (!this.solicitud) return 'ti ti-clock';

        switch (this.solicitud.estado_codigo) {
            case 'PENDIENTE': return 'ti ti-file';
            case 'ENVIADO': return 'ti ti-send';
            case 'APROBADO': return 'ti ti-check';
            case 'RECHAZADO': return 'ti ti-ban';
            case 'ENTREGADO': return 'ti ti-truck';
            default: return 'ti ti-clock';
        }
    }

    formatDate(date: string | null): string {
        if (!date) return '-';
        return moment(date).format('DD/MM/YYYY HH:mm');
    }

    formatCantidad(cantidad: any): string {
        if (cantidad === undefined || cantidad === null) return '0';
        const num = typeof cantidad === 'string' ? parseFloat(cantidad) : cantidad;
        if (isNaN(num)) return '0';
        // Si es entero, mostrar sin decimales
        if (num % 1 === 0) return num.toString();
        // Si tiene decimales, mostrar con 2 decimales
        return num.toFixed(2);
    }
    onCancel(): void {
        this.dialogRef.close(false);
    }
    onClose(): void {
        this.dialogRef.close();
    }
}