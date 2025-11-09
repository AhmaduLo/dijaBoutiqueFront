import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { AuthService } from '../../core/services/auth.service';
import { AchatService } from '../../core/services/achat.service';
import { ProduitPourVente } from '../../core/models/produit-pour-vente.model';
import { FactureNumeroService } from '../../core/services/facture-numero.service';
import { TenantService } from '../../core/services/tenant.service';
import { Tenant } from '../../core/models/tenant.model';

@Component({
  selector: 'app-ventes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, CurrencyEurPipe],
  template: `
    <div class="ventes">
      <div class="page-header">
        <h1>💰 Gestion des Ventes</h1>
        <div style="display: flex; gap: 1rem;">
          <button class="btn btn-primary" (click)="refreshData()">
            🔄 Actualiser
          </button>
          <button class="btn btn-success" (click)="openExportModal()" *ngIf="isAdminOrGerant()">
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
        <div class="modal-content modal-large" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ isEditing ? 'Modifier' : 'Ajouter' }} une vente</h2>
            <button class="close-btn" (click)="closeForm()">×</button>
          </div>
          <form [formGroup]="venteForm" (ngSubmit)="onSubmit()">
            <!-- Informations générales -->
            <div class="form-section">
              <h3>👤 Informations de la vente</h3>
              <div class="form-row">
                <div class="form-group">
                  <label>Nom du client</label>
                  <input type="text" formControlName="client" placeholder="Ex: Farto Diallo (optionnel)" />
                  <small style="color: #666; display: block; margin-top: 0.25rem;">
                    Si vide, "Client" sera utilisé
                  </small>
                </div>
                <div class="form-group">
                  <label>Numéro de téléphone</label>
                  <input type="tel" formControlName="telephoneClient" placeholder="Ex: +221 77 123 45 67 (optionnel)" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Adresse du client</label>
                  <input type="text" formControlName="adresseClient" placeholder="Ex: Dakar, Sénégal (optionnel)" />
                </div>
                <div class="form-group">
                  <label>Date de vente *</label>
                  <input type="date" formControlName="dateVente" />
                </div>
              </div>
            </div>

            <!-- Liste des produits -->
            <div class="form-section">
              <h3>🛒 Produits</h3>

              <div formArrayName="produits" class="produits-list">
                <div *ngFor="let produit of produits.controls; let i = index" [formGroupName]="i" class="produit-ligne">
                  <div class="ligne-header">
                    <span class="ligne-numero">Produit {{ i + 1 }}</span>
                    <button
                      type="button"
                      class="btn-icon btn-delete-small"
                      (click)="supprimerLigneProduit(i)"
                      [disabled]="produits.length === 1"
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>

                  <div class="form-row">
                    <div class="form-group flex-2 search-produit-container">
                      <label>Nom du produit *</label>
                      <input
                        type="text"
                        [(ngModel)]="searchTermsProduits[i]"
                        [ngModelOptions]="{standalone: true}"
                        (input)="filtrerProduits(i)"
                        (focus)="afficherDropdownProduit(i)"
                        (blur)="masquerDropdownProduit(i)"
                        placeholder="🔍 Rechercher un produit..."
                        class="search-produit-input"
                      />
                      <div class="dropdown-produit" *ngIf="showDropdownProduit[i] && produitsFiltre[i] && produitsFiltre[i].length > 0">
                        <div
                          *ngFor="let prod of produitsFiltre[i]"
                          class="dropdown-item-produit"
                          (mousedown)="selectionnerProduit(i, prod)"
                        >
                          <span class="produit-nom">{{ prod.nomProduit }}</span>
                          <span class="produit-stock">Stock: {{ prod.stockDisponible }}</span>
                        </div>
                      </div>
                      <div class="dropdown-produit empty" *ngIf="showDropdownProduit[i] && produitsFiltre[i] && produitsFiltre[i].length === 0">
                        <div class="dropdown-item-produit empty-message">
                          Aucun produit trouvé
                        </div>
                      </div>
                    </div>

                    <div class="form-group">
                      <label>Quantité *</label>
                      <input
                        type="number"
                        formControlName="quantite"
                        min="1"
                        (input)="calculerTotalLigne(i)"
                      />
                    </div>

                    <div class="form-group">
                      <label>Prix unitaire ({{ selectedCurrency?.symbole || 'CFA' }}) *</label>
                      <input
                        type="number"
                        formControlName="prixUnitaire"
                        min="0"
                        step="0.01"
                        (input)="calculerTotalLigne(i)"
                      />
                    </div>

                    <div class="form-group">
                      <label>Total</label>
                      <input
                        type="number"
                        formControlName="prixTotal"
                        readonly
                        class="readonly total-display"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Bouton ajouter produit (en bas de la liste) -->
              <button type="button" class="btn btn-block btn-add-product" (click)="ajouterLigneProduit()">
                + Ajouter un produit
              </button>

              <!-- Total général -->
              <div class="total-general">
                <strong>Total général:</strong>
                <span class="montant-total">
                  {{ calculerTotalGeneral() | number:'1.0-2':'fr-FR' }}
                  <span class="currency-badge">{{ selectedCurrency?.symbole || 'CFA' }}</span>
                </span>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-secondary" (click)="closeForm()">Annuler</button>
              <button type="submit" class="btn btn-primary" [disabled]="venteForm.invalid || isSubmitting">
                {{ isSubmitting ? 'Enregistrement...' : 'Enregistrer' }}
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
              <th *ngIf="isAdminOrGerant()">Créé par</th>
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
              <td *ngIf="isAdminOrGerant()">{{ vente.utilisateur?.prenom || 'N/A' }}</td>
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
              <td [attr.colspan]="isAdminOrGerant() ? 5 : 5" class="text-right"><strong>Total :</strong></td>
              <td class="bold">
                {{ calculateTotal() | number:'1.0-2':'fr-FR' }}
                <span class="currency-badge">{{ defaultCurrency?.symbole || 'CFA' }}</span>
              </td>
              <td [attr.colspan]="isAdminOrGerant() ? 2 : 1"></td>
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

  // Cache des prix de vente suggérés par produit
  private prixVenteSuggereCache: Map<string, number> = new Map();

  // Données de la dernière vente pour génération de facture
  private derniereVenteData?: {
    client: string;
    telephoneClient?: string;
    adresseClient?: string;
    dateVente: string;
    produits: Array<{nomProduit: string; quantite: number; prixUnitaire: number; prixTotal: number}>;
    totalGeneral: number;
  };

  // Gestion de la recherche de produits
  searchTermsProduits: string[] = []; // Un terme de recherche par ligne
  produitsFiltre: StockDto[][] = []; // Produits filtrés par ligne
  showDropdownProduit: boolean[] = []; // Affichage du dropdown par ligne

  constructor(
    private fb: FormBuilder,
    private venteService: VenteService,
    private stockService: StockService,
    private achatService: AchatService,
    private notificationService: NotificationService,
    private currencyService: CurrencyService,
    private confirmService: ConfirmService,
    private exportService: ExportService,
    private authService: AuthService,
    private factureNumeroService: FactureNumeroService,
    private tenantService: TenantService
  ) {
    this.venteForm = this.fb.group({
      client: [''],
      telephoneClient: [''],
      adresseClient: [''],
      dateVente: [new Date().toISOString().split('T')[0], Validators.required],
      produits: this.fb.array([]) // Tableau de produits
    });
    // Ajouter une ligne par défaut
    this.ajouterLigneProduit();
  }

  /**
   * Récupère le FormArray des produits
   */
  get produits(): FormArray {
    return this.venteForm.get('produits') as FormArray;
  }

  /**
   * Crée un FormGroup pour une ligne de produit
   */
  creerLigneProduit(): FormGroup {
    return this.fb.group({
      nomProduit: ['', Validators.required],
      quantite: [1, [Validators.required, Validators.min(1)]],
      prixUnitaire: [0, [Validators.required, Validators.min(0)]],
      prixTotal: [{ value: 0, disabled: true }]
    });
  }

  /**
   * Ajoute une nouvelle ligne de produit
   */
  ajouterLigneProduit(): void {
    const index = this.produits.length;
    this.produits.push(this.creerLigneProduit());

    // Initialiser les données de recherche pour cette ligne
    this.searchTermsProduits[index] = '';
    this.produitsFiltre[index] = [...this.produitsDisponibles];
    this.showDropdownProduit[index] = false;
  }

  /**
   * Supprime une ligne de produit
   */
  supprimerLigneProduit(index: number): void {
    if (this.produits.length > 1) {
      this.produits.removeAt(index);
      // Retirer les données de recherche pour cette ligne
      this.searchTermsProduits.splice(index, 1);
      this.produitsFiltre.splice(index, 1);
      this.showDropdownProduit.splice(index, 1);
    } else {
      this.notificationService.warning('Au moins un produit est requis');
    }
  }

  ngOnInit(): void {
    this.loadCurrencies();
    this.loadVentes();
    this.loadProduitsDisponibles();
    this.chargerPrixVenteSuggeres();
  }

  /**
   * Charge les prix de vente suggérés depuis le nouvel endpoint
   * Accessible à TOUS les rôles (USER, GERANT, ADMIN)
   */
  chargerPrixVenteSuggeres(): void {
    this.achatService.getProduitsAvecPrixVente().subscribe({
      next: (produits: ProduitPourVente[]) => {
        // Mettre en cache les prix de vente suggérés
        for (const produit of produits) {
          if (produit.prixVenteSuggere && produit.prixVenteSuggere > 0) {
            this.prixVenteSuggereCache.set(produit.nomProduit, produit.prixVenteSuggere);
          }
        }
      },
      error: (error) => {
        console.warn('Erreur lors du chargement des prix de vente suggérés:', error);
      }
    });
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

      let prixSuggere = 0;

      // Priorité 1: Prix de vente suggéré depuis le cache des achats (accessible à tous)
      const prixCache = this.prixVenteSuggereCache.get(nomProduit);
      if (prixCache && prixCache > 0) {
        prixSuggere = prixCache;
        // Mettre à jour le produit sélectionné pour l'affichage
        if (this.selectedProduct) {
          this.selectedProduct.prixVenteSuggere = prixCache;
        }
      }
      // Priorité 2: Prix de vente suggéré depuis le stock
      else if (this.selectedProduct?.prixVenteSuggere && this.selectedProduct.prixVenteSuggere > 0) {
        prixSuggere = this.selectedProduct.prixVenteSuggere;
      }
      // Priorité 3: Prix moyen de vente
      else if (this.selectedProduct?.prixMoyenVente && this.selectedProduct.prixMoyenVente > 0) {
        prixSuggere = this.selectedProduct.prixMoyenVente;
      }

      if (prixSuggere > 0) {
        this.venteForm.patchValue({
          prixUnitaire: prixSuggere
        });
        this.calculerTotal();
      }
    } else {
      this.selectedProduct = undefined;
    }
  }

  /**
   * Gère le changement de produit pour une ligne spécifique
   */
  onProductChangeLigne(index: number): void {
    const ligneForm = this.produits.at(index) as FormGroup;
    const nomProduit = ligneForm.get('nomProduit')?.value;

    if (nomProduit) {
      const produit = this.produitsDisponibles.find(p => p.nomProduit === nomProduit);

      if (produit) {
        let prixSuggere = 0;

        // Priorité 1: Prix du cache (dernier prix d'achat)
        if (this.prixVenteSuggereCache.has(nomProduit)) {
          prixSuggere = this.prixVenteSuggereCache.get(nomProduit)!;
        }
        // Priorité 2: Prix de vente suggéré du produit
        else if (produit.prixVenteSuggere && produit.prixVenteSuggere > 0) {
          prixSuggere = produit.prixVenteSuggere;
        }
        // Priorité 3: Prix moyen de vente
        else if (produit.prixMoyenVente && produit.prixMoyenVente > 0) {
          prixSuggere = produit.prixMoyenVente;
        }

        if (prixSuggere > 0) {
          ligneForm.patchValue({
            prixUnitaire: prixSuggere
          });
          this.calculerTotalLigne(index);
        }
      }
    }
  }

  /**
   * Calcule le total pour une ligne spécifique
   */
  calculerTotalLigne(index: number): void {
    const ligneForm = this.produits.at(index) as FormGroup;
    const quantite = ligneForm.get('quantite')?.value || 0;
    const prixUnitaire = ligneForm.get('prixUnitaire')?.value || 0;
    const total = Number(quantite) * Number(prixUnitaire);

    ligneForm.patchValue({
      prixTotal: total
    }, { emitEvent: false });
  }

  /**
   * Calcule le total général de toutes les lignes
   */
  calculerTotalGeneral(): number {
    let total = 0;
    for (let i = 0; i < this.produits.length; i++) {
      const ligneForm = this.produits.at(i) as FormGroup;
      const quantite = ligneForm.get('quantite')?.value || 0;
      const prixUnitaire = ligneForm.get('prixUnitaire')?.value || 0;
      total += Number(quantite) * Number(prixUnitaire);
    }
    return total;
  }

  /**
   * Filtre les produits en fonction du terme de recherche pour une ligne donnée
   */
  filtrerProduits(index: number): void {
    const searchTerm = this.searchTermsProduits[index]?.toLowerCase().trim() || '';

    if (!searchTerm) {
      this.produitsFiltre[index] = [...this.produitsDisponibles];
    } else {
      this.produitsFiltre[index] = this.produitsDisponibles.filter(produit =>
        produit.nomProduit.toLowerCase().includes(searchTerm)
      );
    }

    // Afficher le dropdown si on tape quelque chose
    this.showDropdownProduit[index] = searchTerm.length > 0;
  }

  /**
   * Sélectionne un produit depuis le dropdown
   */
  selectionnerProduit(index: number, produit: StockDto): void {
    const ligneForm = this.produits.at(index) as FormGroup;

    // Mettre à jour le formulaire avec le nom du produit
    ligneForm.patchValue({
      nomProduit: produit.nomProduit
    });

    // Mettre à jour le terme de recherche
    this.searchTermsProduits[index] = produit.nomProduit;

    // Masquer le dropdown
    this.showDropdownProduit[index] = false;

    // Déclencher le changement de produit pour récupérer le prix
    this.onProductChangeLigne(index);
  }

  /**
   * Affiche le dropdown de recherche
   */
  afficherDropdownProduit(index: number): void {
    this.showDropdownProduit[index] = true;
    // Afficher tous les produits par défaut
    if (!this.searchTermsProduits[index]) {
      this.produitsFiltre[index] = [...this.produitsDisponibles];
    }
  }

  /**
   * Masque le dropdown après un délai (pour permettre le clic sur un élément)
   */
  masquerDropdownProduit(index: number): void {
    setTimeout(() => {
      this.showDropdownProduit[index] = false;
    }, 200);
  }

  refreshData(): void {
    this.notificationService.info('Actualisation en cours...');
    this.loadVentes();
  }

  loadVentes(): void {
    this.isLoading = true;
    // Si l'utilisateur est ADMIN ou GERANT, récupérer toutes les ventes, sinon seulement les siennes
    const venteObservable = this.authService.isAdminOrGerant()
      ? this.venteService.getAll()
      : this.venteService.getByUtilisateur();

    venteObservable.subscribe({
      next: (ventes) => {
        // Tri du plus récent au plus ancien (par date puis par ID décroissant)
        this.ventes = ventes.sort((a, b) => {
          const dateCompare = new Date(b.dateVente).getTime() - new Date(a.dateVente).getTime();
          // Si même date, trier par ID décroissant (les plus récents en premier)
          if (dateCompare === 0 && a.id && b.id) {
            return b.id - a.id;
          }
          return dateCompare;
        });
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

    // Réinitialiser le formulaire
    this.venteForm.reset({
      client: '',
      telephoneClient: '',
      adresseClient: '',
      dateVente: new Date().toISOString().split('T')[0]
    });

    // Réinitialiser les données de recherche
    this.searchTermsProduits = [];
    this.produitsFiltre = [];
    this.showDropdownProduit = [];

    // Vider le FormArray et ajouter une ligne par défaut
    this.produits.clear();
    this.ajouterLigneProduit();
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
      this.notificationService.warning('Veuillez remplir tous les champs obligatoires');
      Object.keys(this.venteForm.controls).forEach(key => {
        this.venteForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    const formValue = this.venteForm.getRawValue();
    const client = formValue['client']?.trim() || 'Client';
    const telephoneClient = formValue['telephoneClient']?.trim();
    const adresseClient = formValue['adresseClient']?.trim();
    const dateVente = formValue['dateVente'];
    const produits = formValue['produits'];

    // Sauvegarder les données du client pour la facture
    this.derniereVenteData = {
      client,
      telephoneClient,
      adresseClient,
      dateVente,
      produits: produits.map((p: any) => ({
        nomProduit: p['nomProduit'],
        quantite: Number(p['quantite']),
        prixUnitaire: Number(p['prixUnitaire']),
        prixTotal: Number(p['quantite']) * Number(p['prixUnitaire'])
      })),
      totalGeneral: produits.reduce((sum: number, p: any) =>
        sum + (Number(p['quantite']) * Number(p['prixUnitaire'])), 0)
    };

    // Créer une vente pour chaque produit
    const ventesACreer: Vente[] = produits.map((produit: any) => ({
      nomProduit: produit['nomProduit'],
      client: client,
      quantite: Number(produit['quantite']),
      prixUnitaire: Number(produit['prixUnitaire']),
      prixTotal: Number(produit['quantite']) * Number(produit['prixUnitaire']),
      dateVente: dateVente,
      deviseId: this.selectedCurrency?.id,
      deviseCode: this.selectedCurrency?.code,
      deviseSymbole: this.selectedCurrency?.symbole
    }));

    // Enregistrer toutes les ventes (appels API séquentiels)
    this.enregistrerVentesSequentiellement(ventesACreer, 0);
  }

  /**
   * Enregistre les ventes une par une de manière séquentielle
   */
  private enregistrerVentesSequentiellement(ventes: Vente[], index: number): void {
    if (index >= ventes.length) {
      // Toutes les ventes ont été enregistrées
      this.notificationService.success(`${ventes.length} vente(s) enregistrée(s) avec succès`);
      this.closeForm();
      this.loadVentes();
      // Recharger les produits disponibles pour mettre à jour les stocks
      this.loadProduitsDisponibles();
      // Recharger les prix de vente suggérés
      this.chargerPrixVenteSuggeres();
      this.isSubmitting = false;

      // Proposer la création de facture
      this.proposerCreationFacture(ventes);
      return;
    }

    // Enregistrer la vente courante
    this.venteService.create(ventes[index]).subscribe({
      next: () => {
        // Passer à la vente suivante
        this.enregistrerVentesSequentiellement(ventes, index + 1);
      },
      error: (error) => {
        this.notificationService.error(`Erreur lors de l'enregistrement du produit ${ventes[index].nomProduit}: ${error.message}`);
        this.isSubmitting = false;
      }
    });
  }

  /**
   * Propose la création d'une facture après l'enregistrement des ventes
   */
  private async proposerCreationFacture(ventes: Vente[]): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Générer une facture',
      message: `Voulez-vous générer une facture PDF pour cette vente (${ventes.length} produit(s)) ?`,
      confirmText: 'Générer la facture',
      cancelText: 'Non merci',
      type: 'info'
    });

    if (confirmed) {
      this.genererFacturePourVentes(ventes);
    }
  }

  /**
   * Génère une facture PDF pour les ventes effectuées
   */
  private genererFacturePourVentes(ventes: Vente[]): void {
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      this.notificationService.error('Impossible de générer la facture: utilisateur non connecté');
      return;
    }

    // Utiliser les données sauvegardées ou fallback sur les ventes
    const donneesClient = this.derniereVenteData || {
      client: ventes[0].client,
      telephoneClient: undefined,
      adresseClient: undefined,
      dateVente: ventes[0].dateVente,
      produits: ventes.map(v => ({
        nomProduit: v.nomProduit,
        quantite: v.quantite,
        prixUnitaire: v.prixUnitaire,
        prixTotal: v.prixTotal
      })),
      totalGeneral: ventes.reduce((sum, v) => sum + v.prixTotal, 0)
    };

    // Récupérer les informations de l'entreprise depuis le TenantService
    // Utilise l'endpoint /api/tenant/info accessible à tous les utilisateurs authentifiés
    this.tenantService.getTenantInfo().subscribe({
      next: (tenant: Tenant) => {
        // Générer un numéro de facture séquentiel (FAC-001, FAC-002, etc.)
        const numeroFacture = this.factureNumeroService.genererNumeroFacture();

        // Utiliser la date de vente avec l'heure actuelle de génération de la facture
        const dateVente = new Date(donneesClient.dateVente);
        const maintenant = new Date();
        // Combiner la date de vente avec l'heure actuelle
        const dateFacture = new Date(
          dateVente.getFullYear(),
          dateVente.getMonth(),
          dateVente.getDate(),
          maintenant.getHours(),
          maintenant.getMinutes(),
          maintenant.getSeconds()
        ).toISOString();

        // Préparer les options de facture avec l'adresse du tenant
        const factureOptions = {
          numeroFacture: numeroFacture,
          dateFacture: dateFacture,
          entreprise: {
            nom: tenant.nomEntreprise || currentUser.nomEntreprise || 'HeasyStock',
            adresse: tenant.adresse, // ✅ Adresse récupérée depuis le tenant
            ville: undefined,
            codePostal: undefined,
            telephone: tenant.numeroTelephone || currentUser.numeroTelephone || 'N/A',
            email: currentUser.email,
            nineaSiret: tenant.nineaSiret || undefined
          },
          client: {
            nom: donneesClient.client,
            entreprise: donneesClient.client,
            adresse: donneesClient.adresseClient,
            telephone: donneesClient.telephoneClient,
            email: undefined
          },
          produits: donneesClient.produits.map(p => ({
            designation: p.nomProduit,
            quantite: p.quantite,
            prixUnitaire: p.prixUnitaire,
            total: p.prixTotal
          })),
          totalGeneral: donneesClient.totalGeneral,
          devise: this.selectedCurrency?.symbole || 'CFA'
        };

        try {
          this.exportService.genererFactureProfessionnelle(factureOptions);
          this.notificationService.success('Facture générée avec succès');
        } catch (error: any) {
          this.notificationService.error(`Erreur lors de la génération de la facture: ${error.message}`);
        }
      },
      error: (error) => {
        console.error('Erreur lors de la récupération du tenant:', error);
        // En cas d'erreur, générer quand même la facture sans l'adresse
        this.genererFactureSansTenant(ventes, donneesClient);
      }
    });
  }

  /**
   * Génère une facture sans récupérer le tenant (fallback)
   */
  private genererFactureSansTenant(ventes: Vente[], donneesClient: any): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    const numeroFacture = this.factureNumeroService.genererNumeroFacture();
    const dateFacture = new Date(donneesClient.dateVente).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const factureOptions = {
      numeroFacture: numeroFacture,
      dateFacture: dateFacture,
      entreprise: {
        nom: currentUser.nomEntreprise || 'HeasyStock',
        adresse: undefined,
        ville: undefined,
        codePostal: undefined,
        telephone: currentUser.numeroTelephone || 'N/A',
        email: currentUser.email
      },
      client: {
        nom: donneesClient.client,
        entreprise: donneesClient.client,
        adresse: donneesClient.adresseClient,
        telephone: donneesClient.telephoneClient,
        email: undefined
      },
      produits: donneesClient.produits.map((p: any) => ({
        designation: p.nomProduit,
        quantite: p.quantite,
        prixUnitaire: p.prixUnitaire,
        total: p.prixTotal
      })),
      totalGeneral: donneesClient.totalGeneral,
      devise: this.selectedCurrency?.symbole || 'CFA'
    };

    try {
      this.exportService.genererFactureProfessionnelle(factureOptions);
      this.notificationService.success('Facture générée avec succès');
    } catch (error: any) {
      this.notificationService.error(`Erreur lors de la génération de la facture: ${error.message}`);
    }
  }

  editVente(vente: Vente): void {
    this.isEditing = true;
    this.currentVenteId = vente.id;
    this.showForm = true;

    // Réinitialiser le formulaire
    this.venteForm.reset();

    // Vider le FormArray des produits
    while (this.produits.length > 0) {
      this.produits.removeAt(0);
    }

    // Remplir les informations client et date
    this.venteForm.patchValue({
      client: vente.client,
      telephoneClient: '',
      adresseClient: '',
      dateVente: vente.dateVente
    });

    // Ajouter le produit de la vente au FormArray
    const produitGroup = this.creerLigneProduit();
    produitGroup.patchValue({
      nomProduit: vente.nomProduit,
      quantite: vente.quantite,
      prixUnitaire: vente.prixUnitaire,
      prixTotal: vente.prixTotal
    });
    this.produits.push(produitGroup);

    // Initialiser les données de recherche pour cette ligne
    this.searchTermsProduits[0] = vente.nomProduit;
    this.produitsFiltre[0] = [...this.produitsDisponibles];
    this.showDropdownProduit[0] = false;
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

    // Récupérer les informations de l'entreprise
    this.tenantService.getTenantInfo().subscribe({
      next: (tenant: Tenant) => {
        const currentUser = this.authService.getCurrentUser();

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
        this.notificationService.success(`${dataToExport.length} vente(s) exportée(s) avec succès en Excel`);
        this.closeExportModal();
      },
      error: (error) => {
        console.error('Erreur lors de la récupération du tenant:', error);
        // En cas d'erreur, exporter quand même sans les infos de l'entreprise
        const currentUser = this.authService.getCurrentUser();

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
            nom: currentUser?.nomEntreprise || 'HeasyStock',
            proprietaire: '',
            telephone: currentUser?.numeroTelephone || 'N/A',
            adresse: '',
            email: currentUser?.email || ''
          }
        };

        this.exportService.exportToExcel(exportOptions);
        this.notificationService.success(`${dataToExport.length} vente(s) exportée(s) avec succès en Excel`);
        this.closeExportModal();
      }
    });
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

    // Récupérer les informations de l'entreprise
    this.tenantService.getTenantInfo().subscribe({
      next: (tenant: Tenant) => {
        const currentUser = this.authService.getCurrentUser();

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
        this.notificationService.success(`${dataToExport.length} vente(s) exportée(s) avec succès en PDF`);
        this.closeExportModal();
      },
      error: (error) => {
        console.error('Erreur lors de la récupération du tenant:', error);
        // En cas d'erreur, exporter quand même sans les infos de l'entreprise
        const currentUser = this.authService.getCurrentUser();

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
            nom: currentUser?.nomEntreprise || 'HeasyStock',
            proprietaire: '',
            telephone: currentUser?.numeroTelephone || 'N/A',
            adresse: '',
            email: currentUser?.email || ''
          }
        };

        this.exportService.exportToPDF(exportOptions);
        this.notificationService.success(`${dataToExport.length} vente(s) exportée(s) avec succès en PDF`);
        this.closeExportModal();
      }
    });
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
}
