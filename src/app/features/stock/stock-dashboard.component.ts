import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StockService } from '../../core/services/stock.service';
import { NotificationService } from '../../core/services/notification.service';
import { StockDto, ResumeStock, AlerteStock, StatutStock } from '../../core/models/stock.model';
import { CurrencyEurPipe } from '../../shared/pipes/currency-eur.pipe';

/**
 * Composant du dashboard de gestion de stock
 */
@Component({
  selector: 'app-stock-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyEurPipe],
  template: `
    <div class="stock-dashboard">
      <div class="page-header">
        <h1>📦 Gestion du Stock</h1>
        <button class="btn btn-primary" (click)="refreshData()">
          🔄 Actualiser
        </button>
      </div>

      <!-- Cartes de résumé -->
      <div class="summary-cards" *ngIf="resume">
        <div class="card card-total">
          <div class="card-icon">📊</div>
          <div class="card-content">
            <h3>Total Produits</h3>
            <p class="card-value">{{ resume.totalProduits }}</p>
          </div>
        </div>

        <div class="card card-success">
          <div class="card-icon">✓</div>
          <div class="card-content">
            <h3>En Stock</h3>
            <p class="card-value">{{ resume.produitsEnStock }}</p>
            <small>{{ resume.quantiteTotaleDisponible }} unités</small>
          </div>
        </div>

        <div class="card card-warning">
          <div class="card-icon">⚠</div>
          <div class="card-content">
            <h3>Stock Bas</h3>
            <p class="card-value">{{ resume.produitsStockBas }}</p>
          </div>
        </div>

        <div class="card card-danger">
          <div class="card-icon">✗</div>
          <div class="card-content">
            <h3>Rupture</h3>
            <p class="card-value">{{ resume.produitsEnRupture }}</p>
          </div>
        </div>

        <div class="card card-value">
          <div class="card-icon">💰</div>
          <div class="card-content">
            <h3>Valeur Stock</h3>
            <p class="card-value">{{ resume.valeurTotaleStock | currencyEur }}</p>
            <small>Marge: {{ resume.margeGlobale | currencyEur }}</small>
          </div>
        </div>
      </div>

      <!-- Alertes -->
      <div class="alerts-section" *ngIf="alertes && alertes.length > 0">
        <h2>🔔 Alertes Stock</h2>
        <div class="alerts-list">
          <div
            *ngFor="let alerte of alertes"
            class="alert-item"
            [ngClass]="'alert-' + alerte.statut.toLowerCase()">
            <span class="alert-icon">{{ getStatutIcon(alerte.statut) }}</span>
            <div class="alert-info">
              <strong>{{ alerte.nomProduit }}</strong>
              <span>Stock: {{ alerte.stockDisponible }} unités</span>
            </div>
            <span class="alert-badge" [style.background-color]="getStatutColor(alerte.statut)">
              {{ getStatutLabel(alerte.statut) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Filtres et recherche -->
      <div class="filters">
        <input
          type="text"
          placeholder="🔍 Rechercher un produit..."
          [(ngModel)]="searchTerm"
          (input)="filterStocks()"
        />

        <select [(ngModel)]="selectedStatut" (change)="filterStocks()">
          <option value="">Tous les statuts</option>
          <option value="EN_STOCK">En stock</option>
          <option value="STOCK_BAS">Stock bas</option>
          <option value="RUPTURE">Rupture</option>
          <option value="NEGATIF">Négatif</option>
        </select>

        <select [(ngModel)]="sortBy" (change)="sortStocks()">
          <option value="nom">Trier par nom</option>
          <option value="stock-asc">Stock (croissant)</option>
          <option value="stock-desc">Stock (décroissant)</option>
          <option value="valeur-desc">Valeur (décroissant)</option>
          <option value="marge-desc">Marge (décroissant)</option>
        </select>
      </div>

      <!-- Chargement -->
      <div class="loading" *ngIf="isLoading">
        <div class="spinner"></div>
        <p>Chargement du stock...</p>
      </div>

      <!-- Tableau des stocks -->
      <div class="stock-table" *ngIf="!isLoading">
        <table *ngIf="filteredStocks.length > 0">
          <thead>
            <tr>
              <th>Produit</th>
              <th>Acheté</th>
              <th>Vendu</th>
              <th>Stock</th>
              <th>Prix Achat</th>
              <th>Prix Vente</th>
              <th>Valeur</th>
              <th>Marge</th>
              <th>Rotation</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let stock of filteredStocks" [ngClass]="'row-' + stock.statut.toLowerCase()">
              <td class="bold">{{ stock.nomProduit }}</td>
              <td>{{ stock.quantiteAchetee }}</td>
              <td>{{ stock.quantiteVendue }}</td>
              <td>
                <span class="stock-quantity" [style.color]="getStatutColor(stock.statut)">
                  {{ stock.stockDisponible }}
                </span>
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    [style.width.%]="calculerPourcentageStock(stock)"
                    [style.background-color]="getStatutColor(stock.statut)">
                  </div>
                </div>
              </td>
              <td>{{ stock.prixMoyenAchat | currencyEur }}</td>
              <td>{{ stock.prixMoyenVente | currencyEur }}</td>
              <td class="bold">{{ stock.valeurStock | currencyEur }}</td>
              <td [class.positive]="stock.margeUnitaire > 0" [class.negative]="stock.margeUnitaire < 0">
                {{ stock.margeUnitaire | currencyEur }}
              </td>
              <td>
                <span class="rotation-badge">{{ calculerTauxRotation(stock) | number:'1.0-0' }}%</span>
              </td>
              <td>
                <span
                  class="status-badge"
                  [style.background-color]="getStatutColor(stock.statut)">
                  {{ getStatutIcon(stock.statut) }} {{ getStatutLabel(stock.statut) }}
                </span>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="3" class="text-right"><strong>Totaux :</strong></td>
              <td class="bold">{{ calculateTotalStock() }}</td>
              <td colspan="2"></td>
              <td class="bold">{{ calculateTotalValue() | currencyEur }}</td>
              <td class="bold">{{ calculateTotalMarge() | currencyEur }}</td>
              <td colspan="2"></td>
            </tr>
          </tfoot>
        </table>

        <div class="empty-state" *ngIf="filteredStocks.length === 0">
          <div class="empty-icon">📦</div>
          <h3>Aucun produit trouvé</h3>
          <p *ngIf="searchTerm || selectedStatut">Essayez de modifier vos filtres</p>
          <p *ngIf="!searchTerm && !selectedStatut">Le stock est vide</p>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./stock-dashboard.component.scss']
})
export class StockDashboardComponent implements OnInit {
  stocks: StockDto[] = [];
  filteredStocks: StockDto[] = [];
  resume?: ResumeStock;
  alertes: AlerteStock[] = [];

  isLoading = true;
  searchTerm = '';
  selectedStatut = '';
  sortBy = 'nom';

  constructor(
    private stockService: StockService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;

    // Charger toutes les données en parallèle
    Promise.all([
      this.stockService.getAllStocks().toPromise(),
      this.stockService.getResume().toPromise(),
      this.stockService.getAlertes().toPromise()
    ]).then(([stocks, resume, alertes]) => {
      this.stocks = stocks || [];
      this.resume = resume;
      this.alertes = alertes || [];
      this.filteredStocks = [...this.stocks];
      this.sortStocks();
      this.isLoading = false;
    }).catch(error => {
      console.error('Erreur lors du chargement:', error);
      this.notificationService.error('Erreur lors du chargement des données');
      this.isLoading = false;
    });
  }

  refreshData(): void {
    this.notificationService.info('Actualisation en cours...');
    this.loadData();
  }

  filterStocks(): void {
    let result = [...this.stocks];

    // Filtre par recherche
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(stock =>
        stock.nomProduit.toLowerCase().includes(term)
      );
    }

    // Filtre par statut
    if (this.selectedStatut) {
      result = result.filter(stock => stock.statut === this.selectedStatut);
    }

    this.filteredStocks = result;
    this.sortStocks();
  }

  sortStocks(): void {
    switch (this.sortBy) {
      case 'nom':
        this.filteredStocks.sort((a, b) => a.nomProduit.localeCompare(b.nomProduit));
        break;
      case 'stock-asc':
        this.filteredStocks.sort((a, b) => a.stockDisponible - b.stockDisponible);
        break;
      case 'stock-desc':
        this.filteredStocks.sort((a, b) => b.stockDisponible - a.stockDisponible);
        break;
      case 'valeur-desc':
        this.filteredStocks.sort((a, b) => b.valeurStock - a.valeurStock);
        break;
      case 'marge-desc':
        this.filteredStocks.sort((a, b) => b.margeUnitaire - a.margeUnitaire);
        break;
    }
  }

  calculateTotalStock(): number {
    return this.filteredStocks.reduce((sum, stock) => sum + stock.stockDisponible, 0);
  }

  calculateTotalValue(): number {
    return this.filteredStocks.reduce((sum, stock) => sum + stock.valeurStock, 0);
  }

  calculateTotalMarge(): number {
    return this.filteredStocks.reduce((sum, stock) => sum + stock.margeUnitaire, 0);
  }

  calculerPourcentageStock(stock: StockDto): number {
    return this.stockService.calculerPourcentageStock(stock);
  }

  calculerTauxRotation(stock: StockDto): number {
    return this.stockService.calculerTauxRotation(stock);
  }

  getStatutLabel(statut: StatutStock): string {
    return this.stockService.getStatutLabel(statut);
  }

  getStatutColor(statut: StatutStock): string {
    return this.stockService.getStatutColor(statut);
  }

  getStatutIcon(statut: StatutStock): string {
    return this.stockService.getStatutIcon(statut);
  }
}
