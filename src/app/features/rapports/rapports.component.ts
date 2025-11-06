import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RapportService } from '../../core/services/rapport.service';
import { NotificationService } from '../../core/services/notification.service';
import { RapportComplet, TypeRapport, FiltreRapport } from '../../core/models/rapport.model';
import { MetricCardComponent } from '../../shared/components/metric-card/metric-card.component';
import { CurrencyService } from '../../core/services/currency.service';
import { Currency } from '../../core/models/currency.model';
import { ExportService } from '../../core/services/export.service';
import { AuthService } from '../../core/services/auth.service';
import { TenantService } from '../../core/services/tenant.service';
import { User } from '../../core/models/auth.model';
import { Tenant } from '../../core/models/tenant.model';

/**
 * Composant de génération et visualisation de rapports
 */
@Component({
  selector: 'app-rapports',
  standalone: true,
  imports: [CommonModule, FormsModule, MetricCardComponent],
  template: `
    <div class="rapports">
      <div class="page-header">
        <div>
          <h1>Rapports et Bilans</h1>
          <p class="subtitle">Analyse détaillée de votre activité</p>
        </div>
        <div class="actions">
          <button class="btn btn-success" (click)="exporterExcel()" [disabled]="!rapportGenere || isLoading">
            📊 Exporter Excel
          </button>
          <button class="btn btn-primary" (click)="exporterPDF()" [disabled]="!rapportGenere || isLoading">
            📑 Exporter PDF
          </button>
        </div>
      </div>

      <!-- Filtres -->
      <div class="card filters-card">
        <h2>Paramètres du rapport</h2>
        <div class="filters">
          <div class="filter-group">
            <label>Type de rapport</label>
            <select [(ngModel)]="typeRapport" (change)="onTypeRapportChange()">
              <option value="mensuel">Rapport Mensuel</option>
              <option value="trimestriel">Rapport Trimestriel</option>
              <option value="annuel">Rapport Annuel</option>
              <option value="personnalise">Période Personnalisée</option>
            </select>
          </div>

          <div class="filter-group" *ngIf="typeRapport === 'mensuel'">
            <label>Mois</label>
            <select [(ngModel)]="moisSelectionne">
              <option *ngFor="let mois of moisDisponibles; let i = index" [value]="i + 1">
                {{ mois }}
              </option>
            </select>
          </div>

          <div class="filter-group" *ngIf="typeRapport === 'mensuel' || typeRapport === 'annuel'">
            <label>Année</label>
            <select [(ngModel)]="anneeSelectionnee">
              <option *ngFor="let annee of anneesDisponibles" [value]="annee">
                {{ annee }}
              </option>
            </select>
          </div>

          <div class="filter-group" *ngIf="typeRapport === 'personnalise'">
            <label>Date de début</label>
            <input type="date" [(ngModel)]="dateDebut" />
          </div>

          <div class="filter-group" *ngIf="typeRapport === 'personnalise'">
            <label>Date de fin</label>
            <input type="date" [(ngModel)]="dateFin" />
          </div>

          <button class="btn btn-primary" (click)="genererRapport()" [disabled]="isLoading">
            {{ isLoading ? 'Génération en cours...' : '🔍 Générer le rapport' }}
          </button>
        </div>
      </div>

      <!-- Chargement -->
      <div class="loading" *ngIf="isLoading">
        <div class="spinner"></div>
        <p>Génération du rapport en cours...</p>
      </div>

      <!-- Rapport généré -->
      <div *ngIf="rapportGenere && !isLoading">
        <!-- Métriques principales -->
        <div class="metrics-grid">
          <app-metric-card
            [title]="'Chiffre d\\'Affaires (' + (defaultCurrency?.symbole || 'CFA') + ')'"
            [value]="rapport!.periode.chiffreAffaires"
            icon="💰"
            color="green"
            [subtitle]="getPeriodeLabel()"
          ></app-metric-card>

          <app-metric-card
            [title]="'Total Achats (' + (defaultCurrency?.symbole || 'CFA') + ')'"
            [value]="rapport!.periode.totalAchats"
            icon="🛒"
            color="pink"
            [subtitle]="getPeriodeLabel()"
          ></app-metric-card>

          <app-metric-card
            [title]="'Total Dépenses (' + (defaultCurrency?.symbole || 'CFA') + ')'"
            [value]="rapport!.periode.totalDepenses"
            icon="💳"
            color="orange"
            [subtitle]="getPeriodeLabel()"
          ></app-metric-card>

          <app-metric-card
            [title]="'Bénéfice Net (' + (defaultCurrency?.symbole || 'CFA') + ')'"
            [value]="rapport!.periode.beneficeNet"
            icon="📊"
            [color]="rapport!.periode.beneficeNet >= 0 ? 'purple' : 'orange'"
            [subtitle]="'Ventes - Achats - Dépenses'"
          ></app-metric-card>
        </div>

        <!-- Résumé détaillé -->
        <div class="card">
          <h2>Résumé de la période</h2>
          <div class="summary-grid">
            <div class="summary-item">
              <span class="label">Période analysée</span>
              <span class="value">{{ rapport!.periode.dateDebut }} au {{ rapport!.periode.dateFin }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Marge brute</span>
              <span class="value" [class.positive]="rapport!.periode.margeBrute >= 0" [class.negative]="rapport!.periode.margeBrute < 0">
                {{ rapport!.periode.margeBrute >= 0 ? '+' : '' }}{{ rapport!.periode.margeBrute.toFixed(2) }}%
              </span>
            </div>
            <div class="summary-item">
              <span class="label">Marge nette</span>
              <span class="value" [class.positive]="rapport!.periode.margeNette >= 0" [class.negative]="rapport!.periode.margeNette < 0">
                {{ rapport!.periode.margeNette >= 0 ? '+' : '' }}{{ rapport!.periode.margeNette.toFixed(2) }}%
              </span>
            </div>
            <div class="summary-item">
              <span class="label">Nombre d'achats</span>
              <span class="value">{{ rapport!.periode.nombreAchats }} transaction(s)</span>
            </div>
            <div class="summary-item">
              <span class="label">Nombre de ventes</span>
              <span class="value">{{ rapport!.periode.nombreVentes }} transaction(s)</span>
            </div>
            <div class="summary-item">
              <span class="label">Nombre de dépenses</span>
              <span class="value">{{ rapport!.periode.nombreDepenses }} transaction(s)</span>
            </div>
            <div class="summary-item">
              <span class="label">Moyenne achat/transaction</span>
              <span class="value">{{ rapport!.periode.moyenneAchatParTransaction.toFixed(2) }} FCFA</span>
            </div>
            <div class="summary-item">
              <span class="label">Moyenne vente/transaction</span>
              <span class="value">{{ rapport!.periode.moyenneVenteParTransaction.toFixed(2) }} FCFA</span>
            </div>
          </div>
        </div>

        <!-- Tendances -->
        <div class="card" *ngIf="rapport!.evolutionMensuelle.length > 1">
          <h2>Tendances</h2>
          <div class="tendances-grid">
            <div class="tendance-item">
              <span class="label">Évolution du CA</span>
              <span class="value" [class.positive]="rapport!.tendances.evolutionCA >= 0" [class.negative]="rapport!.tendances.evolutionCA < 0">
                {{ rapport!.tendances.evolutionCA >= 0 ? '+' : '' }}{{ rapport!.tendances.evolutionCA.toFixed(2) }}%
              </span>
            </div>
            <div class="tendance-item">
              <span class="label">Évolution du bénéfice</span>
              <span class="value" [class.positive]="rapport!.tendances.evolutionBenefice >= 0" [class.negative]="rapport!.tendances.evolutionBenefice < 0">
                {{ rapport!.tendances.evolutionBenefice >= 0 ? '+' : '' }}{{ rapport!.tendances.evolutionBenefice.toFixed(2) }}%
              </span>
            </div>
            <div class="tendance-item">
              <span class="label">Évolution des dépenses</span>
              <span class="value" [class.positive]="rapport!.tendances.evolutionDepenses <= 0" [class.negative]="rapport!.tendances.evolutionDepenses > 0">
                {{ rapport!.tendances.evolutionDepenses >= 0 ? '+' : '' }}{{ rapport!.tendances.evolutionDepenses.toFixed(2) }}%
              </span>
            </div>
          </div>
        </div>

        <!-- Évolution mensuelle -->
        <div class="card" *ngIf="rapport!.evolutionMensuelle.length > 0">
          <h2>Évolution mensuelle</h2>
          <div class="table-container">
            <table class="evolution-table">
              <thead>
                <tr>
                  <th>Mois</th>
                  <th>CA</th>
                  <th>Achats</th>
                  <th>Dépenses</th>
                  <th>Bénéfice</th>
                  <th>Marge Brute</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let mois of rapport!.evolutionMensuelle">
                  <td class="mois-cell">{{ mois.mois }} {{ mois.annee }}</td>
                  <td class="montant">{{ mois.chiffreAffaires.toFixed(2) }} FCFA</td>
                  <td class="montant">{{ mois.totalAchats.toFixed(2) }} FCFA</td>
                  <td class="montant">{{ mois.totalDepenses.toFixed(2) }} FCFA</td>
                  <td class="montant" [class.positive]="mois.beneficeNet >= 0" [class.negative]="mois.beneficeNet < 0">
                    {{ mois.beneficeNet.toFixed(2) }} FCFA
                  </td>
                  <td class="pourcentage" [class.positive]="mois.margeBrute >= 0" [class.negative]="mois.margeBrute < 0">
                    {{ mois.margeBrute.toFixed(2) }}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Dépenses par catégorie -->
        <div class="card" *ngIf="rapport!.depensesParCategorie.length > 0">
          <h2>Répartition des dépenses par catégorie</h2>
          <div class="categories-container">
            <div class="categorie-item" *ngFor="let cat of rapport!.depensesParCategorie">
              <div class="categorie-header">
                <span class="categorie-nom">{{ cat.categorie }}</span>
                <span class="categorie-montant">{{ cat.montant.toFixed(2) }} FCFA</span>
              </div>
              <div class="categorie-bar">
                <div class="categorie-fill" [style.width.%]="cat.pourcentage"></div>
              </div>
              <div class="categorie-pourcentage">{{ cat.pourcentage.toFixed(2) }}%</div>
            </div>
          </div>
        </div>

        <!-- Conseils -->
        <div class="card">
          <h2>Analyses et recommandations</h2>
          <div class="tips">
            <div class="tip" *ngIf="rapport!.periode.beneficeNet < 0">
              <span class="tip-icon warning">⚠️</span>
              <div>
                <strong>Bénéfice négatif détecté</strong>
                <p>Votre activité est en perte sur cette période. Analysez vos dépenses et envisagez d'ajuster vos prix de vente.</p>
              </div>
            </div>
            <div class="tip" *ngIf="rapport!.periode.beneficeNet >= 0">
              <span class="tip-icon success">✅</span>
              <div>
                <strong>Activité rentable</strong>
                <p>Excellent ! Votre activité génère des bénéfices sur cette période.</p>
              </div>
            </div>
            <div class="tip" *ngIf="rapport!.periode.margeBrute < 30">
              <span class="tip-icon info">📊</span>
              <div>
                <strong>Marge brute faible</strong>
                <p>Votre marge brute est de {{ rapport!.periode.margeBrute.toFixed(2) }}%. Optimisez vos coûts d'achat ou augmentez vos prix.</p>
              </div>
            </div>
            <div class="tip" *ngIf="rapport!.periode.margeBrute >= 50">
              <span class="tip-icon success">💪</span>
              <div>
                <strong>Excellente marge</strong>
                <p>Votre marge brute de {{ rapport!.periode.margeBrute.toFixed(2) }}% est excellente. Continuez ainsi !</p>
              </div>
            </div>
            <div class="tip" *ngIf="rapport!.tendances.evolutionDepenses > 20">
              <span class="tip-icon warning">⚠️</span>
              <div>
                <strong>Augmentation des dépenses</strong>
                <p>Vos dépenses ont augmenté de {{ rapport!.tendances.evolutionDepenses.toFixed(2) }}%. Surveillez vos coûts.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Message si aucun rapport -->
      <div class="card empty-state" *ngIf="!rapportGenere && !isLoading">
        <div class="empty-icon">📋</div>
        <h2>Aucun rapport généré</h2>
        <p>Sélectionnez une période et cliquez sur "Générer le rapport" pour commencer.</p>
      </div>
    </div>
  `,
  styleUrls: ['./rapports.component.scss']
})
export class RapportsComponent implements OnInit {
  rapport: RapportComplet | null = null;
  rapportGenere = false;
  isLoading = false;

