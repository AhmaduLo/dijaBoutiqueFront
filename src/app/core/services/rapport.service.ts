import { Injectable } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { AchatService } from './achat.service';
import { VenteService } from './vente.service';
import { DepenseService } from './depense.service';
import {
  RapportPeriode,
  RapportMensuel,
  RapportAnnuel,
  RapportComplet,
  StatistiquesCategories,
  FiltreRapport
} from '../models/rapport.model';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Service de génération de rapports et bilans
 */
@Injectable({
  providedIn: 'root'
})
export class RapportService {
  constructor(
    private achatService: AchatService,
    private venteService: VenteService,
    private depenseService: DepenseService
  ) {}

  /**
   * Génère un rapport pour une période donnée
   */
  genererRapportPeriode(dateDebut: string, dateFin: string): Observable<RapportPeriode> {
    return forkJoin({
      achats: this.achatService.getStatistiques(dateDebut, dateFin),
      ventes: this.venteService.getStatistiques(dateDebut, dateFin),
      depenses: this.depenseService.getTotal(dateDebut, dateFin),
      statsDepenses: this.depenseService.getStatistiques(dateDebut, dateFin)
    }).pipe(
      map(data => {
        const totalAchats = data.achats.montantTotal || data.achats.totalAchats || 0;
        const chiffreAffaires = data.ventes.chiffreAffaires || 0;
        const totalDepenses = data.depenses || 0;
        const beneficeNet = chiffreAffaires - totalAchats - totalDepenses;

        const margeBrute = chiffreAffaires > 0
          ? ((chiffreAffaires - totalAchats) / chiffreAffaires) * 100
          : 0;

        const margeNette = chiffreAffaires > 0
          ? (beneficeNet / chiffreAffaires) * 100
          : 0;

        const nombreAchats = data.achats.nombreAchats || 0;
        const nombreVentes = data.ventes.nombreVentes || 0;
        const nombreDepenses = data.statsDepenses.nombreDepenses || 0;

        return {
          dateDebut,
          dateFin,
          totalAchats,
          chiffreAffaires,
          totalDepenses,
          beneficeNet,
          margeBrute,
          margeNette,
          nombreAchats,
          nombreVentes,
          nombreDepenses,
          moyenneAchatParTransaction: nombreAchats > 0 ? totalAchats / nombreAchats : 0,
          moyenneVenteParTransaction: nombreVentes > 0 ? chiffreAffaires / nombreVentes : 0,
          moyenneDepenseParTransaction: nombreDepenses > 0 ? totalDepenses / nombreDepenses : 0
        };
      })
    );
  }

  /**
   * Génère un rapport mensuel pour un mois et une année donnés
   */
  genererRapportMensuel(mois: number, annee: number): Observable<RapportMensuel> {
    const dateDebut = new Date(annee, mois - 1, 1).toISOString().split('T')[0];
    const dateFin = new Date(annee, mois, 0).toISOString().split('T')[0];

    return this.genererRapportPeriode(dateDebut, dateFin).pipe(
      map(rapport => ({
        mois: this.getNomMois(mois),
        annee,
        totalAchats: rapport.totalAchats,
        chiffreAffaires: rapport.chiffreAffaires,
        totalDepenses: rapport.totalDepenses,
        beneficeNet: rapport.beneficeNet,
        margeBrute: rapport.margeBrute
      }))
    );
  }

  /**
   * Génère un rapport annuel avec évolution mensuelle
   */
  genererRapportAnnuel(annee: number): Observable<RapportAnnuel> {
    const rapportsMensuels: Observable<RapportMensuel>[] = [];

    for (let mois = 1; mois <= 12; mois++) {
      rapportsMensuels.push(this.genererRapportMensuel(mois, annee));
    }

    return forkJoin(rapportsMensuels).pipe(
      map(moisParMois => {
        const totalAchats = moisParMois.reduce((sum, m) => sum + m.totalAchats, 0);
        const chiffreAffaires = moisParMois.reduce((sum, m) => sum + m.chiffreAffaires, 0);
        const totalDepenses = moisParMois.reduce((sum, m) => sum + m.totalDepenses, 0);
        const beneficeNet = chiffreAffaires - totalAchats - totalDepenses;
        const margeBrute = chiffreAffaires > 0
          ? ((chiffreAffaires - totalAchats) / chiffreAffaires) * 100
          : 0;

        // Trouve le meilleur et le pire mois
        const moisAvecBenefices = moisParMois.map(m => ({
          mois: m.mois,
          benefice: m.beneficeNet
        }));

        const meilleurMois = moisAvecBenefices.reduce((max, m) =>
          m.benefice > max.benefice ? m : max
        ).mois;

        const piresMois = moisAvecBenefices.reduce((min, m) =>
          m.benefice < min.benefice ? m : min
        ).mois;

        return {
          annee,
          moisParMois,
          totalAchats,
          chiffreAffaires,
          totalDepenses,
          beneficeNet,
          margeBrute,
          meilleurMois,
          piresMois
        };
      })
    );
  }

