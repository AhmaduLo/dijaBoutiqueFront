import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { MetricCardComponent } from '../../shared/components/metric-card/metric-card.component';
import { AchatService } from '../../core/services/achat.service';
import { VenteService } from '../../core/services/vente.service';
import { DepenseService } from '../../core/services/depense.service';
import { NotificationService } from '../../core/services/notification.service';

/**
 * Composant Dashboard - Vue d'ensemble des métriques de l'activité
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, MetricCardComponent],
  template: `
    <div class="dashboard">
      <div class="dashboard__header">
        <div>
          <h1>Tableau de bord</h1>
          <p class="subtitle">Vue d'ensemble de votre activité</p>
        </div>
        <div class="period-selector">
          <label>Période :</label>
          <select [(ngModel)]="selectedPeriod" (change)="onPeriodChange()">
            <option value="current-month">Mois en cours</option>
            <option value="last-month">Mois dernier</option>
            <option value="current-quarter">Trimestre en cours</option>
            <option value="current-year">Année en cours</option>
            <option value="custom">Personnalisée</option>
          </select>
          <div class="custom-dates" *ngIf="selectedPeriod === 'custom'">
            <input type="date" [(ngModel)]="customDateDebut" (change)="loadMetrics()" />
            <span>au</span>
            <input type="date" [(ngModel)]="customDateFin" (change)="loadMetrics()" />
          </div>
        </div>
      </div>

      <div class="loading" *ngIf="isLoading">
        <div class="spinner"></div>
        <p>Chargement des données...</p>
      </div>

      <div class="metrics-grid" *ngIf="!isLoading">
        <app-metric-card
          title="Total Achats"
          [value]="totalAchats"
          icon="🛒"
          color="pink"
          [subtitle]="'Du ' + dateDebut + ' au ' + dateFin"
        ></app-metric-card>

        <app-metric-card
          title="Chiffre d'Affaires"
          [value]="chiffreAffaires"
          icon="💰"
          color="green"
          [subtitle]="'Du ' + dateDebut + ' au ' + dateFin"
        ></app-metric-card>

        <app-metric-card
          title="Total Dépenses"
          [value]="totalDepenses"
          icon="💳"
          color="orange"
          [subtitle]="'Du ' + dateDebut + ' au ' + dateFin"
        ></app-metric-card>

        <app-metric-card
          title="Bénéfice Net"
          [value]="beneficeNet"
          icon="📊"
          [color]="beneficeNet >= 0 ? 'purple' : 'orange'"
          [subtitle]="'Ventes - Achats - Dépenses'"
        ></app-metric-card>
      </div>

      <div class="dashboard__content" *ngIf="!isLoading">
        <div class="card">
          <h2>📈 Résumé de la période</h2>
          <div class="summary-list">
            <div class="summary-item">
              <span class="label">Période analysée</span>
              <span class="value">{{ dateDebut }} au {{ dateFin }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Marge brute</span>
              <span class="value" [class.positive]="margeBrute >= 0" [class.negative]="margeBrute < 0">
                {{ margeBrute >= 0 ? '+' : '' }}{{ margeBrute.toFixed(2) }} %
              </span>
            </div>
            <div class="summary-item">
              <span class="label">Nombre d'achats</span>
              <span class="value">{{ nombreAchats }} transaction(s)</span>
            </div>
            <div class="summary-item">
              <span class="label">Nombre de ventes</span>
              <span class="value">{{ nombreVentes }} transaction(s)</span>
            </div>
            <div class="summary-item">
              <span class="label">Nombre de dépenses</span>
              <span class="value">{{ nombreDepenses }} transaction(s)</span>
            </div>
          </div>
        </div>

        <div class="card">
          <h2>💡 Conseils</h2>
          <div class="tips">
            <div class="tip" *ngIf="beneficeNet < 0">
              <span class="tip-icon">⚠️</span>
              <p>Attention, votre bénéfice est négatif. Analysez vos dépenses et ajustez vos prix si nécessaire.</p>
            </div>
            <div class="tip" *ngIf="beneficeNet >= 0">
              <span class="tip-icon">✅</span>
              <p>Excellent ! Votre activité est rentable sur cette période.</p>
            </div>
            <div class="tip" *ngIf="margeBrute < 30">
              <span class="tip-icon">📊</span>
              <p>Votre marge brute est faible ({{ margeBrute.toFixed(2) }}%). Essayez d'optimiser vos achats ou d'augmenter vos prix.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  // Métriques
  totalAchats = 0;
  chiffreAffaires = 0;
  totalDepenses = 0;
  beneficeNet = 0;
  margeBrute = 0;
  nombreAchats = 0;
  nombreVentes = 0;
  nombreDepenses = 0;

  // Dates
  dateDebut = '';
  dateFin = '';
  selectedPeriod = 'current-year'; // Changé de 'current-month' à 'current-year'
  customDateDebut = '';
  customDateFin = '';

  isLoading = true;

  constructor(
    private achatService: AchatService,
    private venteService: VenteService,
    private depenseService: DepenseService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.initializeDates();
    this.loadMetrics();
  }

  /**
   * Initialise les dates selon la période sélectionnée
   */
  initializeDates(): void {
    const today = new Date();

    switch (this.selectedPeriod) {
      case 'current-month':
        this.dateDebut = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        this.dateFin = today.toISOString().split('T')[0];
        break;
      case 'last-month':
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        this.dateDebut = lastMonth.toISOString().split('T')[0];
        this.dateFin = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split('T')[0];
        break;
      case 'current-quarter':
        const quarter = Math.floor(today.getMonth() / 3);
        this.dateDebut = new Date(today.getFullYear(), quarter * 3, 1).toISOString().split('T')[0];
        this.dateFin = today.toISOString().split('T')[0];
        break;
      case 'current-year':
        this.dateDebut = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
        this.dateFin = today.toISOString().split('T')[0];
        break;
      case 'custom':
        if (this.customDateDebut && this.customDateFin) {
          this.dateDebut = this.customDateDebut;
          this.dateFin = this.customDateFin;
        }
        break;
    }
  }

  /**
   * Gère le changement de période
   */
  onPeriodChange(): void {
    this.initializeDates();
    if (this.selectedPeriod !== 'custom') {
      this.loadMetrics();
    }
  }

  /**
   * Charge toutes les métriques
   */
  loadMetrics(): void {
    if (!this.dateDebut || !this.dateFin) {
      return;
    }

    this.isLoading = true;


    forkJoin({
      achats: this.achatService.getStatistiques(this.dateDebut, this.dateFin),
      ventes: this.venteService.getStatistiques(this.dateDebut, this.dateFin),
      depenses: this.depenseService.getTotal(this.dateDebut, this.dateFin),
      statsDepenses: this.depenseService.getStatistiques(this.dateDebut, this.dateFin)
    }).subscribe({
      next: (data) => {

        // Métriques principales
        this.totalAchats = data.achats.montantTotal || data.achats.totalAchats || 0;
        this.chiffreAffaires = data.ventes.chiffreAffaires || 0;
        this.totalDepenses = data.depenses || 0;
        this.beneficeNet = this.chiffreAffaires - this.totalAchats - this.totalDepenses;


        // Calcul de la marge brute (en %)
        if (this.chiffreAffaires > 0) {
          this.margeBrute = ((this.chiffreAffaires - this.totalAchats) / this.chiffreAffaires) * 100;
        } else {
          this.margeBrute = 0;
        }

        // Nombre de transactions
        this.nombreAchats = data.achats.nombreAchats || 0;
        this.nombreVentes = data.ventes.nombreVentes || 0;
        this.nombreDepenses = data.statsDepenses.nombreDepenses || 0;


        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des métriques:', error);
        console.error('Détails de l\'erreur:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url
        });
        this.notificationService.error('Erreur lors du chargement des données du tableau de bord');
        this.isLoading = false;
      }
    });
  }
}