  typeRapport: TypeRapport = 'mensuel';
  moisSelectionne = new Date().getMonth() + 1;
  anneeSelectionnee = new Date().getFullYear();
  dateDebut = '';
  dateFin = '';

  moisDisponibles = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  anneesDisponibles: number[] = [];

  // Devise
  defaultCurrency?: Currency;

  // Informations de l'entreprise et de l'utilisateur
  currentUser?: User;
  tenant?: Tenant;

  constructor(
    private rapportService: RapportService,
    private notificationService: NotificationService,
    private currencyService: CurrencyService,
    private exportService: ExportService,
    private authService: AuthService,
    private tenantService: TenantService
  ) {}

  ngOnInit(): void {
    this.loadCurrency();
    this.loadUserAndTenant();
    // Génère les 5 dernières années
    const anneeActuelle = new Date().getFullYear();
    for (let i = 0; i < 5; i++) {
      this.anneesDisponibles.push(anneeActuelle - i);
    }
  }

  /**
   * Charge les informations de l'utilisateur et de l'entreprise
   */
  loadUserAndTenant(): void {
    this.currentUser = this.authService.getCurrentUser() || undefined;
    this.tenantService.getTenantInfo().subscribe({
      next: (tenant) => {
        this.tenant = tenant;
      },
      error: (error) => {
        console.warn('Impossible de charger les informations de l\'entreprise', error);
      }
    });
  }