  /**
   * Génère un rapport complet avec toutes les statistiques
   */
  genererRapportComplet(filtre: FiltreRapport): Observable<RapportComplet> {
    let dateDebut: string;
    let dateFin: string;

    // Calcul des dates selon le type de rapport
    switch (filtre.type) {
      case 'mensuel':
        const mois = filtre.mois || new Date().getMonth() + 1;
        const annee = filtre.annee || new Date().getFullYear();
        dateDebut = new Date(annee, mois - 1, 1).toISOString().split('T')[0];
        dateFin = new Date(annee, mois, 0).toISOString().split('T')[0];
        break;

      case 'trimestriel':
        const today = new Date();
        const trimestre = Math.floor(today.getMonth() / 3);
        dateDebut = new Date(today.getFullYear(), trimestre * 3, 1).toISOString().split('T')[0];
        dateFin = new Date(today.getFullYear(), (trimestre + 1) * 3, 0).toISOString().split('T')[0];
        break;

      case 'annuel':
        const year = filtre.annee || new Date().getFullYear();
        dateDebut = new Date(year, 0, 1).toISOString().split('T')[0];
        dateFin = new Date(year, 11, 31).toISOString().split('T')[0];
        break;

      case 'personnalise':
        dateDebut = filtre.dateDebut || '';
        dateFin = filtre.dateFin || '';
        break;
    }

    return forkJoin({
      periode: this.genererRapportPeriode(dateDebut, dateFin),
      evolutionMensuelle: this.getEvolutionMensuelle(dateDebut, dateFin),
      statsDepenses: this.depenseService.getStatistiques(dateDebut, dateFin)
    }).pipe(
      map(data => {
        // Calcul des tendances
        const tendances = this.calculerTendances(data.evolutionMensuelle);

        // Transformation des dépenses par catégorie
        const depensesParCategorie: StatistiquesCategories[] = [];
        if (data.statsDepenses.repartitionParCategorie) {
          Object.entries(data.statsDepenses.repartitionParCategorie).forEach(([categorie, montant]) => {
            depensesParCategorie.push({
              categorie: this.depenseService.getCategorieLabel(categorie as any),
              montant: montant,
              pourcentage: data.periode.totalDepenses > 0
                ? (montant / data.periode.totalDepenses) * 100
                : 0
            });
          });
        }

        return {
          periode: data.periode,
          evolutionMensuelle: data.evolutionMensuelle,
          depensesParCategorie,
          tendances
        };
      })
    );
  }

  /**
   * Calcule l'évolution mensuelle sur une période
   */
  private getEvolutionMensuelle(dateDebut: string, dateFin: string): Observable<RapportMensuel[]> {
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    const rapports: Observable<RapportMensuel>[] = [];

    let current = new Date(debut.getFullYear(), debut.getMonth(), 1);

    while (current <= fin) {
      const mois = current.getMonth() + 1;
      const annee = current.getFullYear();
      rapports.push(this.genererRapportMensuel(mois, annee));
      current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    }

    return rapports.length > 0 ? forkJoin(rapports) : forkJoin([]);
  }

