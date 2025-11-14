import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StockService } from '../../core/services/stock.service';
import { NotificationService } from '../../core/services/notification.service';
import { StockDto, ResumeStock, AlerteStock, StatutStock } from '../../core/models/stock.model';
import { CurrencyEurPipe } from '../../shared/pipes/currency-eur.pipe';
import { CurrencyService } from '../../core/services/currency.service';
import { Currency } from '../../core/models/currency.model';
import { AuthService } from '../../core/services/auth.service';
import { FileService } from '../../core/services/file.service';
import { PaymentService } from '../../core/services/payment.service';
import { PlanAbonnement } from '../../core/models/payment.model';
import { ImageViewerModalComponent } from '../../shared/components/image-viewer-modal/image-viewer-modal.component';

/**
 * Composant du dashboard de gestion de stock
 */
@Component({
  selector: 'app-stock-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyEurPipe, ImageViewerModalComponent],
  template: `
    <div class="stock-dashboard">
      <div class="page-header">
        <h1>📦 Gestion du Stock</h1>
        <div style="display: flex; gap: 1rem;">
          <button class="btn btn-primary" (click)="refreshData()">
            🔄 Actualiser
          </button>
        </div>
      </div>

      <!-- Cartes de résumé - Visible seulement pour Admin/Gérant -->
      <div class="summary-cards" *ngIf="resume && isAdminOrGerant()">
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
            <h3>Valeur Stock ({{ defaultCurrency?.symbole || 'CFA' }})</h3>
            <p class="card-value">{{ resume.valeurTotaleStock | number:'1.0-2':'fr-FR' }}</p>
            <small>Marge: {{ resume.margeGlobale | number:'1.0-2':'fr-FR' }} {{ defaultCurrency?.symbole || 'CFA' }}</small>
          </div>
        </div>
      </div>

      <!-- Cartes simplifiées pour utilisateurs -->
      <div class="summary-cards" *ngIf="resume && !isAdminOrGerant()">
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
      </div>

      <!-- Alertes - Visible seulement pour Admin/Gérant -->
      <div class="alerts-section" *ngIf="alertes && alertes.length > 0 && isAdminOrGerant()">
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
        <!-- Tableau complet pour Admin/Gérant -->
        <table *ngIf="filteredStocks.length > 0 && isAdminOrGerant()">
          <thead>
            <tr>
              <th *ngIf="canUsePhotos()">Photo</th>
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
              <td *ngIf="canUsePhotos()">
                <img
                  [src]="getPhotoUrl(stock.photoUrl)"
                  [alt]="stock.nomProduit"
                  class="product-thumbnail clickable"
                  (click)="openImageViewer(stock.photoUrl, stock.nomProduit)"
                  title="Cliquer pour agrandir"
                />
              </td>
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
              <td>{{ stock.prixMoyenAchat | number:'1.0-2':'fr-FR' }} <span class="currency-symbol">{{ defaultCurrency?.symbole || 'CFA' }}</span></td>
              <td>{{ stock.prixMoyenVente | number:'1.0-2':'fr-FR' }} <span class="currency-symbol">{{ defaultCurrency?.symbole || 'CFA' }}</span></td>
              <td class="bold">{{ stock.valeurStock | number:'1.0-2':'fr-FR' }} <span class="currency-symbol">{{ defaultCurrency?.symbole || 'CFA' }}</span></td>
              <td [class.positive]="stock.margeUnitaire > 0" [class.negative]="stock.margeUnitaire < 0">
                {{ stock.margeUnitaire | number:'1.0-2':'fr-FR' }} <span class="currency-symbol">{{ defaultCurrency?.symbole || 'CFA' }}</span>
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
              <td [attr.colspan]="canUsePhotos() ? 4 : 3" class="text-right"><strong>Totaux :</strong></td>
              <td class="bold">{{ calculateTotalStock() }}</td>
              <td colspan="2"></td>
              <td class="bold">{{ calculateTotalValue() | number:'1.0-2':'fr-FR' }} <span class="currency-symbol">{{ defaultCurrency?.symbole || 'CFA' }}</span></td>
              <td class="bold">{{ calculateTotalMarge() | number:'1.0-2':'fr-FR' }} <span class="currency-symbol">{{ defaultCurrency?.symbole || 'CFA' }}</span></td>
              <td colspan="2"></td>
            </tr>
          </tfoot>
        </table>

        <!-- Tableau simplifié pour utilisateurs simples -->
        <table *ngIf="filteredStocks.length > 0 && !isAdminOrGerant()">
          <thead>
            <tr>
              <th *ngIf="canUsePhotos()">Photo</th>
              <th>Produit</th>
              <th>Stock</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let stock of filteredStocks" [ngClass]="'row-' + stock.statut.toLowerCase()">
              <td *ngIf="canUsePhotos()">
                <img
                  [src]="getPhotoUrl(stock.photoUrl)"
                  [alt]="stock.nomProduit"
                  class="product-thumbnail clickable"
                  (click)="openImageViewer(stock.photoUrl, stock.nomProduit)"
                  title="Cliquer pour agrandir"
                />
              </td>
              <td class="bold">{{ stock.nomProduit }}</td>
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
              <td [attr.colspan]="canUsePhotos() ? 2 : 1" class="text-right"><strong>Total :</strong></td>
              <td class="bold">{{ calculateTotalStock() }}</td>
              <td></td>
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

    <!-- Modal de visualisation d'image -->
    <app-image-viewer-modal
      [isOpen]="showImageViewer"
      [imageUrl]="selectedImageUrl"
      [altText]="selectedImageAlt"
      (closed)="closeImageViewer()">
    </app-image-viewer-modal>
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

  // Devise
  defaultCurrency?: Currency;

  // Image viewer
  showImageViewer = false;
  selectedImageUrl = '';
  selectedImageAlt = '';

  constructor(
    private stockService: StockService,
    private notificationService: NotificationService,
    private currencyService: CurrencyService,
    private authService: AuthService,
    private fileService: FileService,
    private paymentService: PaymentService
  ) { }

  ngOnInit(): void {
    this.loadCurrency();
    this.loadData();
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

  /**
   * Vérifie si l'utilisateur connecté est un ADMIN
   */
  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  /**
   * Vérifie si l'utilisateur connecté est un ADMIN ou GERANT
   */
  isAdminOrGerant(): boolean {
    return this.authService.isAdminOrGerant();
  }

  /**
   * Retourne l'URL de la photo ou le placeholder par défaut
   */
  getPhotoUrl(photoUrl: string | null | undefined): string {
    return this.fileService.getPhotoUrl(photoUrl || null);
  }

  /**
   * Ouvre la modal de visualisation d'image
   */
  openImageViewer(photoUrl: string | null | undefined, altText: string): void {
    if (photoUrl) {
      this.selectedImageUrl = this.getPhotoUrl(photoUrl);
      this.selectedImageAlt = altText;
      this.showImageViewer = true;
    }
  }

  /**
   * Ferme la modal de visualisation d'image
   */
  closeImageViewer(): void {
    this.showImageViewer = false;
    this.selectedImageUrl = '';
    this.selectedImageAlt = '';
  }

  /**
   * Vérifie si le plan actuel permet l'utilisation des photos
   */
  canUsePhotos(): boolean {
    const currentPlan = this.paymentService.getCurrentPlan();
    return currentPlan === PlanAbonnement.ENTREPRISE;
  }
}