  /**
   * Charge la devise par défaut
   */
  loadCurrency(): void {
    this.currencyService.getAllCurrencies().subscribe({
      next: (currencies) => {
        this.defaultCurrency = currencies.find(c => c.isDefault);
        if (!this.defaultCurrency && currencies.length > 0) {
          this.defaultCurrency = currencies[0];
        }
      },
      error: (error) => {
        console.warn('Impossible de charger les devises, utilisation de CFA par défaut', error);
        this.defaultCurrency = {
          code: 'XOF',
          nom: 'Franc CFA',
          symbole: 'CFA',
          pays: 'Sénégal',
          isDefault: true
        };
      }
    });
  }

  onTypeRapportChange(): void {
    this.rapportGenere = false;
  }

  genererRapport(): void {
    const filtre: FiltreRapport = {
      type: this.typeRapport,
      mois: this.moisSelectionne,
      annee: this.anneeSelectionnee,
      dateDebut: this.dateDebut,
      dateFin: this.dateFin
    };

    // Validation pour période personnalisée
    if (this.typeRapport === 'personnalise' && (!this.dateDebut || !this.dateFin)) {
      this.notificationService.error('Veuillez sélectionner une date de début et de fin');
      return;
    }

    this.isLoading = true;
    this.rapportService.genererRapportComplet(filtre).subscribe({
      next: (rapport) => {
        this.rapport = rapport;
        this.rapportGenere = true;
        this.isLoading = false;
        this.notificationService.success('Rapport généré avec succès');
      },
      error: (error) => {
        console.error('Erreur lors de la génération du rapport:', error);
        this.notificationService.error('Erreur lors de la génération du rapport');
        this.isLoading = false;
      }
    });
  }