  /**
   * Calcule les tendances d'évolution
   */
  private calculerTendances(moisParMois: RapportMensuel[]): {
    evolutionCA: number;
    evolutionBenefice: number;
    evolutionDepenses: number;
  } {
    if (moisParMois.length < 2) {
      return { evolutionCA: 0, evolutionBenefice: 0, evolutionDepenses: 0 };
    }

    const premier = moisParMois[0];
    const dernier = moisParMois[moisParMois.length - 1];

    const evolutionCA = premier.chiffreAffaires > 0
      ? ((dernier.chiffreAffaires - premier.chiffreAffaires) / premier.chiffreAffaires) * 100
      : 0;

    const evolutionBenefice = premier.beneficeNet !== 0
      ? ((dernier.beneficeNet - premier.beneficeNet) / Math.abs(premier.beneficeNet)) * 100
      : 0;

    const evolutionDepenses = premier.totalDepenses > 0
      ? ((dernier.totalDepenses - premier.totalDepenses) / premier.totalDepenses) * 100
      : 0;

    return { evolutionCA, evolutionBenefice, evolutionDepenses };
  }

  /**
   * Retourne le nom du mois en français
   */
  private getNomMois(mois: number): string {
    const moisNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return moisNames[mois - 1];
  }

  /**
   * Exporte les données en format CSV
   */
  exporterCSV(rapport: RapportComplet, nomFichier: string): void {
    let csv = 'Type,Valeur\n';
    csv += `Période,${rapport.periode.dateDebut} - ${rapport.periode.dateFin}\n`;
    csv += `Chiffre d'Affaires,${rapport.periode.chiffreAffaires}\n`;
    csv += `Total Achats,${rapport.periode.totalAchats}\n`;
    csv += `Total Dépenses,${rapport.periode.totalDepenses}\n`;
    csv += `Bénéfice Net,${rapport.periode.beneficeNet}\n`;
    csv += `Marge Brute,${rapport.periode.margeBrute}%\n`;
    csv += `Marge Nette,${rapport.periode.margeNette}%\n\n`;

    csv += 'Évolution Mensuelle\n';
    csv += 'Mois,Achats,Ventes,Dépenses,Bénéfice,Marge Brute\n';
    rapport.evolutionMensuelle.forEach(m => {
      csv += `${m.mois} ${m.annee},${m.totalAchats},${m.chiffreAffaires},${m.totalDepenses},${m.beneficeNet},${m.margeBrute}%\n`;
    });

    csv += '\nDépenses par Catégorie\n';
    csv += 'Catégorie,Montant,Pourcentage\n';
    rapport.depensesParCategorie.forEach(d => {
      csv += `${d.categorie},${d.montant},${d.pourcentage}%\n`;
    });

    this.telechargerFichier(csv, nomFichier, 'text/csv');
  }

  /**
   * Exporte les données en format JSON
   */
  exporterJSON(rapport: RapportComplet, nomFichier: string): void {
    const json = JSON.stringify(rapport, null, 2);
    this.telechargerFichier(json, nomFichier, 'application/json');
  }

