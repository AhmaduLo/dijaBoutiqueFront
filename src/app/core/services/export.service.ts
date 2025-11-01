import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Interfaces for export configuration
 */
export interface ExportColumn {
  header: string;
  field: string;
  format?: (value: any) => string;
}

export interface ExportOptions {
  filename: string;
  title: string;
  columns: ExportColumn[];
  data: any[];
  dateRange?: { dateDebut?: string; dateFin?: string };
  companyInfo?: {
    nom: string;
    proprietaire: string;
    telephone: string;
    adresse?: string;
  };
}

/**
 * Service pour exporter des données en Excel, CSV ou PDF
 */
@Injectable({
  providedIn: 'root'
})
export class ExportService {

  /**
   * Exporte les données au format Excel (.xlsx)
   */
  exportToExcel(options: ExportOptions): void {
    const { filename, title, columns, data, dateRange, companyInfo } = options;

    // Préparer les données pour Excel
    const excelData = this.prepareData(columns, data);

    let startRow = 1;
    const headerRows: any[][] = [];

    // Ajouter les informations de l'entreprise si disponibles
    if (companyInfo) {
      headerRows.push([companyInfo.nom]);
      headerRows.push([`Propriétaire: ${companyInfo.proprietaire}`]);
      headerRows.push([`Tél: ${companyInfo.telephone}`]);
      if (companyInfo.adresse) {
        headerRows.push([`Adresse: ${companyInfo.adresse}`]);
      }
      headerRows.push([]); // Ligne vide
    }

    // Ajouter le titre
    headerRows.push([title]);

    // Ajouter la date de génération
    const dateGeneration = new Date().toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    headerRows.push([`Généré le: ${dateGeneration}`]);

    // Ajouter la plage de dates si disponible
    if (dateRange?.dateDebut || dateRange?.dateFin) {
      const rangeText = this.getDateRangeText(dateRange);
      headerRows.push([rangeText]);
    }

    headerRows.push([]); // Ligne vide avant les données

    // Créer une nouvelle feuille de calcul avec l'en-tête
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(headerRows);

    // Ajouter les données
    XLSX.utils.sheet_add_json(ws, excelData, {
      origin: `A${headerRows.length + 1}`,
      skipHeader: false
    });

    // Appliquer le style (gras) à la première ligne de l'en-tête si c'est le nom de l'entreprise
    if (companyInfo) {
      if (!ws['!rows']) ws['!rows'] = [];
      ws['!rows'][0] = { hpt: 20 }; // Hauteur de la première ligne
    }

    // Créer un nouveau classeur
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Données');

    // Télécharger le fichier
    XLSX.writeFile(wb, `${filename}.xlsx`);
  }

  /**
   * Exporte les données au format CSV
   */
  exportToCSV(options: ExportOptions): void {
    const { filename, columns, data } = options;

    // Préparer les données
    const csvData = this.prepareData(columns, data);

    // Convertir en CSV
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(csvData);
    const csv = XLSX.utils.sheet_to_csv(ws);

    // Créer un blob et télécharger
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    this.downloadBlob(blob, `${filename}.csv`);
  }

  /**
   * Exporte les données au format PDF
   */
  exportToPDF(options: ExportOptions): void {
    const { filename, title, columns, data, dateRange, companyInfo } = options;

    // Créer un nouveau document PDF
    const doc = new jsPDF();

    let yPosition = 15;

    // En-tête avec informations de l'entreprise
    if (companyInfo) {
      // Nom de l'entreprise (grande et en gras)
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(companyInfo.nom, 14, yPosition);
      yPosition += 7;

      // Informations de contact (plus petit)
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Propriétaire: ${companyInfo.proprietaire}`, 14, yPosition);
      yPosition += 5;
      doc.text(`Tél: ${companyInfo.telephone}`, 14, yPosition);
      yPosition += 5;

      if (companyInfo.adresse) {
        doc.text(`Adresse: ${companyInfo.adresse}`, 14, yPosition);
        yPosition += 5;
      }

      // Ligne de séparation
      yPosition += 2;
      doc.setLineWidth(0.5);
      doc.line(14, yPosition, 196, yPosition);
      yPosition += 8;
    }

    // Titre du document
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, yPosition);
    yPosition += 7;

    // Date de génération
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const dateGeneration = new Date().toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Généré le: ${dateGeneration}`, 14, yPosition);
    yPosition += 5;

    // Plage de dates si disponible
    if (dateRange?.dateDebut || dateRange?.dateFin) {
      doc.setFont('helvetica', 'bold');
      doc.text(this.getDateRangeText(dateRange), 14, yPosition);
      yPosition += 7;
    } else {
      yPosition += 2;
    }

    // Préparer les données pour le tableau
    const headers = columns.map(col => col.header);
    const rows = data.map(item =>
      columns.map(col => {
        const value = this.getNestedValue(item, col.field);
        return col.format ? col.format(value) : value?.toString() || '';
      })
    );

    // Ajouter le tableau
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: yPosition,
      theme: 'striped',
      styles: {
        fontSize: 8,
        cellPadding: 3,
        lineColor: [200, 200, 200],
        lineWidth: 0.1
      },
      headStyles: {
        fillColor: [41, 128, 185], // Bleu professionnel
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center'
      },
      alternateRowStyles: { fillColor: [245, 248, 250] },
      margin: { left: 14, right: 14 }
    });

    // Pied de page
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Page ${i} sur ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    // Télécharger le PDF
    doc.save(`${filename}.pdf`);
  }

  /**
   * Prépare les données pour l'export
   */
  private prepareData(columns: ExportColumn[], data: any[]): any[] {
    return data.map(item => {
      const row: any = {};
      columns.forEach(col => {
        const value = this.getNestedValue(item, col.field);
        row[col.header] = col.format ? col.format(value) : value;
      });
      return row;
    });
  }

  /**
   * Récupère une valeur imbriquée dans un objet (ex: "user.name")
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }

  /**
   * Génère le texte de la plage de dates
   */
  private getDateRangeText(dateRange: { dateDebut?: string; dateFin?: string }): string {
    if (dateRange.dateDebut && dateRange.dateFin) {
      return `Période: ${this.formatDate(dateRange.dateDebut)} au ${this.formatDate(dateRange.dateFin)}`;
    } else if (dateRange.dateDebut) {
      return `À partir du: ${this.formatDate(dateRange.dateDebut)}`;
    } else if (dateRange.dateFin) {
      return `Jusqu'au: ${this.formatDate(dateRange.dateFin)}`;
    }
    return 'Toutes les dates';
  }

  /**
   * Formate une date au format français
   */
  private formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  /**
   * Télécharge un blob
   */
  private downloadBlob(blob: Blob, filename: string): void {
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
}