  /**
   * Export du rapport en PDF avec informations de l'entreprise (version améliorée)
   */
  exporterPDF(): void {
    if (!this.rapport) return;

    const nomFichier = `rapport_${this.typeRapport}_${new Date().toISOString().split('T')[0]}`;
    const devise = this.defaultCurrency?.symbole || 'CFA';

    const exportOptions = {
      filename: nomFichier,
      title: `Rapport ${this.typeRapport.charAt(0).toUpperCase() + this.typeRapport.slice(1)}`,
      columns: [], // Pas besoin pour la nouvelle méthode
      data: [], // Pas besoin pour la nouvelle méthode
      dateRange: {
        dateDebut: this.rapport.periode.dateDebut,
        dateFin: this.rapport.periode.dateFin
      },
      companyInfo: {
        nom: this.tenant?.nomEntreprise || 'Mon Entreprise',
        proprietaire: this.tenant?.prenomProprietaire && this.tenant?.nomProprietaire
          ? `${this.tenant.prenomProprietaire} ${this.tenant.nomProprietaire}`
          : '',
        telephone: this.tenant?.numeroTelephone || '',
        adresse: this.tenant?.adresse || ''
      },
      summaryData: {
        chiffreAffaires: this.rapport.periode.chiffreAffaires,
        totalAchats: this.rapport.periode.totalAchats,
        totalDepenses: this.rapport.periode.totalDepenses,
        beneficeNet: this.rapport.periode.beneficeNet,
        margeBrute: this.rapport.periode.margeBrute,
        margeNette: this.rapport.periode.margeNette
      },
      evolutionData: this.rapport.evolutionMensuelle,
      devise: devise
    };

    this.exportService.genererRapportAmeliore(exportOptions);
    this.notificationService.success('Rapport exporté en PDF avec succès');
  }

