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
    email?: string;
    ville?: string;
    codePostal?: string;
    nineaSiret?: string;
  };
}

export interface RapportExportOptions extends ExportOptions {
  summaryData?: {
    chiffreAffaires: number;
    totalAchats: number;
    totalDepenses: number;
    beneficeNet: number;
    margeBrute: number;
    margeNette: number;
  };
  evolutionData?: Array<{
    mois: string;
    annee: number;
    chiffreAffaires: number;
    totalAchats: number;
    totalDepenses: number;
    beneficeNet: number;
    margeBrute: number;
  }>;
  devise?: string;
}

export interface FactureOptions {
  numeroFacture: string;
  dateFacture: string;
  entreprise: {
    nom: string;
    adresse?: string;
    ville?: string;
    codePostal?: string;
    telephone: string;
    email?: string;
    nineaSiret?: string;
  };
  client: {
    nom: string;
    entreprise?: string;
    adresse?: string;
    telephone?: string;
    email?: string;
  };
  produits: Array<{
    designation: string;
    quantite: number;
    prixUnitaire: number;
    total: number;
  }>;
  totalGeneral: number;
  devise: string;
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
      if (companyInfo.nineaSiret) {
        headerRows.push([`NINEA/SIRET: ${companyInfo.nineaSiret}`]);
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

    // En-tête avec informations de l'entreprise (style moderne avec fond vert)
    if (companyInfo) {
      // Fond vert foncé professionnel pour l'en-tête (même couleur que les factures: #344934)
      doc.setFillColor(52, 73, 52);
      doc.rect(0, 0, 210, 52, 'F');

      // Forme diagonale blanche en bas à droite (effet moderne)
      doc.setFillColor(255, 255, 255);
      // Points du triangle: (x1,y1), (x2,y2), (x3,y3)
      const trianglePoints = [
        { x: 160, y: 52 },  // Point bas gauche
        { x: 210, y: 32 },  // Point haut droit
        { x: 210, y: 52 }   // Point bas droit
      ];
      doc.triangle(trianglePoints[0].x, trianglePoints[0].y,
        trianglePoints[1].x, trianglePoints[1].y,
        trianglePoints[2].x, trianglePoints[2].y, 'F');

      // Logo "HeasyStock" en haut à gauche (couleur dorée/jaune clair)
      doc.setTextColor(255, 215, 0); // Doré (gold) en RGB - très visible sur fond vert
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('HeasyStock', 14, 15);

      // Nom de l'entreprise (blanc, grand et gras) - Centre gauche
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text(companyInfo.nom.toUpperCase(), 14, 34);

      // Informations de contact (blanc, plus petites, alignées à droite)
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      const pageWidth = doc.internal.pageSize.getWidth();

      let contactYPos = 12;

      // Adresse si disponible
      if (companyInfo.adresse) {
        doc.text(`Adresse : ${companyInfo.adresse}`, pageWidth - 14, contactYPos, { align: 'right' });
        contactYPos += 4.5;
      }

      // Numéro de téléphone
      doc.text(`Numero de telephone : ${companyInfo.telephone}`, pageWidth - 14, contactYPos, { align: 'right' });
      contactYPos += 4.5;

      // Email si disponible
      if (companyInfo.email) {
        doc.text(`Email : ${companyInfo.email}`, pageWidth - 14, contactYPos, { align: 'right' });
        contactYPos += 4.5;
      }

      // NINEA/SIRET si disponible
      if (companyInfo.nineaSiret) {
        doc.text(`NINEA/SIRET : ${companyInfo.nineaSiret}`, pageWidth - 14, contactYPos, { align: 'right' });
        contactYPos += 4.5;
      }

      // Propriétaire si disponible
      if (companyInfo.proprietaire) {
        doc.text(`Proprietaire : ${companyInfo.proprietaire}`, pageWidth - 14, contactYPos, { align: 'right' });
      }

      // Réinitialiser la couleur du texte pour le reste du document
      doc.setTextColor(0, 0, 0);
      yPosition = 62;
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
   * Formate un nombre au format français avec espaces comme séparateurs de milliers
   * Compatible avec jsPDF (évite les problèmes d'encodage avec toLocaleString)
   */
  private formatNumberFR(num: number): string {
    // Convertir en string avec 2 décimales
    const fixedNum = num.toFixed(2);
    const [integerPart, decimalPart] = fixedNum.split('.');

    // Ajouter des espaces tous les 3 chiffres depuis la droite
    const withSpaces = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

    // Retourner avec la partie décimale
    return `${withSpaces},${decimalPart}`;
  }

  /**
   * Génère une facture professionnelle au format spécifique
   */
  genererFactureProfessionnelle(options: FactureOptions): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // ========== EN-TÊTE VERT ==========
    // Fond vert pour l'en-tête (couleur verte foncée professionnelle)
    doc.setFillColor(52, 73, 52); // Vert foncé
    doc.rect(0, 0, pageWidth, 35, 'F');

    // Texte "FACTURE N°" en blanc, centré
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURE N°', pageWidth / 2, 15, { align: 'center' });

    // Numéro de facture
    doc.setFontSize(16);
    doc.text(options.numeroFacture, pageWidth / 2, 25, { align: 'center' });

    // ========== INFORMATIONS ENTREPRISE ET CLIENT ==========
    doc.setTextColor(0, 0, 0);
    let yPos = 45;

    // Colonne gauche - Informations de l'entreprise
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text("Nom de l'entreprise", 14, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(options.entreprise.nom, 14, yPos + 5);

    if (options.entreprise.adresse) {
      yPos += 12;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text("Adresse", 14, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(options.entreprise.adresse, 14, yPos + 5);
    }

    const villeCP = [options.entreprise.ville, options.entreprise.codePostal].filter(Boolean).join(' ');
    if (villeCP) {
      yPos += 12;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text("Ville et Code Postal", 14, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(villeCP, 14, yPos + 5);
    }

    yPos += 12;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text("Numéro de téléphone", 14, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(options.entreprise.telephone, 14, yPos + 5);

    if (options.entreprise.email) {
      yPos += 12;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text("Email", 14, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(options.entreprise.email, 14, yPos + 5);
    }

    if (options.entreprise.nineaSiret) {
      yPos += 12;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text("NINEA/SIRET", 14, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(options.entreprise.nineaSiret, 14, yPos + 5);
    }

    // Colonne droite - Informations du client
    yPos = 50;
    const colDroite = pageWidth / 2 + 10;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text("Nom du client", colDroite, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(options.client.nom, colDroite, yPos + 5);

    if (options.client.adresse) {
      yPos += 12;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text("Adresse", colDroite, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(options.client.adresse, colDroite, yPos + 5);
    }

    if (options.client.telephone) {
      yPos += 12;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text("Numéro de téléphone", colDroite, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(options.client.telephone, colDroite, yPos + 5);
    }

    if (options.client.email) {
      yPos += 12;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text("Email", colDroite, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(options.client.email, colDroite, yPos + 5);
    }

    // ========== DATE ET HEURE DE FACTURE ==========
    // Calculer la position dynamique (minimum 110, ajusté selon le contenu)
    yPos = Math.max(110, yPos + 25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);

    // Formater la date et l'heure
    const dateFacture = new Date(options.dateFacture);
    const dateFormatee = dateFacture.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const heureFormatee = dateFacture.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    doc.text(`Date de facture: ${dateFormatee} à ${heureFormatee}`, 14, yPos);

    // ========== TABLEAU DES PRODUITS ==========
    yPos += 10;

    const tableData = options.produits.map(p => [
      p.designation,
      p.quantite.toString(),
      `${this.formatNumberFR(p.prixUnitaire)} ${options.devise}`,
      `${this.formatNumberFR(p.total)} ${options.devise}`
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Désignation', 'Quantité', 'Prix Unitaire', 'Total']],
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 4
      },
      headStyles: {
        fillColor: [52, 73, 52], // Vert foncé
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { halign: 'center', cellWidth: 30 },
        2: { halign: 'right', cellWidth: 40 },
        3: { halign: 'right', cellWidth: 40 }
      },
      margin: { left: 14, right: 14 }
    });

    // ========== TOTAL GÉNÉRAL ==========
    const finalY = (doc as any).lastAutoTable.finalY + 10;

    // Encadré pour le total
    doc.setFillColor(240, 240, 240);
    doc.rect(pageWidth - 70, finalY, 56, 12, 'F');
    doc.setDrawColor(0);
    doc.rect(pageWidth - 70, finalY, 56, 12, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('TOTAL:', pageWidth - 65, finalY + 8);
    doc.text(
      `${this.formatNumberFR(options.totalGeneral)} ${options.devise}`,
      pageWidth - 16,
      finalY + 8,
      { align: 'right' }
    );

    // ========== PIED DE PAGE ==========
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Page ${i} sur ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    // Télécharger le PDF
    doc.save(`facture_${options.numeroFacture}.pdf`);
  }

  /**
   * Génère un rapport financier amélioré avec résumé exécutif et visuels
   */
  genererRapportAmeliore(options: RapportExportOptions): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 15;

    // ========== EN-TÊTE AVEC INFORMATIONS DE L'ENTREPRISE ==========
    if (options.companyInfo) {
      // Fond bleu-gris foncé pour l'en-tête
      doc.setFillColor(74, 95, 109);
      doc.rect(0, 0, pageWidth, 52, 'F');

      // Forme diagonale blanche en bas à droite
      doc.setFillColor(255, 255, 255);
      doc.triangle(160, 52, 210, 32, 210, 52, 'F');

      // Nom de l'entreprise
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text(options.companyInfo.nom, 14, 20);

      // Informations de contact
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      let contactYPos = 18;

      doc.text(`Numero : ${options.companyInfo.telephone}`, pageWidth - 14, contactYPos, { align: 'right' });
      contactYPos += 4.5;

      if (options.companyInfo.adresse) {
        doc.text(`Adresse : ${options.companyInfo.adresse}`, pageWidth - 14, contactYPos, { align: 'right' });
        contactYPos += 4.5;
      }

      if (options.companyInfo.nineaSiret) {
        doc.text(`NINEA/SIRET : ${options.companyInfo.nineaSiret}`, pageWidth - 14, contactYPos, { align: 'right' });
        contactYPos += 4.5;
      }

      if (options.companyInfo.proprietaire) {
        doc.text(`Proprietaire : ${options.companyInfo.proprietaire}`, pageWidth - 14, contactYPos, { align: 'right' });
      }

      doc.setTextColor(0, 0, 0);
      yPosition = 62;
    }

    // ========== TITRE ET PÉRIODE ==========
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175);
    doc.text(options.title, 14, yPosition);
    yPosition += 8;

    // Date de génération et période
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    const dateGeneration = new Date().toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Genere le: ${dateGeneration}`, 14, yPosition);
    yPosition += 4;

    if (options.dateRange?.dateDebut && options.dateRange?.dateFin) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(`Periode: ${options.dateRange.dateDebut} au ${options.dateRange.dateFin}`, 14, yPosition);
      yPosition += 10;
    }

    // ========== RÉSUMÉ EXÉCUTIF ==========
    if (options.summaryData) {
      doc.setFillColor(240, 249, 255);
      doc.rect(14, yPosition, pageWidth - 28, 50, 'F');
      doc.setDrawColor(59, 130, 246);
      doc.setLineWidth(0.5);
      doc.rect(14, yPosition, pageWidth - 28, 50, 'S');

      yPosition += 8;

      // Titre de la section
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 64, 175);
      doc.text('RESUME EXECUTIF', 20, yPosition);
      yPosition += 8;

      // Indicateurs clés en 2 colonnes
      const colonne1X = 20;
      const colonne2X = pageWidth / 2 + 5;
      const devise = options.devise || 'CFA';

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');

      // Colonne 1
      doc.setTextColor(100, 100, 100);
      doc.text('Chiffre d\'Affaires:', colonne1X, yPosition);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(16, 185, 129);
      doc.text(`${this.formatNumberFR(options.summaryData.chiffreAffaires)} ${devise}`, colonne1X, yPosition + 5);

      yPosition += 12;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text('Total Achats:', colonne1X, yPosition);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(239, 68, 68);
      doc.text(`${this.formatNumberFR(options.summaryData.totalAchats)} ${devise}`, colonne1X, yPosition + 5);

      yPosition += 12;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text('Total Depenses:', colonne1X, yPosition);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(249, 115, 22);
      doc.text(`${this.formatNumberFR(options.summaryData.totalDepenses)} ${devise}`, colonne1X, yPosition + 5);

      // Colonne 2
      yPosition -= 24; // Revenir en haut pour la colonne 2

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text('Benefice Net:', colonne2X, yPosition);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(options.summaryData.beneficeNet >= 0 ? 16 : 220, options.summaryData.beneficeNet >= 0 ? 185 : 38, options.summaryData.beneficeNet >= 0 ? 129 : 38);
      doc.text(`${this.formatNumberFR(options.summaryData.beneficeNet)} ${devise}`, colonne2X, yPosition + 5);

      yPosition += 12;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text('Marge Brute:', colonne2X, yPosition);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(options.summaryData.margeBrute >= 0 ? 16 : 220, options.summaryData.margeBrute >= 0 ? 185 : 38, options.summaryData.margeBrute >= 0 ? 129 : 38);
      doc.text(`${options.summaryData.margeBrute.toFixed(2)}%`, colonne2X, yPosition + 5);

      yPosition += 12;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text('Marge Nette:', colonne2X, yPosition);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(options.summaryData.margeNette >= 0 ? 16 : 220, options.summaryData.margeNette >= 0 ? 185 : 38, options.summaryData.margeNette >= 0 ? 129 : 38);
      doc.text(`${options.summaryData.margeNette.toFixed(2)}%`, colonne2X, yPosition + 5);

      yPosition += 15;
    }

    // ========== TABLEAU D'ÉVOLUTION MENSUELLE ==========
    if (options.evolutionData && options.evolutionData.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 64, 175);
      doc.text('EVOLUTION MENSUELLE', 14, yPosition);
      yPosition += 5;

      const devise = options.devise || 'CFA';
      const headers = ['Mois', `CA (${devise})`, `Achats (${devise})`, `Depenses (${devise})`, `Benefice (${devise})`, 'Marge (%)'];
      const rows = options.evolutionData.map(item => [
        `${item.mois} ${item.annee}`,
        this.formatNumberFR(item.chiffreAffaires),
        this.formatNumberFR(item.totalAchats),
        this.formatNumberFR(item.totalDepenses),
        this.formatNumberFR(item.beneficeNet),
        item.margeBrute.toFixed(2)
      ]);

      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: yPosition,
        theme: 'grid',
        styles: {
          fontSize: 7,
          cellPadding: 2,
          lineColor: [200, 200, 200],
          lineWidth: 0.1
        },
        headStyles: {
          fillColor: [30, 64, 175],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 8
        },
        columnStyles: {
          0: { halign: 'left', fontStyle: 'bold', textColor: [30, 64, 175] },
          1: { halign: 'right' },
          2: { halign: 'right' },
          3: { halign: 'right' },
          4: { halign: 'right', fontStyle: 'bold' },
          5: { halign: 'right', fontStyle: 'bold' }
        },
        didParseCell: (data: any) => {
          // Colorer les bénéfices et marges selon leur signe
          if (data.section === 'body' && (data.column.index === 4 || data.column.index === 5)) {
            const value = parseFloat(data.cell.raw.toString().replace(/\s/g, '').replace(',', '.'));
            if (value < 0) {
              data.cell.styles.textColor = [220, 38, 38]; // Rouge
            } else {
              data.cell.styles.textColor = [16, 163, 74]; // Vert
            }
          }
        },
        margin: { left: 14, right: 14 }
      });
    }

    // ========== PIED DE PAGE AMÉLIORÉ ==========
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      // Ligne de séparation
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);

      // Date et heure de génération
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(128, 128, 128);
      doc.text(`Genere le: ${dateGeneration}`, 14, pageHeight - 10);

      // Numéro de page
      doc.text(`Page ${i} sur ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

      // Nom du rapport
      doc.text(options.filename, pageWidth - 14, pageHeight - 10, { align: 'right' });
    }

    // Télécharger le PDF
    doc.save(`${options.filename}.pdf`);
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
