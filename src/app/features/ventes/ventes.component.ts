import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Vente } from '../../core/models/vente.model';
import { VenteService } from '../../core/services/vente.service';
import { NotificationService } from '../../core/services/notification.service';
import { CurrencyEurPipe } from '../../shared/pipes/currency-eur.pipe';

@Component({
  selector: 'app-ventes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, CurrencyEurPipe],
  template: `
    <div class="ventes">
      <div class="page-header">
        <h1>💰 Gestion des Ventes</h1>
        <button class="btn btn-primary" (click)="openForm()">+ Nouvelle vente</button>
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
                <input type="text" formControlName="nomProduit" placeholder="Ex: Bracelet argent" />
                <div class="error" *ngIf="venteForm.get('nomProduit')?.invalid && venteForm.get('nomProduit')?.touched">
                  Le nom du produit est requis
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
                <label>Prix unitaire (€) *</label>
                <input type="number" formControlName="prixUnitaire" min="0" step="0.01" (input)="calculerTotal()" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Date de vente *</label>
                <input type="date" formControlName="dateVente" />
              </div>
              <div class="form-group">
                <label>Prix total (€)</label>
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let vente of filteredVentes">
              <td>{{ formatDate(vente.dateVente) }}</td>
              <td class="bold">{{ vente.nomProduit }}</td>
              <td>{{ vente.client }}</td>
              <td>{{ vente.quantite }}</td>
              <td>{{ vente.prixUnitaire | currencyEur }}</td>
              <td class="bold">{{ vente.prixTotal | currencyEur }}</td>
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
              <td class="bold">{{ calculateTotal() | currencyEur }}</td>
              <td></td>
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
  showForm = false;
  isEditing = false;
  isLoading = true;
  isSubmitting = false;
  searchTerm = '';
  currentVenteId?: number;

  constructor(
    private fb: FormBuilder,
    private venteService: VenteService,
    private notificationService: NotificationService
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
    this.loadVentes();
  }

  loadVentes(): void {
    this.isLoading = true;
    this.venteService.getByUtilisateur().subscribe({
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
    this.venteForm.reset({
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
      prixTotal: this.venteService.calculerPrixTotal(formValue.quantite, formValue.prixUnitaire)
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

  deleteVente(vente: Vente): void {
    if (!vente.id) return;
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la vente "${vente.nomProduit}" ?`)) {
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
}