  /**
   * Exporte les données en format PDF
   */
  exporterPDF(rapport: RapportComplet, nomFichier: string): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // En-tête du document
    doc.setFontSize(20);
    doc.setTextColor(194, 24, 91); // Couleur rose de l'app
    doc.text('Rapport et Bilan', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 10;
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Période: ${rapport.periode.dateDebut} au ${rapport.periode.dateFin}`, pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 15;
    doc.setDrawColor(194, 24, 91);
    doc.setLineWidth(0.5);
    doc.line(20, yPosition, pageWidth - 20, yPosition);

    yPosition += 10;

    // Section Métriques Principales
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Métriques Principales', 20, yPosition);
    yPosition += 5;

    const metriques = [
      ['Chiffre d\'Affaires', `${rapport.periode.chiffreAffaires.toFixed(2)} FCFA`],
      ['Total Achats', `${rapport.periode.totalAchats.toFixed(2)} FCFA`],
      ['Total Dépenses', `${rapport.periode.totalDepenses.toFixed(2)} FCFA`],
      ['Bénéfice Net', `${rapport.periode.beneficeNet.toFixed(2)} FCFA`],
      ['Marge Brute', `${rapport.periode.margeBrute.toFixed(2)} %`],
      ['Marge Nette', `${rapport.periode.margeNette.toFixed(2)} %`]
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [['Métrique', 'Valeur']],
      body: metriques,
      theme: 'grid',
      headStyles: { fillColor: [194, 24, 91], textColor: 255 },
      margin: { left: 20, right: 20 }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // Section Statistiques des Transactions
    doc.setFontSize(14);
    doc.text('Statistiques des Transactions', 20, yPosition);
    yPosition += 5;

    const transactions = [
      ['Nombre d\'achats', rapport.periode.nombreAchats.toString()],
      ['Nombre de ventes', rapport.periode.nombreVentes.toString()],
      ['Nombre de dépenses', rapport.periode.nombreDepenses.toString()],
      ['Moyenne achat/transaction', `${rapport.periode.moyenneAchatParTransaction.toFixed(2)} FCFA`],
      ['Moyenne vente/transaction', `${rapport.periode.moyenneVenteParTransaction.toFixed(2)} FCFA`],
      ['Moyenne dépense/transaction', `${rapport.periode.moyenneDepenseParTransaction.toFixed(2)} FCFA`]
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [['Statistique', 'Valeur']],
      body: transactions,
      theme: 'grid',
      headStyles: { fillColor: [194, 24, 91], textColor: 255 },
      margin: { left: 20, right: 20 }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // Tendances (si disponibles)
    if (rapport.evolutionMensuelle.length > 1) {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.text('Tendances', 20, yPosition);
      yPosition += 5;

      const tendances = [
        ['Évolution du CA', `${rapport.tendances.evolutionCA >= 0 ? '+' : ''}${rapport.tendances.evolutionCA.toFixed(2)} %`],
        ['Évolution du bénéfice', `${rapport.tendances.evolutionBenefice >= 0 ? '+' : ''}${rapport.tendances.evolutionBenefice.toFixed(2)} %`],
        ['Évolution des dépenses', `${rapport.tendances.evolutionDepenses >= 0 ? '+' : ''}${rapport.tendances.evolutionDepenses.toFixed(2)} %`]
      ];

      autoTable(doc, {
        startY: yPosition,
        head: [['Tendance', 'Évolution']],
        body: tendances,
        theme: 'grid',
        headStyles: { fillColor: [194, 24, 91], textColor: 255 },
        margin: { left: 20, right: 20 }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }

    // Évolution Mensuelle
    if (rapport.evolutionMensuelle.length > 0) {
      if (yPosition > 200) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.text('Évolution Mensuelle', 20, yPosition);
      yPosition += 5;

      const evolutionData = rapport.evolutionMensuelle.map(m => [
        `${m.mois} ${m.annee}`,
        `${m.chiffreAffaires.toFixed(0)} FCFA`,
        `${m.totalAchats.toFixed(0)} FCFA`,
        `${m.totalDepenses.toFixed(0)} FCFA`,
        `${m.beneficeNet.toFixed(0)} FCFA`,
        `${m.margeBrute.toFixed(2)} %`
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Mois', 'CA', 'Achats', 'Dépenses', 'Bénéfice', 'Marge']],
        body: evolutionData,
        theme: 'striped',
        headStyles: { fillColor: [194, 24, 91], textColor: 255 },
        margin: { left: 20, right: 20 },
        styles: { fontSize: 8 }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }

    // Dépenses par Catégorie
    if (rapport.depensesParCategorie.length > 0) {
      if (yPosition > 200) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.text('Répartition des Dépenses par Catégorie', 20, yPosition);
      yPosition += 5;

      const categoriesData = rapport.depensesParCategorie.map(c => [
        c.categorie,
        `${c.montant.toFixed(2)} FCFA`,
        `${c.pourcentage.toFixed(2)} %`
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Catégorie', 'Montant', 'Pourcentage']],
        body: categoriesData,
        theme: 'grid',
        headStyles: { fillColor: [194, 24, 91], textColor: 255 },
        margin: { left: 20, right: 20 }
      });
    }

    // Pied de page
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} sur ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
      doc.text(
        `Généré le ${new Date().toLocaleDateString('fr-FR')}`,
        pageWidth - 20,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'right' }
      );
    }

    // Sauvegarde du PDF
    doc.save(nomFichier);
  }

  /**
   * Télécharge un fichier
   */
  private telechargerFichier(contenu: string, nomFichier: string, mimeType: string): void {
    const blob = new Blob([contenu], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nomFichier;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
