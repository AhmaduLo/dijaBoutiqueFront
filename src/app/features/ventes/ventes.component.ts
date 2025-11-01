import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Vente } from '../../core/models/vente.model';
import { VenteService } from '../../core/services/vente.service';
import { NotificationService } from '../../core/services/notification.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { StockService } from '../../core/services/stock.service';
import { StockDto } from '../../core/models/stock.model';
import { CurrencyEurPipe } from '../../shared/pipes/currency-eur.pipe';
import { CurrencyService } from '../../core/services/currency.service';
import { Currency } from '../../core/models/currency.model';
import { ExportService } from '../../core/services/export.service';

@Component({
  selector: 'app-ventes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, CurrencyEurPipe],
  template: `
    <div class="ventes">
      <div class="page-header">
        <h1>💰 Gestion des Ventes</h1>
        <div style="display: flex; gap: 1rem;">
          <button class="btn btn-success" (click)="openExportModal()">
            📊 Exporter
          </button>
          <button class="btn btn-primary" (click)="openForm()">
            + Nouvelle vente
          </button>
        </div>
      </div>

      <!-- Modal d'export -->
      <div class="modal" *ngIf="showExportModal" (click)="closeExportModal()">
        <div class="modal-content" style="max-width: 500px;" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>📊 Exporter les ventes</h2>
            <button class="close-btn" (click)="closeExportModal()">×</button>
          </div>
          <div class="modal-body" style="padding: 1.5rem;">
            <div class="form-group">
              <label>Date de début (optionnel)</label>
              <input
                type="date"
                [(ngModel)]="exportDateDebut"
                class="form-control"
                placeholder="Sélectionner une date"
              />
            </div>
            <div class="form-group" style="margin-top: 1rem;">
              <label>Date de fin (optionnel)</label>
              <input
                type="date"
                [(ngModel)]="exportDateFin"
                class="form-control"
                placeholder="Sélectionner une date"
              />
            </div>
            <div style="margin-top: 1.5rem; text-align: center; color: #666;">
              <small>
                <em>Laissez vide pour exporter toutes les ventes</em>
              </small>
            </div>
          </div>
          <div class="modal-footer" style="justify-content: space-between;">
            <button class="btn btn-secondary" (click)="closeExportModal()">
              Annuler
            </button>
            <div style="display: flex; gap: 0.5rem;">
              <button class="btn btn-success" (click)="exportToExcel()">
                📊 Excel
              </button>
              <button class="btn btn-danger" (click)="exportToPDF()">
                📄 PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="modal" *ngIf="showForm" (click)="closeFormIfOutside($event)">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ isEditing ? 'Modifier' : 'Ajouter' }} une vente</h2>
            <button class="close-btn" (click)="closeForm()">×</button>
          </div>
          <form [formGroup]="venteForm" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <div class="form-group">
                <label>Nom du produit *</label>
                <select formControlName="nomProduit" (change)="onProductChange()">
                  <option value="">-- Sélectionner un produit --</option>
                  <option *ngFor="let produit of produitsDisponibles" [value]="produit.nomProduit">
                    {{ produit.nomProduit }} (Stock: {{ produit.stockDisponible }})
                  </option>
                </select>
                <div class="error" *ngIf="venteForm.get('nomProduit')?.invalid && venteForm.get('nomProduit')?.touched">
                  Veuillez sélectionner un produit
                </div>
                <div class="info-stock" *ngIf="selectedProduct">
                  <small>
                    📦 Stock disponible: {{ selectedProduct.stockDisponible }} unités |
                    💰 Prix de vente suggéré: {{ selectedProduct.prixMoyenVente | currencyEur }}
                  </small>
                </div>
              </div>
              <div class="form-group">
                <label>Client *</label>
                <input type="text" formControlName="client" placeholder="Ex: Marie Martin" />
                <div class="error" *ngIf="venteForm.get('client')?.invalid && venteForm.get('client')?.touched">
                  Le nom du client est requis
                </div>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Quantité *</label>
                <input type="number" formControlName="quantite" min="1" (input)="calculerTotal()" />
              </div>
              <div class="form-group">
                <label>Prix unitaire ({{ selectedCurrency?.symbole || 'CFA' }}) *</label>
                <input type="number" formControlName="prixUnitaire" min="0" step="0.01" (input)="calculerTotal()" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Date de vente *</label>
                <input type="date" formControlName="dateVente" />
              </div>
              <div class="form-group">
                <label>Prix total ({{ selectedCurrency?.symbole || 'CFA' }})</label>
                <input type="number" formControlName="prixTotal" readonly class="readonly" />
              </div>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" (click)="closeForm()">Annuler</button>
              <button type="submit" class="btn btn-primary" [disabled]="venteForm.invalid || isSubmitting">
                {{ isSubmitting ? 'Enregistrement...' : (isEditing ? 'Modifier' : 'Ajouter') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div class="filters">
        <input type="text" placeholder="🔍 Rechercher par nom de produit ou client..." [(ngModel)]="searchTerm"
          (input)="filterVentes()" [ngModelOptions]="{standalone: true}" />
      </div>

      <div class="loading" *ngIf="isLoading">
        <div class="spinner"></div>
        <p>Chargement des ventes...</p>
      </div>

      <div class="ventes-table" *ngIf="!isLoading">
        <table *ngIf="filteredVentes.length > 0">
          <thead>
            <tr>
              <th>Date</th>
              <th>Produit</th>
              <th>Client</th>
              <th>Quantité</th>
              <th>Prix unitaire</th>
              <th>Prix total</th>
              <th>Créé par</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let vente of filteredVentes">
              <td>{{ formatDate(vente.dateVente) }}</td>
              <td class="bold">{{ vente.nomProduit }}</td>
              <td>{{ vente.client }}</td>
              <td>{{ vente.quantite }}</td>
              <td>
                {{ vente.prixUnitaire | number:'1.0-2':'fr-FR' }}
                <span class="currency-badge-small">{{ vente.deviseSymbole || defaultCurrency?.symbole || 'CFA' }}</span>
              </td>
              <td class="bold">
                {{ vente.prixTotal | number:'1.0-2':'fr-FR' }}
                <span class="currency-badge">{{ vente.deviseSymbole || defaultCurrency?.symbole || 'CFA' }}</span>
              </td>
              <td>{{ vente.utilisateur?.prenom || 'N/A' }}</td>
              <td>
                <div class="actions">
                  <button class="btn-icon btn-edit" (click)="editVente(vente)" title="Modifier">✏️</button>
                  <button class="btn-icon btn-delete" (click)="deleteVente(vente)" title="Supprimer">🗑️</button>
                </div>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="5" class="text-right"><strong>Total :</strong></td>
              <td class="bold">
                {{ calculateTotal() | number:'1.0-2':'fr-FR' }}
                <span class="currency-badge">{{ defaultCurrency?.symbole || 'CFA' }}</span>
              </td>
              <td colspan="2"></td>
            </tr>
          </tfoot>
        </table>

        <div class="empty-state" *ngIf="filteredVentes.length === 0">
          <div class="empty-icon">💸</div>
          <h3>Aucune vente trouvée</h3>
          <p *ngIf="searchTerm">Essayez de modifier votre recherche</p>
          <p *ngIf="!searchTerm">Commencez par ajouter votre première vente</p>
          <button class="btn btn-primary" (click)="openForm()" *ngIf="!searchTerm">+ Ajouter une vente</button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../achats/achats.component.scss', './ventes.component.scss']
})
export class VentesComponent implements OnInit {
  ventes: Vente[] = [];
  filteredVentes: Vente[] = [];
  venteForm: FormGroup;
  produitsDisponibles: StockDto[] = [];
  selectedProduct?: StockDto;
  showForm = false;
  isEditing = false;
  isLoading = true;
  isSubmitting = false;
  searchTerm = '';
  currentVenteId?: number;

  // Export
  showExportModal = false;
  exportDateDebut?: string;
  exportDateFin?: string;

  // Devise
  currencies: Currency[] = [];
  selectedCurrency?: Currency;
  defaultCurrency?: Currency;

  constructor(
    private fb: FormBuilder,
    private venteService: VenteService,
    private stockService: StockService,
    private notificationService: NotificationService,
    private currencyService: CurrencyService,
    private confirmService: ConfirmService,
    private exportService: ExportService
  ) {
    this.venteForm = this.fb.group({
      nomProduit: ['', Validators.required],
      client: ['', Validators.required],
      quantite: [1, [Validators.required, Validators.min(1)]],
      prixUnitaire: [0, [Validators.required, Validators.min(0)]],
      dateVente: [new Date().toISOString().split('T')[0], Validators.required],
      prixTotal: [{ value: 0, disabled: true }]
    });
  }

  ngOnInit(): void {
    this.loadCurrencies();
    this.loadVentes();
    this.loadProduitsDisponibles();
  }

  /**
   * Charge les devises et sélectionne la devise par défaut
   */
  loadCurrencies(): void {
    this.currencyService.getAllCurrencies().subscribe({
      next: (currencies) => {
        this.currencies = currencies;
        this.defaultCurrency = currencies.find(c => c.isDefault);
        this.selectedCurrency = this.defaultCurrency;
      },
      error: (error) => {
        console.warn('Impossible de charger les devises, utilisation de CFA par défaut', error);
        // Fallback vers CFA
        this.defaultCurrency = {
          code: 'XOF',
          nom: 'Franc CFA',
          symbole: 'CFA',
          pays: 'Sénégal',
          isDefault: true
        };
        this.selectedCurrency = this.defaultCurrency;
        this.currencies = [this.defaultCurrency];
      }
    });
  }

  loadProduitsDisponibles(): void {
    this.stockService.getProduitsDisponibles().subscribe({
      next: (produits) => {
        this.produitsDisponibles = produits;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des produits:', error);
        this.notificationService.error('Impossible de charger les produits disponibles');
      }
    });
  }

  onProductChange(): void {
    const nomProduit = this.venteForm.get('nomProduit')?.value;
    if (nomProduit) {
      this.selectedProduct = this.produitsDisponibles.find(p => p.nomProduit === nomProduit);

      // Auto-remplir le prix de vente avec le prix moyen de vente du stock
      if (this.selectedProduct && this.selectedProduct.prixMoyenVente > 0) {
        this.venteForm.patchValue({
          prixUnitaire: this.selectedProduct.prixMoyenVente
        });
        this.calculerTotal();
      }
    } else {
      this.selectedProduct = undefined;
    }
  }

  loadVentes(): void {
    this.isLoading = true;
    this.venteService.getAll().subscribe({
      next: (ventes) => {
        this.ventes = ventes.sort((a, b) =>
          new Date(b.dateVente).getTime() - new Date(a.dateVente).getTime()
        );
        this.filteredVentes = [...this.ventes];
        this.isLoading = false;
      },
      error: (error) => {
        this.notificationService.error(error.message);
        this.isLoading = false;
      }
    });
  }

  filterVentes(): void {
    if (!this.searchTerm.trim()) {
      this.filteredVentes = [...this.ventes];
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredVentes = this.ventes.filter(vente =>
      vente.nomProduit.toLowerCase().includes(term) || vente.client.toLowerCase().includes(term)
    );
  }

  openForm(): void {
    this.showForm = true;
    this.isEditing = false;
    this.selectedProduct = undefined;
    this.venteForm.reset({
      nomProduit: '',
      quantite: 1,
      prixUnitaire: 0,
      dateVente: new Date().toISOString().split('T')[0],
      prixTotal: 0
    });
  }

  closeForm(): void {
    this.showForm = false;
    this.isEditing = false;
    this.currentVenteId = undefined;
    this.selectedProduct = undefined;
    this.venteForm.reset();
  }

  closeFormIfOutside(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal')) {
      this.closeForm();
    }
  }

  calculerTotal(): void {
    const quantite = this.venteForm.get('quantite')?.value || 0;
    const prixUnitaire = this.venteForm.get('prixUnitaire')?.value || 0;
    const total = this.venteService.calculerPrixTotal(quantite, prixUnitaire);
    this.venteForm.patchValue({ prixTotal: total });
  }

  onSubmit(): void {
    if (this.venteForm.invalid) {
      Object.keys(this.venteForm.controls).forEach(key => {
        this.venteForm.get(key)?.markAsTouched();
      });
      return;
    }
    this.isSubmitting = true;
    const formValue = this.venteForm.getRawValue();
    const vente: Vente = {
      ...formValue,
      prixTotal: this.venteService.calculerPrixTotal(formValue.quantite, formValue.prixUnitaire),
      deviseId: this.selectedCurrency?.id,
      deviseCode: this.selectedCurrency?.code,
      deviseSymbole: this.selectedCurrency?.symbole
    };
    const operation = this.isEditing && this.currentVenteId
      ? this.venteService.update(this.currentVenteId, vente)
      : this.venteService.create(vente);
    operation.subscribe({
      next: () => {
        this.notificationService.success(
          this.isEditing ? 'Vente modifiée avec succès' : 'Vente ajoutée avec succès'
        );
        this.closeForm();
        this.loadVentes();
        this.isSubmitting = false;
      },
      error: (error) => {
        this.notificationService.error(error.message);
        this.isSubmitting = false;
      }
    });
  }

  editVente(vente: Vente): void {
    this.isEditing = true;
    this.currentVenteId = vente.id;
    this.showForm = true;
    this.venteForm.patchValue(vente);
  }

  async deleteVente(vente: Vente): Promise<void> {
    if (!vente.id) return;

    const confirmed = await this.confirmService.confirm({
      title: 'Supprimer la vente',
      message: `Êtes-vous sûr de vouloir supprimer la vente "${vente.nomProduit}" ?`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      type: 'danger'
    });

    if (!confirmed) {
      return;
    }

    this.venteService.delete(vente.id).subscribe({
      next: () => {
        this.notificationService.success('Vente supprimée avec succès');
        this.loadVentes();
      },
      error: (error) => {
        this.notificationService.error(error.message);
      }
    });
  }

  calculateTotal(): number {
    return this.filteredVentes.reduce((sum, vente) => sum + vente.prixTotal, 0);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR');
  }

  openExportModal(): void {
    this.showExportModal = true;
    this.exportDateDebut = undefined;
    this.exportDateFin = undefined;
  }

  closeExportModal(): void {
    this.showExportModal = false;
  }

  exportToExcel(): void {
    // Filtrer les ventes par dates si spécifiées
    let dataToExport = [...this.filteredVentes];

    if (this.exportDateDebut) {
      const dateDebut = new Date(this.exportDateDebut);
      dataToExport = dataToExport.filter(v => {
        const dateVente = new Date(v.dateVente);
        return dateVente >= dateDebut;
      });
    }

    if (this.exportDateFin) {
      const dateFin = new Date(this.exportDateFin);
      dateFin.setHours(23, 59, 59, 999); // Inclure toute la journée
      dataToExport = dataToExport.filter(v => {
        const dateVente = new Date(v.dateVente);
        return dateVente <= dateFin;
      });
    }

    // Vérifier qu'il y a des données à exporter
    if (dataToExport.length === 0) {
      this.notificationService.error('Aucune donnée à exporter pour cette période');
      return;
    }

    // Créer le nom de fichier avec les dates si applicable
    let filename = 'ventes';
    if (this.exportDateDebut && this.exportDateFin) {
      filename += `_${this.exportDateDebut}_au_${this.exportDateFin}`;
    } else if (this.exportDateDebut) {
      filename += `_depuis_${this.exportDateDebut}`;
    } else if (this.exportDateFin) {
      filename += `_jusqu_au_${this.exportDateFin}`;
    } else {
      filename += `_${new Date().toISOString().split('T')[0]}`;
    }

    const columns = [
      { header: 'Date', field: 'dateVente', format: (val: string) => this.formatDate(val) },
      { header: 'Produit', field: 'nomProduit' },
      { header: 'Client', field: 'client' },
      { header: 'Quantité', field: 'quantite' },
      {
        header: `Prix Unitaire (${this.selectedCurrency?.symbole || 'CFA'})`,
        field: 'prixUnitaire',
        format: (val: number) => val.toFixed(2)
      },
      {
        header: `Prix Total (${this.selectedCurrency?.symbole || 'CFA'})`,
        field: 'prixTotal',
        format: (val: number) => val.toFixed(2)
      }
    ];

    const exportOptions = {
      filename,
      title: 'Liste des Ventes',
      columns,
      data: dataToExport,
      dateRange: {
        dateDebut: this.exportDateDebut,
        dateFin: this.exportDateFin
      },
      companyInfo: {
        nom: 'Boutique Dija Saliou',
        proprietaire: 'Saliou Dija',
        telephone: '+221 XX XXX XX XX',
        adresse: 'Dakar, Sénégal'
      }
    };

    this.exportService.exportToExcel(exportOptions);
    this.notificationService.success(`${dataToExport.length} vente(s) exportée(s) avec succès en Excel`);
    this.closeExportModal();
  }

  /**
   * Export vers PDF avec filtrage par dates
   */
  exportToPDF(): void {
    // Filtrer les ventes par dates si spécifiées
    let dataToExport = [...this.filteredVentes];

    if (this.exportDateDebut) {
      const dateDebut = new Date(this.exportDateDebut);
      dataToExport = dataToExport.filter(v => {
        const dateVente = new Date(v.dateVente);
        return dateVente >= dateDebut;
      });
    }

    if (this.exportDateFin) {
      const dateFin = new Date(this.exportDateFin);
      dateFin.setHours(23, 59, 59, 999); // Inclure toute la journée
      dataToExport = dataToExport.filter(v => {
        const dateVente = new Date(v.dateVente);
        return dateVente <= dateFin;
      });
    }

    // Vérifier qu'il y a des données à exporter
    if (dataToExport.length === 0) {
      this.notificationService.error('Aucune donnée à exporter pour cette période');
      return;
    }

    // Créer le nom de fichier avec les dates si applicable
    let filename = 'ventes';
    if (this.exportDateDebut && this.exportDateFin) {
      filename += `_${this.exportDateDebut}_au_${this.exportDateFin}`;
    } else if (this.exportDateDebut) {
      filename += `_depuis_${this.exportDateDebut}`;
    } else if (this.exportDateFin) {
      filename += `_jusqu_au_${this.exportDateFin}`;
    } else {
      filename += `_${new Date().toISOString().split('T')[0]}`;
    }

    const columns = [
      { header: 'Date', field: 'dateVente', format: (val: string) => this.formatDate(val) },
      { header: 'Produit', field: 'nomProduit' },
      { header: 'Client', field: 'client' },
      { header: 'Quantité', field: 'quantite' },
      {
        header: `Prix Unit. (${this.selectedCurrency?.symbole || 'CFA'})`,
        field: 'prixUnitaire',
        format: (val: number) => val.toFixed(2)
      },
      {
        header: `Prix Total (${this.selectedCurrency?.symbole || 'CFA'})`,
        field: 'prixTotal',
        format: (val: number) => val.toFixed(2)
      }
    ];

    const exportOptions = {
      filename,
      title: 'Liste des Ventes',
      columns,
      data: dataToExport,
      dateRange: {
        dateDebut: this.exportDateDebut,
        dateFin: this.exportDateFin
      },
      companyInfo: {
        nom: 'Boutique Dija Saliou',
        proprietaire: 'Saliou Dija',
        telephone: '+221 XX XXX XX XX',
        adresse: 'Dakar, Sénégal'
      }
    };

    this.exportService.exportToPDF(exportOptions);
    this.notificationService.success(`${dataToExport.length} vente(s) exportée(s) avec succès en PDF`);
    this.closeExportModal();
  }
}
