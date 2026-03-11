import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Aprobacion } from '../models/aprobacion.model';

@Injectable({
    providedIn: 'root'
})
export class PdfGeneratorService {

    private logoMopBase64: string | null = null;
    private logoEscudoBase64: string | null = null;

    constructor() { }

    async generarReporteEntrega(aprobacion: Aprobacion, productosConStock: any[]): Promise<void> {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'letter'
        }); 
        
        const fecha = new Date().toLocaleDateString('es-ES');

        try {
            await this.cargarImagenes();
        } catch (error) {
            console.warn('No se pudieron cargar las imágenes, continuando sin ellas...');
        }

        // Agregar cabecera a la primera página
        this.agregarCabeceraCompleta(doc);

        // Información de la solicitud
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);

        let yPosition = 55;

        // Información 
        this.agregarTexto(doc, `ID Solicitud: ${aprobacion.solicitud_id}`, 15, yPosition);
        yPosition += 7;
        this.agregarTexto(doc, `Fecha Aprobación: ${new Date(aprobacion.fecha_aprobacion).toLocaleDateString('es-ES')}`, 15, yPosition);
        yPosition += 7;
        this.agregarTexto(doc, `Aprobador: ${aprobacion.aprobador || 'N/A'}`, 15, yPosition);
        yPosition += 7;
        this.agregarTexto(doc, `Estado: ${aprobacion.estado}`, 15, yPosition);
        yPosition += 7;
        this.agregarTexto(doc, `Solicitante: ${aprobacion.solicitante.usuario} (${aprobacion.solicitante.cargo})`, 15, yPosition);
        yPosition += 7;
        this.agregarTexto(doc, `Almacén: ${aprobacion.almacen.nombre}`, 15, yPosition);
        yPosition += 10;

        // Objetivo
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        const objetivoLines = doc.splitTextToSize(`Detalle: ${aprobacion.objetivo}`, 180);
        doc.text(objetivoLines, 15, yPosition);
        yPosition += objetivoLines.length * 5 + 10;

        // Tabla de productos
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text('PRODUCTOS ENTREGADOS', 15, yPosition);
        yPosition += 8;

        const tableData = this.prepararDatosConNumeracionYTotal(productosConStock);

        autoTable(doc, {
            startY: yPosition,
            head: [['N°', 'Artículo', 'Unidad', 'Entregado']],
            body: tableData,
            theme: 'grid',
            headStyles: {
               fillColor:[95,95,95],
                textColor: 255,
                fontStyle: 'bold',
                fontSize: 9
            },
            bodyStyles: {
                fontSize: 8
            },
            styles: {
                fontSize: 8,
                cellPadding: 2,
                lineColor: [0, 0, 0],
                lineWidth: 0.1
            },
            columnStyles: {
                0: { cellWidth: 10, halign: 'center' },
                1: { cellWidth: 75 },
                2: { cellWidth: 20, halign: 'center' },
                3: { cellWidth: 20, halign: 'center' }
            },
            margin: { top: 55, bottom: 60 },
            didDrawPage: (data) => {
                this.agregarCabeceraCompleta(doc);
                // Número de página
                doc.setFontSize(8);
                doc.setTextColor(100, 100, 100);
                doc.text(`Página ${data.pageNumber}`, 195, 15, { align: 'right' });

                this.agregarFirmasPiePagina(doc, data.pageNumber);
            }
        });

        doc.save(`entrega_${aprobacion.solicitud_id}_${fecha.replace(/\//g, '-')}.pdf`);
    }

    private async cargarImagenes(): Promise<void> {
        try {
            // Logo MOP (izquierda)
            this.logoMopBase64 = await this.convertImageToBase64('assets/images/report/escudo.png');
            
            // Logo ESCUDO (derecha)
            this.logoEscudoBase64 = await this.convertImageToBase64('assets/images/report/mopsv.png');
        } catch (error) {
            console.error('Error al cargar imágenes:', error);
        }
    }

    private agregarCabeceraCompleta(doc: jsPDF): void {
        this.agregarLogosCabecera(doc);

        // Títulos
        doc.setFontSize(8);
        doc.setTextColor(40, 40, 40);
        doc.text('ESTADO PLURINACIONAL DE BOLIVIA', 105, 25, { align: 'center' });
        doc.setFontSize(6);
        doc.text('Ministerio de Obras Públicas, Servicios y Vivienda', 105, 28, { align: 'center' });

        doc.setFontSize(12);
        doc.setTextColor(40, 40, 40);
        doc.text('DOCUMENTO DE SALIDA', 105, 38, { align: 'center' });
        doc.setFontSize(10);
        doc.text('ALMACÉN MINISTERIO DE OBRAS PÚBLICAS, SERVICIOS Y VIVIENDA', 105, 43, { align: 'center' });

        // Línea separadora
        doc.setDrawColor(0, 0, 0);
        doc.line(10, 45, 200, 45);
    }

    private agregarLogosCabecera(doc: jsPDF): void {
        try {
            // Logo MOP (izquierda) - ya está en base64
            if (this.logoMopBase64) {
                doc.addImage(this.logoMopBase64, 'PNG', 15, 10, 25, 22);
            } else {
                this.agregarPlaceholderLogo(doc, 15, 10, 'MOP');
            }

            // Logo ESCUDO (derecha) - ya está en base64
            if (this.logoEscudoBase64) {
                doc.addImage(this.logoEscudoBase64, 'PNG', 160, 10, 35, 20);
            } else {
                this.agregarPlaceholderLogo(doc, 170, 10, 'ESCUDO');
            }

        } catch (error) {
            console.error('Error al agregar logos:', error);
            this.agregarPlaceholderLogo(doc, 15, 10, 'MOP');
            this.agregarPlaceholderLogo(doc, 170, 10, 'ESCUDO');
        }
    }

    private agregarFirmasPiePagina(doc: jsPDF, pageNumber: number): void {
        const pageHeight = doc.internal.pageSize.height;
        const pageWidth = doc.internal.pageSize.width;
        const sectionWidth = pageWidth / 3;

        const startY = pageHeight - 60;
        const firmasY = startY + 30;

        const totalPages = (doc as any).internal.getNumberOfPages();
        if (pageNumber === totalPages) {
            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);
            doc.line(15, firmasY, 60, firmasY);
            doc.text('ENTREGADO POR:', 15, firmasY + 8);

            doc.line(sectionWidth + 15, firmasY, sectionWidth + 60, firmasY);
            doc.text('RECIBIDO POR:', sectionWidth + 15, firmasY + 8);

            doc.line((sectionWidth * 2) + 15, firmasY, (sectionWidth * 2) + 60, firmasY);
            doc.text('APROBADO POR:', (sectionWidth * 2) + 15, firmasY + 8);
        }

        const pieY = pageHeight - 10;
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, 15, pieY);
        doc.text(`Página ${pageNumber} de ${totalPages}`, 105, pieY, { align: 'center' });
        doc.text('Sistema de Gestión de Almacén - MOP', 195, pieY, { align: 'right' });
    }

    private prepararDatosConNumeracionYTotal(productosConStock: any[]): any[] {
        const datosProductos = productosConStock.map((producto, index) => [
            (index + 1).toString(),
            producto.nombre,
            producto.unidad_de_medida,
            producto.cantidad_entregar.toString(),
        ]);

        const totalEntregado = productosConStock.reduce((sum, p) => sum + p.cantidad_entregar, 0);

        const filaTotal = [
            '',
            'TOTAL GENERAL',
            '',
            totalEntregado.toString(),
        ];

        return [...datosProductos, filaTotal];
    }

    private agregarPlaceholderLogo(doc: jsPDF, x: number, y: number, texto: string): void {
        doc.setFontSize(6);
        doc.setTextColor(100, 100, 100);
        doc.rect(x, y, 25, 25);
        doc.text(texto, x + 12.5, y + 12.5, { align: 'center' });
    }

    private async convertImageToBase64(imagePath: string): Promise<string | null> {
        try {
            const response = await fetch(imagePath);
            const blob = await response.blob();
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error(`Error convirtiendo imagen ${imagePath} a base64:`, error);
            return null;
        }
    }

    private agregarTexto(doc: jsPDF, texto: string, x: number, y: number): void {
        doc.setFontSize(9);
        doc.text(texto, x, y);
    }
}