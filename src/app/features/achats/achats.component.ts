import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Achat } from '../../core/models/achat.model';
import { AchatService } from '../../core/services/achat.service';
import { NotificationService } from '../../core/services/notification.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { StockService } from '../../core/services/stock.service';
import { StockDto } from '../../core/models/stock.model';
import { CurrencyService } from '../../core/services/currency.service';
import { Currency } from '../../core/models/currency.model';
import { CurrencyEurPipe } from '../../shared/pipes/currency-eur.pipe';

/**
 * Composant de gestion des achats de stock
 */
@Component({
  selector: 'app-achats',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, CurrencyEurPipe],
  template: `
    <div class="achats">
      <div class="page-header">
        <h1>🛒 Gestion des Achats</h1>
        <button class="btn btn-primary" (click)="openForm()">
          + Nouvel achat
        </button>
      </div>

      <!-- Formulaire -->
      <div class="modal" *ngIf="showForm" (click)="closeFormIfOutside($event)">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ isEditing ? 'Modifier' : 'Ajouter' }} un achat</h2>
            <button class="close-btn" (click)="closeForm()">×</button>
          </div>
          <form [formGroup]="achatForm" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <div class="form-group">
                <label>Nom du produit *</label>
                <select formControlName="nomProduit" (change)="onProductChange()">
                  <option value="">-- Sélectionner un produit --</option>
                  <option *ngFor="let produit of produitsExistants" [value]="produit.nomProduit">
                    {{ produit.nomProduit }} (Stock actuel: {{ produit.stockDisponible }})
                  </option>
                  <option value="__NOUVEAU__">➕ Nouveau produit...</option>
                </select>
                <input
                  *ngIf="showNewProductInput"
                  type="text"
                  formControlName="nouveauProduit"
                  placeholder="Nom du nouveau produit"
                  class="mt-2"
                  (input)="onNewProductInput()"
                />
                <div class="error" *ngIf="achatForm.get('nomProduit')?.invalid && achatForm.get('nomProduit')?.touched">
                  {{ showNewProductInput ? 'Veuillez saisir le nom du produit' : 'Veuillez sélectionner un produit' }}
                </div>
                <div class="info-stock" *ngIf="selectedProduct">
                  <small>
                    📦 Stock actuel: {{ selectedProduct.stockDisponible }} unités |
                    💰 Prix d'achat moyen: {{ selectedProduct.prixMoyenAchat | currencyEur }}
                  </small>
                </div>
              </div>
              <div class="form-group">
                <label>Fournisseur *</label>
                <input type="text" formControlName="fournisseur" placeholder="Ex: Fournisseur Paris" />
                <div class="error" *ngIf="achatForm.get('fournisseur')?.invalid && achatForm.get('fournisseur')?.touched">
                  Le fournisseur est requis
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Quantité *</label>
                <input type="number" formControlName="quantite" min="1" (input)="calculerTotal()" />
                <div class="error" *ngIf="achatForm.get('quantite')?.invalid && achatForm.get('quantite')?.touched">
                  La quantité doit être au moins 1
                </div>
              </div>
              <div class="form-group">
                <label>Prix unitaire ({{ selectedCurrency?.symbole || 'CFA' }}) *</label>
                <input type="number" formControlName="prixUnitaire" min="0" step="0.01" (input)="calculerTotal()" />
                <div class="error" *ngIf="achatForm.get('prixUnitaire')?.invalid && achatForm.get('prixUnitaire')?.touched">
                  Le prix unitaire doit être positif
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Date d'achat *</label>
                <input type="date" formControlName="dateAchat" />
                <div class="error" *ngIf="achatForm.get('dateAchat')?.invalid && achatForm.get('dateAchat')?.touched">
                  La date est requise
                </div>
              </div>
              <div class="form-group">
                <label>Prix total ({{ selectedCurrency?.symbole || 'CFA' }})</label>
                <input type="number" formControlName="prixTotal" readonly class="readonly" />
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-secondary" (click)="closeForm()">
                Annuler
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="achatForm.invalid || isSubmitting">
                {{ isSubmitting ? 'Enregistrement...' : (isEditing ? 'Modifier' : 'Ajouter') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Recherche et filtres -->
      <div class="filters">
        <input
          type="text"
          placeholder="🔍 Rechercher par nom de produit ou fournisseur..."
          [(ngModel)]="searchTerm"
          (input)="filterAchats()"
          [ngModelOptions]="{standalone: true}"
        />
      </div>

      <!-- Liste des achats -->
      <div class="loading" *ngIf="isLoading">
        <div class="spinner"></div>
        <p>Chargement des achats...</p>
      </div>

      <div class="achats-table" *ngIf="!isLoading">
        <table *ngIf="filteredAchats.length > 0">
          <thead>
            <tr>
              <th>Date</th>
              <th>Produit</th>
              <th>Fournisseur</th>
              <th>Quantité</th>
              <th>Prix unitaire</th>
              <th>Prix total</th>
              <th>Créé par</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let achat of filteredAchats">
              <td>{{ formatDate(achat.dateAchat) }}</td>
              <td class="bold">{{ achat.nomProduit }}</td>
              <td>{{ achat.fournisseur }}</td>
              <td>{{ achat.quantite }}</td>
              <td>
                {{ achat.prixUnitaire | number:'1.0-2':'fr-FR' }}
                <span class="currency-badge-small">{{ achat.deviseSymbole || defaultCurrency?.symbole || 'CFA' }}</span>
              </td>
              <td class="bold">
                {{ achat.prixTotal | number:'1.0-2':'fr-FR' }}
                <span class="currency-badge-small">{{ achat.deviseSymbole || defaultCurrency?.symbole || 'CFA' }}</span>
              </td>
              <td>{{ achat.utilisateur?.prenom || 'N/A' }}</td>
              <td>
                <div class="actions">
                  <button class="btn-icon btn-edit" (click)="editAchat(achat)" title="Modifier">
                    ✏️
                  </button>
                  <button class="btn-icon btn-delete" (click)="deleteAchat(achat)" title="Supprimer">
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="5" class="text-right"><strong>Total ({{ defaultCurrency?.symbole || 'CFA' }}) :</strong></td>
              <td class="bold" colspan="2">
                {{ calculateTotal() | number:'1.0-2':'fr-FR' }}
                <span class="currency-badge-small">{{ defaultCurrency?.symbole || 'CFA' }}</span>
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>

        <div class="empty-state" *ngIf="filteredAchats.length === 0">
          <div class="empty-icon">📦</div>
          <h3>Aucun achat trouvé</h3>
          <p *ngIf="searchTerm">Essayez de modifier votre recherche</p>
          <p *ngIf="!searchTerm">Commencez par ajouter votre premier achat</p>
          <button class="btn btn-primary" (click)="openForm()" *ngIf="!searchTerm">
            + Ajouter un achat
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./achats.component.scss']
})
export class AchatsComponent implements OnInit {
  achats: Achat[] = [];
  filteredAchats: Achat[] = [];
  achatForm: FormGroup;
  produitsExistants: StockDto[] = [];
  selectedProduct?: StockDto;
  showNewProductInput = false;
  showForm = false;
  isEditing = false;
  isLoading = true;
  isSubmitting = false;
  searchTerm = '';
  currentAchatId?: number;

  // Devises
  currencies: Currency[] = [];
  selectedCurrency?: Currency;
  defaultCurrency?: Currency;

  constructor(
    private fb: FormBuilder,
    private achatService: AchatService,
    private stockService: StockService,
    private currencyService: CurrencyService,
    private notificationService: NotificationService,
    private confirmService: ConfirmService
  ) {
    this.achatForm = this.fb.group({
      nomProduit: ['', Validators.required],
      nouveauProduit: [''],
      fournisseur: ['', Validators.required],
      quantite: [1, [Validators.required, Validators.min(1)]],
      prixUnitaire: [0, [Validators.required, Validators.min(0)]],
      dateAchat: [new Date().toISOString().split('T')[0], Validators.required],
      prixTotal: [{ value: 0, disabled: true }]
    });
  }

  ngOnInit(): void {
    this.loadAchats();
    this.loadProduitsExistants();
    this.loadCurrencies();
  }

  loadCurrencies(): void {
    this.currencyService.getAllCurrencies().subscribe({
      next: (currencies) => {
        this.currencies = currencies;
        this.defaultCurrency = currencies.find(c => c.isDefault);
        this.selectedCurrency = this.defaultCurrency;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des devises:', error);
        // Devise par défaut en cas d'erreur
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

  loadProduitsExistants(): void {
    this.stockService.getAllStocks().subscribe({
      next: (produits) => {
        this.produitsExistants = produits;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des produits:', error);
      }
    });
  }

  onProductChange(): void {
    const nomProduit = this.achatForm.get('nomProduit')?.value;

    if (nomProduit === '__NOUVEAU__') {
      this.showNewProductInput = true;
      this.selectedProduct = undefined;
      this.achatForm.get('nouveauProduit')?.setValidators([Validators.required]);
      this.achatForm.get('nouveauProduit')?.updateValueAndValidity();
    } else {
      this.showNewProductInput = false;
      this.achatForm.get('nouveauProduit')?.clearValidators();
      this.achatForm.get('nouveauProduit')?.updateValueAndValidity();

      if (nomProduit) {
        this.selectedProduct = this.produitsExistants.find(p => p.nomProduit === nomProduit);

        // Auto-remplir le prix d'achat avec le prix moyen d'achat du stock
        if (this.selectedProduct && this.selectedProduct.prixMoyenAchat > 0) {
          this.achatForm.patchValue({
            prixUnitaire: this.selectedProduct.prixMoyenAchat
          });
          this.calculerTotal();
        }
      } else {
        this.selectedProduct = undefined;
      }
    }
  }

  onNewProductInput(): void {
    const nouveauProduit = this.achatForm.get('nouveauProduit')?.value;
    if (nouveauProduit && nouveauProduit.trim()) {
      // Le nom du nouveau produit sera utilisé lors de la soumission
      this.achatForm.get('nomProduit')?.setErrors(null);
    }
  }

  loadAchats(): void {
    this.isLoading = true;
    this.achatService.getAll().subscribe({
      next: (achats) => {
        this.achats = achats.sort((a, b) =>
          new Date(b.dateAchat).getTime() - new Date(a.dateAchat).getTime()
        );
        this.filteredAchats = [...this.achats];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des achats:', error);
        this.notificationService.error(error.message);
        this.isLoading = false;
      }
    });
  }

  filterAchats(): void {
    if (!this.searchTerm.trim()) {
      this.filteredAchats = [...this.achats];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredAchats = this.achats.filter(achat =>
      achat.nomProduit.toLowerCase().includes(term) ||
      achat.fournisseur.toLowerCase().includes(term)
    );
  }

  openForm(): void {
    this.showForm = true;
    this.isEditing = false;
    this.showNewProductInput = false;
    this.selectedProduct = undefined;
    this.achatForm.reset({
      nomProduit: '',
      nouveauProduit: '',
      quantite: 1,
      prixUnitaire: 0,
      dateAchat: new Date().toISOString().split('T')[0],
      prixTotal: 0
    });
  }

  closeForm(): void {
    this.showForm = false;
    this.isEditing = false;
    this.currentAchatId = undefined;
    this.showNewProductInput = false;
    this.selectedProduct = undefined;
    this.achatForm.reset();
  }

  closeFormIfOutside(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal')) {
      this.closeForm();
    }
  }

  calculerTotal(): void {
    const quantite = this.achatForm.get('quantite')?.value || 0;
    const prixUnitaire = this.achatForm.get('prixUnitaire')?.value || 0;
    const total = this.achatService.calculerPrixTotal(quantite, prixUnitaire);
    this.achatForm.patchValue({ prixTotal: total });
  }

  onSubmit(): void {
    if (this.achatForm.invalid) {
      Object.keys(this.achatForm.controls).forEach(key => {
        this.achatForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    const formValue = this.achatForm.getRawValue();

    // Gérer le cas du nouveau produit
    let nomProduitFinal = formValue.nomProduit;
    if (formValue.nomProduit === '__NOUVEAU__' && formValue.nouveauProduit) {
      nomProduitFinal = formValue.nouveauProduit.trim();
    }

    const achat: Achat = {
      nomProduit: nomProduitFinal,
      fournisseur: formValue.fournisseur,
      quantite: formValue.quantite,
      prixUnitaire: formValue.prixUnitaire,
      dateAchat: formValue.dateAchat,
      prixTotal: this.achatService.calculerPrixTotal(formValue.quantite, formValue.prixUnitaire),
      deviseId: this.selectedCurrency?.id,
      deviseCode: this.selectedCurrency?.code,
      deviseSymbole: this.selectedCurrency?.symbole
    };

    const operation = this.isEditing && this.currentAchatId
      ? this.achatService.update(this.currentAchatId, achat)
      : this.achatService.create(achat);

    operation.subscribe({
      next: () => {
        this.notificationService.success(
          this.isEditing ? 'Achat modifié avec succès' : 'Achat ajouté avec succès'
        );
        this.closeForm();
        this.loadAchats();
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Erreur lors de l\'enregistrement:', error);
        this.notificationService.error(error.message);
        this.isSubmitting = false;
      }
    });
  }

  editAchat(achat: Achat): void {
    this.isEditing = true;
    this.currentAchatId = achat.id;
    this.showForm = true;
    this.achatForm.patchValue(achat);
  }

  async deleteAchat(achat: Achat): Promise<void> {
    if (!achat.id) return;

    const confirmed = await this.confirmService.confirm({
      title: 'Supprimer l\'achat',
      message: `Êtes-vous sûr de vouloir supprimer l'achat "${achat.nomProduit}" ?`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      type: 'danger'
    });

    if (!confirmed) {
      return;
    }

    this.achatService.delete(achat.id).subscribe({
      next: () => {
        this.notificationService.success('Achat supprimé avec succès');
        this.loadAchats();
      },
      error: (error) => {
        console.error('Erreur lors de la suppression:', error);
        this.notificationService.error(error.message);
      }
    });
  }

  calculateTotal(): number {
    return this.filteredAchats.reduce((sum, achat) => sum + achat.prixTotal, 0);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR');
  }
}
