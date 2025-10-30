import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Depense, CategorieDepense } from '../../core/models/depense.model';
import { DepenseService } from '../../core/services/depense.service';
import { NotificationService } from '../../core/services/notification.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { CurrencyEurPipe } from '../../shared/pipes/currency-eur.pipe';
import { CurrencyService } from '../../core/services/currency.service';
import { Currency } from '../../core/models/currency.model';

@Component({
  selector: 'app-depenses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, CurrencyEurPipe],
  template: `
    <div class="depenses">
      <div class="page-header">
        <h1>💳 Gestion des Dépenses</h1>
        <button class="btn btn-primary" (click)="openForm()">+ Nouvelle dépense</button>
      </div>

      <div class="modal" *ngIf="showForm" (click)="closeFormIfOutside($event)">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ isEditing ? 'Modifier' : 'Ajouter' }} une dépense</h2>
            <button class="close-btn" (click)="closeForm()">×</button>
          </div>
          <form [formGroup]="depenseForm" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <div class="form-group">
                <label>Libellé *</label>
                <input type="text" formControlName="libelle" placeholder="Ex: Loyer local commercial" />
              </div>
              <div class="form-group">
                <label>Catégorie *</label>
                <select formControlName="categorie">
                  <option *ngFor="let cat of categories" [value]="cat">{{ getCategorieLabel(cat) }}</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Montant ({{ selectedCurrency?.symbole || 'CFA' }}) *</label>
                <input type="number" formControlName="montant" min="0" step="0.01" />
              </div>
              <div class="form-group">
                <label>Date *</label>
                <input type="date" formControlName="dateDepense" />
              </div>
            </div>
            <div class="form-group">
              <label>
                <input type="checkbox" formControlName="estRecurrente" />
                Dépense récurrente
              </label>
            </div>
            <div class="form-group">
              <label>Notes</label>
              <textarea formControlName="notes" rows="3" placeholder="Notes optionnelles..."></textarea>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" (click)="closeForm()">Annuler</button>
              <button type="submit" class="btn btn-primary" [disabled]="depenseForm.invalid || isSubmitting">
                {{ isSubmitting ? 'Enregistrement...' : (isEditing ? 'Modifier' : 'Ajouter') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div class="filters">
        <input type="text" placeholder="🔍 Rechercher..." [(ngModel)]="searchTerm"
          (input)="filterDepenses()" [ngModelOptions]="{standalone: true}" />
        <select [(ngModel)]="selectedCategorie" (change)="filterDepenses()" [ngModelOptions]="{standalone: true}">
          <option value="">Toutes les catégories</option>
          <option *ngFor="let cat of categories" [value]="cat">{{ getCategorieLabel(cat) }}</option>
        </select>
      </div>

      <div class="loading" *ngIf="isLoading">
        <div class="spinner"></div>
        <p>Chargement des dépenses...</p>
      </div>

      <div class="depenses-table" *ngIf="!isLoading">
        <table *ngIf="filteredDepenses.length > 0">
          <thead>
            <tr>
              <th>Date</th>
              <th>Libellé</th>
              <th>Catégorie</th>
              <th>Montant</th>
              <th>Récurrente</th>
              <th>Créé par</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let depense of filteredDepenses">
              <td>{{ formatDate(depense.dateDepense) }}</td>
              <td class="bold">{{ depense.libelle }}</td>
              <td><span class="badge">{{ getCategorieLabel(depense.categorie) }}</span></td>
              <td class="bold">
                {{ depense.montant | number:'1.0-2':'fr-FR' }}
                <span class="currency-badge">{{ depense.deviseSymbole || defaultCurrency?.symbole || 'CFA' }}</span>
              </td>
              <td>
                <span class="badge-recurring" *ngIf="depense.estRecurrente">🔁 Oui</span>
                <span *ngIf="!depense.estRecurrente">-</span>
              </td>
              <td>{{ depense.utilisateur?.prenom || 'N/A' }}</td>
              <td>
                <div class="actions">
                  <button class="btn-icon btn-edit" (click)="editDepense(depense)" title="Modifier">✏️</button>
                  <button class="btn-icon btn-delete" (click)="deleteDepense(depense)" title="Supprimer">🗑️</button>
                </div>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="3" class="text-right"><strong>Total :</strong></td>
              <td class="bold">
                {{ calculateTotal() | number:'1.0-2':'fr-FR' }}
                <span class="currency-badge">{{ defaultCurrency?.symbole || 'CFA' }}</span>
              </td>
              <td colspan="3"></td>
            </tr>
          </tfoot>
        </table>

        <div class="empty-state" *ngIf="filteredDepenses.length === 0">
          <div class="empty-icon">💸</div>
          <h3>Aucune dépense trouvée</h3>
          <button class="btn btn-primary" (click)="openForm()">+ Ajouter une dépense</button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../achats/achats.component.scss', './depenses.component.scss']
})
export class DepensesComponent implements OnInit {
  depenses: Depense[] = [];
  filteredDepenses: Depense[] = [];
  depenseForm: FormGroup;
  categories: CategorieDepense[] = [];
  showForm = false;
  isEditing = false;
  isLoading = true;
  isSubmitting = false;
  searchTerm = '';
  selectedCategorie = '';
  currentDepenseId?: number;

  // Devise
  currencies: Currency[] = [];
  selectedCurrency?: Currency;
  defaultCurrency?: Currency;

  constructor(
    private fb: FormBuilder,
    private depenseService: DepenseService,
    private notificationService: NotificationService,
    private currencyService: CurrencyService,
    private confirmService: ConfirmService
  ) {
    this.categories = this.depenseService.getCategories();
    this.depenseForm = this.fb.group({
      libelle: ['', Validators.required],
      montant: [0, [Validators.required, Validators.min(0)]],
      dateDepense: [new Date().toISOString().split('T')[0], Validators.required],
      categorie: [CategorieDepense.AUTRE, Validators.required],
      estRecurrente: [false],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadCurrencies();
    this.loadDepenses();
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

  loadDepenses(): void {
    this.isLoading = true;
    this.depenseService.getAll().subscribe({
      next: (depenses) => {
        this.depenses = depenses.sort((a, b) =>
          new Date(b.dateDepense).getTime() - new Date(a.dateDepense).getTime()
        );
        this.filteredDepenses = [...this.depenses];
        this.isLoading = false;
      },
      error: (error) => {
        this.notificationService.error(error.message);
        this.isLoading = false;
      }
    });
  }

  filterDepenses(): void {
    let result = [...this.depenses];
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(d => d.libelle.toLowerCase().includes(term));
    }
    if (this.selectedCategorie) {
      result = result.filter(d => d.categorie === this.selectedCategorie);
    }
    this.filteredDepenses = result;
  }

  openForm(): void {
    this.showForm = true;
    this.isEditing = false;
    this.depenseForm.reset({
      montant: 0,
      dateDepense: new Date().toISOString().split('T')[0],
      categorie: CategorieDepense.AUTRE,
      estRecurrente: false,
      notes: ''
    });
  }

  closeForm(): void {
    this.showForm = false;
    this.isEditing = false;
    this.currentDepenseId = undefined;
    this.depenseForm.reset();
  }

  closeFormIfOutside(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal')) {
      this.closeForm();
    }
  }

  onSubmit(): void {
    if (this.depenseForm.invalid) {
      Object.keys(this.depenseForm.controls).forEach(key => {
        this.depenseForm.get(key)?.markAsTouched();
      });
      return;
    }
    this.isSubmitting = true;
    const depense: Depense = {
      ...this.depenseForm.getRawValue(),
      deviseId: this.selectedCurrency?.id,
      deviseCode: this.selectedCurrency?.code,
      deviseSymbole: this.selectedCurrency?.symbole
    };
    const operation = this.isEditing && this.currentDepenseId
      ? this.depenseService.update(this.currentDepenseId, depense)
      : this.depenseService.create(depense);
    operation.subscribe({
      next: () => {
        this.notificationService.success(
          this.isEditing ? 'Dépense modifiée avec succès' : 'Dépense ajoutée avec succès'
        );
        this.closeForm();
        this.loadDepenses();
        this.isSubmitting = false;
      },
      error: (error) => {
        this.notificationService.error(error.message);
        this.isSubmitting = false;
      }
    });
  }

  editDepense(depense: Depense): void {
    this.isEditing = true;
    this.currentDepenseId = depense.id;
    this.showForm = true;
    this.depenseForm.patchValue(depense);
  }

  async deleteDepense(depense: Depense): Promise<void> {
    if (!depense.id) return;

    const confirmed = await this.confirmService.confirm({
      title: 'Supprimer la dépense',
      message: `Êtes-vous sûr de vouloir supprimer "${depense.libelle}" ?`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      type: 'danger'
    });

    if (!confirmed) {
      return;
    }

    this.depenseService.delete(depense.id).subscribe({
      next: () => {
        this.notificationService.success('Dépense supprimée avec succès');
        this.loadDepenses();
      },
      error: (error) => {
        this.notificationService.error(error.message);
      }
    });
  }

  calculateTotal(): number {
    return this.filteredDepenses.reduce((sum, depense) => sum + depense.montant, 0);
  }

  getCategorieLabel(categorie: CategorieDepense): string {
    return this.depenseService.getCategorieLabel(categorie);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR');
  }
}
