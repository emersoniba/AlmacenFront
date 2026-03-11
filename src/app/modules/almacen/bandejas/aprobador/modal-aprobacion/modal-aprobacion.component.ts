import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Aprobacion } from 'src/app/models/aprobacion.model';
import { AprobacionService } from 'src/app/services/aprobacion.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { A11yModule } from '@angular/cdk/a11y';


@Component({
  selector: 'app-modal-aprobacion',
  standalone: true,
  imports: [CommonModule, MatButtonModule, A11yModule],
  templateUrl: './modal-aprobacion.component.html',
  styleUrls: ['./modal-aprobacion.component.scss']
})
export class ModalAprobacionComponent implements OnInit, AfterViewInit {
  aprobacion: Aprobacion | null = null;
  loading = true;
  error = false;
  @ViewChild('closeButton') closeButton!: ElementRef;
  @ViewChild('primaryAction') primaryAction!: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<ModalAprobacionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private aprobacionService: AprobacionService,
    private toastr: ToastrService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cargarDatosAprobacion();
  }

  private cargarDatosAprobacion(): void {
    if (this.data.aprobacion.id) {
      if (this.data.aprobacion.productos && this.data.aprobacion.solicitante) {
        this.aprobacion = { ...this.data.aprobacion };
        this.loading = false;
        this.cdRef.detectChanges();
        return;
      }
      this.loading = true;
      this.aprobacionService.obtenerAprobacionPorId(this.data.aprobacion.id)
        .subscribe({
          next: (aprobacionCompleta) => {
            this.aprobacion = aprobacionCompleta;
            this.loading = false;
            this.cdRef.detectChanges();
          },
          error: (error) => {
            console.error('Error al cargar aprobación:', error);
            this.error = true;
            this.loading = false;
            this.cdRef.detectChanges();
          }
        });
    } else {
      this.aprobacion = { ...this.data.aprobacion };
      this.loading = false;
      this.cdRef.detectChanges();
    }
  }

  get totalProductos(): number {
    return this.aprobacion?.productos?.reduce((total, producto) => total + producto.cantidad, 0) || 0;
  }

  onAprobar(): void {
    if (!this.aprobacion?.id) return;

    const datosActualizados = {
      ...this.aprobacion,
      estado: 'aprobado' as const,
      fecha_aprobacion: new Date().toISOString(),
      aprobador: 'admin',
      comentarios: 'Solicitud aprobada'
    };

    this.loading = true;
    this.aprobacionService.actualizarAprobacion(this.aprobacion.id, datosActualizados)
      .subscribe({
        next: () => {
          this.toastr.success('Solicitud aprobada correctamente');
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error al aprobar:', error);
          this.toastr.error('Error al aprobar la solicitud');
          this.loading = false;
        }
      });
  }

  onRechazar(): void {
    if (!this.aprobacion?.id) return;

    const datosActualizados = {
      ...this.aprobacion,
      estado: 'rechazado' as const,
      fecha_aprobacion: new Date().toISOString(),
      aprobador: 'admin',
      comentarios: 'Solicitud rechazada'
    };

    this.loading = true;
    this.aprobacionService.actualizarAprobacion(this.aprobacion.id, datosActualizados)
      .subscribe({
        next: () => {
          this.toastr.success('Solicitud rechazada');
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error al rechazar:', error);
          this.toastr.error('Error al rechazar la solicitud');
          this.loading = false;
        }
      });
  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.aprobacion?.estado === 'pendiente' && this.primaryAction) {
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
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }
}