import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { IngresoService } from 'src/app/services/ingreso.service';
import { HandleErrorMessage } from 'src/app/utils/handle.errors';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-completar-ingreso-modal',
    templateUrl: './completar-ingreso-modal.component.html',
    styleUrls: ['./completar-ingreso-modal.component.scss']
})
export class CompletarIngresoModalComponent {
    public confirmacion: boolean = false;
    public cargando: boolean = false;
    public ingreso: any;

    constructor(
        private toastr: ToastrService,
        private ingresoService: IngresoService,
        public dialogRef: MatDialogRef<CompletarIngresoModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.ingreso = data.ingreso;
    }

    get totalProductos(): number {
        return this.ingreso?.detalles?.length || 0;
    }

    get totalMonto(): number {
        return this.ingreso?.total || 0;
    }

    public completar(): void {
        if (!this.confirmacion) {
            this.toastr.warning('Debe confirmar la acción', 'Validación');
            return;
        }

        this.cargando = true;

        this.ingresoService.completarIngreso(this.ingreso.id).subscribe({
            next: (response) => {
                this.cargando = false;
                this.toastr.success('Ingreso completado correctamente', 'Éxito');
                this.dialogRef.close({ completado: true, ingreso: response });
            },
            error: (err) => {
                this.cargando = false;
                this.toastr.error(HandleErrorMessage(err), 'Error');
            }
        });
    }

    public cancelar(): void {
        this.dialogRef.close({ completado: false });
    }
  
}