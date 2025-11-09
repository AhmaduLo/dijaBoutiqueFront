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
import { ExportService } from '../../core/services/export.service';
import { TenantService } from '../../core/services/tenant.service';
import { AuthService } from '../../core/services/auth.service';
import { Tenant } from '../../core/models/tenant.model';

@Component({
  selector: 'app-depenses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, CurrencyEurPipe],
  template: `
    <div class="depenses">
      <div class="page-header">
        <h1>💳 Gestion des Dépenses</h1>
        <div style="display: flex; gap: 1rem;">
          <button class="btn btn-primary" (click)="refreshData()">
            🔄 Actualiser
          </button>
          <button class="btn btn-success" (click)="openExportModal()">
            📊 Exporter
          </button>
          <button class="btn btn-primary" (click)="openForm()">
            + Nouvelle dépense
          </button>
        </div>
      </div>

      <!-- Modal d'export -->
      <div class="modal" *ngIf="showExportModal" (click)="closeExportModal()">
        <div class="modal-content" style="max-width: 500px;" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>📊 Exporter les dépenses</h2>
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
                <em>Laissez vide pour exporter toutes les dépenses</em>
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
    private depenseService: DepenseService,
    private notificationService: NotificationService,
    private currencyService: CurrencyService,
    private confirmService: ConfirmService,
    private exportService: ExportService,
    private tenantService: TenantService,
    private authService: AuthService
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

  refreshData(): void {
    this.notificationService.info('Actualisation en cours...');
    this.loadDepenses();
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

  openExportModal(): void {
    this.showExportModal = true;
    this.exportDateDebut = undefined;
    this.exportDateFin = undefined;
  }

  closeExportModal(): void {
    this.showExportModal = false;
  }

  exportToExcel(): void {
    // Filtrer les dépenses par dates si spécifiées
    let dataToExport = [...this.filteredDepenses];

    if (this.exportDateDebut) {
      const dateDebut = new Date(this.exportDateDebut);
      dataToExport = dataToExport.filter(d => {
        const dateDepense = new Date(d.dateDepense);
        return dateDepense >= dateDebut;
      });
    }

    if (this.exportDateFin) {
      const dateFin = new Date(this.exportDateFin);
      dateFin.setHours(23, 59, 59, 999); // Inclure toute la journée
      dataToExport = dataToExport.filter(d => {
        const dateDepense = new Date(d.dateDepense);
        return dateDepense <= dateFin;
      });
    }

    // Vérifier qu'il y a des données à exporter
    if (dataToExport.length === 0) {
      this.notificationService.error('Aucune donnée à exporter pour cette période');
      return;
    }

    // Récupérer les informations de l'entreprise
    this.tenantService.getTenantInfo().subscribe({
      next: (tenant: Tenant) => {
        const currentUser = this.authService.getCurrentUser();

        // Créer le nom de fichier avec les dates si applicable
        let filename = 'depenses';
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
          { header: 'Date', field: 'dateDepense', format: (val: string) => this.formatDate(val) },
          { header: 'Libellé', field: 'libelle' },
          { header: 'Catégorie', field: 'categorie', format: (val: CategorieDepense) => this.getCategorieLabel(val) },
          {
            header: `Montant (${this.selectedCurrency?.symbole || 'CFA'})`,
            field: 'montant',
            format: (val: number) => val.toFixed(2)
          },
          { header: 'Description', field: 'description' }
        ];

        const exportOptions = {
          filename,
          title: 'Liste des Dépenses',
          columns,
          data: dataToExport,
          dateRange: {
            dateDebut: this.exportDateDebut,
            dateFin: this.exportDateFin
          },
          companyInfo: {
            nom: tenant.nomEntreprise || currentUser?.nomEntreprise || 'HeasyStock',
            proprietaire: tenant.prenomProprietaire && tenant.nomProprietaire
              ? `${tenant.prenomProprietaire} ${tenant.nomProprietaire}`
              : '',
            telephone: tenant.numeroTelephone || currentUser?.numeroTelephone || 'N/A',
            adresse: tenant.adresse || '',
            email: tenant.emailProprietaire || currentUser?.email || '',
            nineaSiret: tenant.nineaSiret || ''
          }
        };

        this.exportService.exportToExcel(exportOptions);
        this.notificationService.success(`${dataToExport.length} dépense(s) exportée(s) avec succès en Excel`);
        this.closeExportModal();
      },
      error: (error) => {
        console.error('Erreur lors de la récupération du tenant:', error);
        // En cas d'erreur, exporter quand même sans les infos de l'entreprise
        const currentUser = this.authService.getCurrentUser();

        let filename = 'depenses';
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
          { header: 'Date', field: 'dateDepense', format: (val: string) => this.formatDate(val) },
          { header: 'Libellé', field: 'libelle' },
          { header: 'Catégorie', field: 'categorie', format: (val: CategorieDepense) => this.getCategorieLabel(val) },
          {
            header: `Montant (${this.selectedCurrency?.symbole || 'CFA'})`,
            field: 'montant',
            format: (val: number) => val.toFixed(2)
          },
          { header: 'Description', field: 'description' }
        ];

        const exportOptions = {
          filename,
          title: 'Liste des Dépenses',
          columns,
          data: dataToExport,
          dateRange: {
            dateDebut: this.exportDateDebut,
            dateFin: this.exportDateFin
          },
          companyInfo: {
            nom: currentUser?.nomEntreprise || 'HeasyStock',
            proprietaire: '',
            telephone: currentUser?.numeroTelephone || 'N/A',
            adresse: '',
            email: currentUser?.email || ''
          }
        };

        this.exportService.exportToExcel(exportOptions);
        this.notificationService.success(`${dataToExport.length} dépense(s) exportée(s) avec succès en Excel`);
        this.closeExportModal();
      }
    });
  }

  /**
   * Export vers PDF avec filtrage par dates
   */
  exportToPDF(): void {
    // Filtrer les dépenses par dates si spécifiées
    let dataToExport = [...this.filteredDepenses];

    if (this.exportDateDebut) {
      const dateDebut = new Date(this.exportDateDebut);
      dataToExport = dataToExport.filter(d => {
        const dateDepense = new Date(d.dateDepense);
        return dateDepense >= dateDebut;
      });
    }

    if (this.exportDateFin) {
      const dateFin = new Date(this.exportDateFin);
      dateFin.setHours(23, 59, 59, 999); // Inclure toute la journée
      dataToExport = dataToExport.filter(d => {
        const dateDepense = new Date(d.dateDepense);
        return dateDepense <= dateFin;
      });
    }

    // Vérifier qu'il y a des données à exporter
    if (dataToExport.length === 0) {
      this.notificationService.error('Aucune donnée à exporter pour cette période');
      return;
    }

    // Récupérer les informations de l'entreprise
    this.tenantService.getTenantInfo().subscribe({
      next: (tenant: Tenant) => {
        const currentUser = this.authService.getCurrentUser();

        // Créer le nom de fichier avec les dates si applicable
        let filename = 'depenses';
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
          { header: 'Date', field: 'dateDepense', format: (val: string) => this.formatDate(val) },
          { header: 'Libellé', field: 'libelle' },
          { header: 'Catégorie', field: 'categorie', format: (val: CategorieDepense) => this.getCategorieLabel(val) },
          {
            header: `Montant (${this.selectedCurrency?.symbole || 'CFA'})`,
            field: 'montant',
            format: (val: number) => val.toFixed(2)
          },
          { header: 'Description', field: 'description' }
        ];

        const exportOptions = {
          filename,
          title: 'Liste des Dépenses',
          columns,
          data: dataToExport,
          dateRange: {
            dateDebut: this.exportDateDebut,
            dateFin: this.exportDateFin
          },
          companyInfo: {
            nom: tenant.nomEntreprise || currentUser?.nomEntreprise || 'HeasyStock',
            proprietaire: tenant.prenomProprietaire && tenant.nomProprietaire
              ? `${tenant.prenomProprietaire} ${tenant.nomProprietaire}`
              : '',
            telephone: tenant.numeroTelephone || currentUser?.numeroTelephone || 'N/A',
            adresse: tenant.adresse || '',
            email: tenant.emailProprietaire || currentUser?.email || '',
            nineaSiret: tenant.nineaSiret || ''
          }
        };

        this.exportService.exportToPDF(exportOptions);
        this.notificationService.success(`${dataToExport.length} dépense(s) exportée(s) avec succès en PDF`);
        this.closeExportModal();
      },
      error: (error) => {
        console.error('Erreur lors de la récupération du tenant:', error);
        // En cas d'erreur, exporter quand même sans les infos de l'entreprise
        const currentUser = this.authService.getCurrentUser();

        let filename = 'depenses';
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
          { header: 'Date', field: 'dateDepense', format: (val: string) => this.formatDate(val) },
          { header: 'Libellé', field: 'libelle' },
          { header: 'Catégorie', field: 'categorie', format: (val: CategorieDepense) => this.getCategorieLabel(val) },
          {
            header: `Montant (${this.selectedCurrency?.symbole || 'CFA'})`,
            field: 'montant',
            format: (val: number) => val.toFixed(2)
          },
          { header: 'Description', field: 'description' }
        ];

        const exportOptions = {
          filename,
          title: 'Liste des Dépenses',
          columns,
          data: dataToExport,
          dateRange: {
            dateDebut: this.exportDateDebut,
            dateFin: this.exportDateFin
          },
          companyInfo: {
            nom: currentUser?.nomEntreprise || 'HeasyStock',
            proprietaire: '',
            telephone: currentUser?.numeroTelephone || 'N/A',
            adresse: '',
            email: currentUser?.email || ''
          }
        };

        this.exportService.exportToPDF(exportOptions);
        this.notificationService.success(`${dataToExport.length} dépense(s) exportée(s) avec succès en PDF`);
        this.closeExportModal();
      }
    });
  }
}