  /**
   * Export du rapport en Excel avec informations de l'entreprise
   */
  exporterExcel(): void {
    if (!this.rapport) return;

    // Préparer les données de la période pour l'export
    const periodeData = [{
      'Période': `${this.rapport.periode.dateDebut} - ${this.rapport.periode.dateFin}`,
      'Chiffre d\'Affaires': this.rapport.periode.chiffreAffaires,
      'Total Achats': this.rapport.periode.totalAchats,
      'Total Dépenses': this.rapport.periode.totalDepenses,
      'Bénéfice Net': this.rapport.periode.beneficeNet,
      'Marge Brute (%)': this.rapport.periode.margeBrute.toFixed(2),
      'Marge Nette (%)': this.rapport.periode.margeNette.toFixed(2),
      'Nombre Achats': this.rapport.periode.nombreAchats,
      'Nombre Ventes': this.rapport.periode.nombreVentes,
      'Nombre Dépenses': this.rapport.periode.nombreDepenses
    }];

    const columns = [
      { header: 'Période', field: 'Période' },
      { header: `CA (${this.defaultCurrency?.symbole || 'CFA'})`, field: 'Chiffre d\'Affaires', format: (val: number) => val.toFixed(2) },
      { header: `Achats (${this.defaultCurrency?.symbole || 'CFA'})`, field: 'Total Achats', format: (val: number) => val.toFixed(2) },
      { header: `Dépenses (${this.defaultCurrency?.symbole || 'CFA'})`, field: 'Total Dépenses', format: (val: number) => val.toFixed(2) },
      { header: `Bénéfice (${this.defaultCurrency?.symbole || 'CFA'})`, field: 'Bénéfice Net', format: (val: number) => val.toFixed(2) },
      { header: 'Marge Brute (%)', field: 'Marge Brute (%)' },
      { header: 'Marge Nette (%)', field: 'Marge Nette (%)' },
      { header: 'Nb Achats', field: 'Nombre Achats' },
      { header: 'Nb Ventes', field: 'Nombre Ventes' },
      { header: 'Nb Dépenses', field: 'Nombre Dépenses' }
    ];

    const nomFichier = `rapport_${this.typeRapport}_${new Date().toISOString().split('T')[0]}`;

    const exportOptions = {
      filename: nomFichier,
      title: `Rapport ${this.typeRapport.charAt(0).toUpperCase() + this.typeRapport.slice(1)}`,
      columns,
      data: periodeData,
      dateRange: {
        dateDebut: this.rapport.periode.dateDebut,
        dateFin: this.rapport.periode.dateFin
      },
      companyInfo: {
        nom: this.tenant?.nomEntreprise || 'Mon Entreprise',
        proprietaire: this.currentUser ? `${this.currentUser.prenom} ${this.currentUser.nom}` : 'Propriétaire',
        telephone: this.tenant?.numeroTelephone || '',
        adresse: this.tenant?.adresse || ''
      }
    };

    this.exportService.exportToExcel(exportOptions);
    this.notificationService.success('Rapport exporté en Excel avec succès');
  }

  exporterCSV(): void {
    if (!this.rapport) return;
    const nomFichier = `rapport_${this.typeRapport}_${new Date().toISOString().split('T')[0]}.csv`;
    this.rapportService.exporterCSV(this.rapport, nomFichier);
    this.notificationService.success('Rapport exporté en CSV');
  }

  exporterJSON(): void {
    if (!this.rapport) return;
    const nomFichier = `rapport_${this.typeRapport}_${new Date().toISOString().split('T')[0]}.json`;
    this.rapportService.exporterJSON(this.rapport, nomFichier);
    this.notificationService.success('Rapport exporté en JSON');
  }

  getPeriodeLabel(): string {
    if (!this.rapport) return '';
    return `${this.rapport.periode.dateDebut} - ${this.rapport.periode.dateFin}`;
  }
}
