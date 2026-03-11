import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
    providedIn: 'root'
})
export class SwalAlertService {

    constructor() { }

    showConfirmationDialog(title: string, label: string): Promise<any> {
        return Swal.fire({
            icon: 'question',
            title: `<b>${title}</b>`,
            text: label,
            showCancelButton: true,
            confirmButtonColor: "#57bd8d",
            cancelButtonColor: "#eb2f06",
            confirmButtonText: "Si",
            cancelButtonText: "Cancelar",
            allowEscapeKey: false,
            allowOutsideClick: false
        });
    }
    changeAlmacen(title: string, label: string): Promise<any> {
        return Swal.fire({
            icon: 'warning',
            title: `<b>${title}</b>`,
            text: label,
            showCancelButton: true,
            confirmButtonColor: "#57bd8d",
            cancelButtonColor: "#eb2f06",
            confirmButtonText: "Sí, cambiar almacén",
            cancelButtonText: "Cancelar",
            allowEscapeKey: false,
            allowOutsideClick: false
        });
    }
    confirmarSolicitud(title: string, productos: any[]): Promise<any> {
        let htmlContent = `<div class="text-start">`;
        htmlContent += `<p class="mb-3">¿Estás seguro de enviar la siguiente solicitud?</p>`;
        htmlContent += `<div class="border rounded p-3 bg-light">`;

        productos.forEach((producto, index) => {
            htmlContent += `
                <div class="d-flex justify-content-between ${index > 0 ? 'mt-2' : ''}">
                    <span class="fw-medium">${producto.nombre}</span>
                    <span>${producto.cantidad} ${producto.unidad_de_medida}</span>
                </div>
            `;
        });

        htmlContent += `</div></div>`;

        return Swal.fire({
            icon: 'question',
            title: `<b>${title}</b>`,
            html: htmlContent,
            showCancelButton: true,
            confirmButtonColor: "#57bd8d",
            cancelButtonColor: "#eb2f06",
            confirmButtonText: "Sí, enviar solicitud",
            cancelButtonText: "Cancelar",
            allowEscapeKey: false,
            allowOutsideClick: false,
            width: '600px'
        });
    }

    solicitudExitosa(title: string, message: string): Promise<any> {
        return Swal.fire({
            icon: 'success',
            title: `<b>${title}</b>`,
            text: message,
            confirmButtonColor: "#57bd8d",
            confirmButtonText: "Aceptar"
        });
    }

    solicitudError(title: string, message: string): Promise<any> {
        return Swal.fire({
            icon: 'error',
            title: `<b>${title}</b>`,
            text: message,
            confirmButtonColor: "#eb2f06",
            confirmButtonText: "Aceptar"
        });
    }
    confirmarEntrega(productos: any[], totalSolicitado: number, totalEntregar: number): Promise<any> {
        let htmlContent = `<div class="text-start">`;
        htmlContent += `<p class="mb-3">¿Estás seguro de confirmar la entrega con los siguientes detalles?</p>`;
        htmlContent += `<div class="border rounded p-3 bg-light">`;

        htmlContent += `
            <div class="d-flex justify-content-between mb-3 p-2 bg-white rounded">
                <strong>Total solicitado:</strong>
                <span class="fw-bold">${totalSolicitado} unidades</span>
            </div>
            <div class="d-flex justify-content-between mb-3 p-2 bg-white rounded">
                <strong>Total a entregar:</strong>
                <span class="fw-bold ${totalEntregar < totalSolicitado ? 'text-warning' : 'text-success'}">
                    ${totalEntregar} unidades
                </span>
            </div>
        `;

        htmlContent += `<h6 class="mb-2">Detalle de productos:</h6>`;

        productos.forEach((producto, index) => {
            const esParcial = producto.cantidad_entregar < producto.cantidad;
            htmlContent += `
                <div class="producto-item ${index > 0 ? 'mt-2' : ''} p-2 bg-white rounded">
                    <div class="d-flex justify-content-between">
                        <span class="fw-medium">${producto.nombre}</span>
                        <span class="${esParcial ? 'text-warning' : 'text-success'}">
                            ${producto.cantidad_entregar}/${producto.cantidad} ${producto.unidad_de_medida}
                        </span>
                    </div>
                    ${esParcial ? `
                        <div class="text-warning small mt-1">
                            <i class="fas fa-exclamation-triangle"></i> Entrega parcial
                        </div>
                    ` : ''}
                </div>
            `;
        });

        htmlContent += `</div></div>`;

        return Swal.fire({
            icon: 'question',
            title: `<b>Confirmar Entrega</b>`,
            html: htmlContent,
            showCancelButton: true,
            confirmButtonColor: "#57bd8d",
            cancelButtonColor: "#eb2f06",
            confirmButtonText: "Sí, confirmar entrega",
            cancelButtonText: "Cancelar",
            allowEscapeKey: false,
            allowOutsideClick: false,
            width: '650px'
        });
    }

    confirmarRechazo(): Promise<any> {
        return Swal.fire({
            icon: 'warning',
            title: `<b>Confirmar Rechazo</b>`,
            html: `
                <div class="text-start">
                    <p class="mb-3">¿Estás seguro de rechazar esta solicitud?</p>
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        <strong>Advertencia:</strong> Esta acción no se puede deshacer.
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonColor: "#eb2f06",
            cancelButtonColor: "#57bd8d",
            confirmButtonText: "Sí, rechazar solicitud",
            cancelButtonText: "Cancelar",
            allowEscapeKey: false,
            allowOutsideClick: false,
            width: '500px'
        });
    }

    confirmarEntregaParcial(): Promise<any> {
        return Swal.fire({
            icon: 'info',
            title: `<b>Entrega Parcial</b>`,
            html: `
                <div class="text-start">
                    <p class="mb-3">Se entregará una cantidad menor a la solicitada.</p>
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>
                        ¿Desea continuar con la entrega parcial?
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonColor: "#57bd8d",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Sí, continuar",
            cancelButtonText: "Revisar cantidades",
            allowEscapeKey: false,
            allowOutsideClick: false,
            width: '500px'
        });
    }

    
}
