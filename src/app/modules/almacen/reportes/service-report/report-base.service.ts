import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

@Injectable({
  providedIn: 'root'
})
export class ReportBaseService {
  protected logoMopBase64: string | null = null;
  protected logoEscudoBase64: string | null = null;

  constructor() { }


  protected async cargarImagenes(): Promise<void> {
    try {
      this.logoMopBase64 = await this.convertImageToBase64('assets/images/report/escudo.png');
      this.logoEscudoBase64 = await this.convertImageToBase64('assets/images/report/mopsv.png');
    } catch (error) {
      console.error('Error al cargar imágenes:', error);
    }
  }

  protected agregarCabeceraCompleta(doc: jsPDF, titulo: string = 'INVENTARIO FÍSICO'): void {
    this.agregarLogosCabecera(doc);

    // Títulos
    doc.setFontSize(8);
    doc.setTextColor(40, 40, 40);
    doc.text('ESTADO PLURINACIONAL DE BOLIVIA', 105, 25, { align: 'center' });
    doc.setFontSize(6);
    doc.text('Ministerio de Obras Públicas, Servicios y Vivienda', 105, 28, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text(titulo, 105, 38, { align: 'center' });
    doc.setFontSize(10);
    doc.text('ALMACÉN MINISTERIO DE OBRAS PÚBLICAS, SERVICIOS Y VIVIENDA', 105, 43, { align: 'center' });

    // Línea separadora
    doc.setDrawColor(0, 0, 0);
    doc.line(10, 45, 200, 45);
  }

  protected agregarLogosCabecera(doc: jsPDF): void {
    try {
      if (this.logoMopBase64) {
        doc.addImage(this.logoMopBase64, 'PNG', 15, 10, 25, 22);
      } else {
        this.agregarPlaceholderLogo(doc, 15, 10, 'MOP');
      }

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

  protected agregarFirmasPiePagina(doc: jsPDF, pageNumber: number): void {
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const sectionWidth = pageWidth / 3;
    const startY = pageHeight - 60;
    const firmasY = startY + 30;
    const totalPages = (doc as any).internal.getNumberOfPages();
    

    const pieY = pageHeight - 10;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, 15, pieY);
    doc.text(`Página ${pageNumber} de ${totalPages}`, 105, pieY, { align: 'center' });
    doc.text('Sistema de Gestión de Almacén - MOP', 195, pieY, { align: 'right' });
  }

  protected agregarPlaceholderLogo(doc: jsPDF, x: number, y: number, texto: string): void {
    doc.setFontSize(6);
    doc.setTextColor(100, 100, 100);
    doc.rect(x, y, 25, 25);
    doc.text(texto, x + 12.5, y + 12.5, { align: 'center' });
  }

  protected async convertImageToBase64(imagePath: string): Promise<string | null> {
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

  protected agregarTexto(doc: jsPDF, texto: string, x: number, y: number): void {
    doc.setFontSize(9);
    doc.text(texto, x, y);
  }

  protected crearDocumento(): jsPDF {
    return new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter'
    });
  }

  protected agregarInformacionAlmacen(doc: jsPDF, almacen: string, subAlmacen: string, fecha: string): number {
    let yPosition = 55;

    // Información del almacén
    this.agregarTexto(doc, `Almacén: ${almacen}`, 15, yPosition);
    yPosition += 7;
    this.agregarTexto(doc, `Sub Almacén: ${subAlmacen}`, 15, yPosition);
    yPosition += 7;
    this.agregarTexto(doc, `Fecha del Reporte: ${fecha}`, 15, yPosition);
    yPosition += 10;

    return yPosition;
  }
  //hoja horizontal
  protected crearDocumentoHorizontal(): jsPDF {
    return new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'letter'
    });
  }

  // Cabecera para orientación horizontal
  protected agregarCabeceraCompletaHorizontal(doc: jsPDF, titulo: string = 'KARDEX FISICO VALORADO'): void {
    this.agregarLogosCabeceraHorizontal(doc);

    // Títulos - ajustados para orientación horizontal
    doc.setFontSize(8);
    doc.setTextColor(40, 40, 40);
    doc.text('ESTADO PLURINACIONAL DE BOLIVIA', 147.5, 20, { align: 'center' }); 
    doc.setFontSize(6);
    doc.text('Ministerio de Obras Públicas, Servicios y Vivienda', 147.5, 23, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text(titulo, 147.5, 33, { align: 'center' });
    doc.setFontSize(10);
    doc.text('ALMACÉN MINISTERIO DE OBRAS PÚBLICAS, SERVICIOS Y VIVIENDA', 147.5, 38, { align: 'center' });

    // Línea separadora - más larga para horizontal
    doc.setDrawColor(0, 0, 0);
    //doc.line(10, 40, 285, 40);
    doc.line(10, 40, 260, 40);
  }

  protected agregarLogosCabeceraHorizontal(doc: jsPDF): void {
    try {
      if (this.logoMopBase64) {
        doc.addImage(this.logoMopBase64, 'PNG', 15, 10, 25, 22);
      } else {
        this.agregarPlaceholderLogo(doc, 15, 10, 'MOP');
      }

      if (this.logoEscudoBase64) {
        doc.addImage(this.logoEscudoBase64, 'PNG', 235, 10, 35, 20); 
      } else {
        this.agregarPlaceholderLogo(doc, 235, 10, 'ESCUDO');
      }
    } catch (error) {
      console.error('Error al agregar logos:', error);
      this.agregarPlaceholderLogo(doc, 15, 10, 'MOP');
      this.agregarPlaceholderLogo(doc, 235, 10, 'ESCUDO');
    }
  }

  protected agregarFirmasPiePaginaHorizontal(doc: jsPDF, pageNumber: number): void {
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width; 
    const sectionWidth = pageWidth / 3;

    const startY = pageHeight - 40;
    const firmasY = startY + 20;
    const totalPages = (doc as any).internal.getNumberOfPages();


    const pieY = pageHeight - 10;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, 20, pieY);
    doc.text(`Página ${pageNumber} de ${totalPages}`, 147.5, pieY, { align: 'center' });
    doc.text('Sistema de Gestión de Almacén - MOP', 265, pieY, { align: 'right' });
  }

}