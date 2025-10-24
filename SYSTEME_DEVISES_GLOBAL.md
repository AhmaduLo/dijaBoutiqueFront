# 🌍 Système de Devises Global - Fonctionnement Complet

## 📋 Vue d'ensemble

Le système permet de gérer **toutes les transactions** (achats, ventes, dépenses) avec **différentes devises**. Quand l'admin change la devise par défaut, toute l'application s'adapte automatiquement.

---

## 🎯 Principe de Fonctionnement

### 1. **Devise par Défaut du Système**
- Une seule devise est marquée comme "par défaut" (`isDefault = true`)
- Cette devise est utilisée pour :
  - Les nouveaux achats/ventes/dépenses (sélectionnée automatiquement)
  - L'affichage par défaut dans les statistiques
  - Le tableau de bord principal

### 2. **Devise par Transaction**
- Chaque achat, vente ou dépense enregistre :
  - `deviseId` : ID de la devise utilisée
  - `deviseCode` : Code (XOF, EUR, USD...)
  - `deviseSymbole` : Symbole (CFA, €, $...)

### 3. **Affichage Dynamique**
- Les montants sont toujours affichés avec leur devise d'origine
- Exemple : `10 000 CFA`, `150 €`, `200 $`

---

## 🔧 Modifications des Modèles

### Achat, Vente, Dépense
```typescript
interface Achat {
  // ... champs existants
  deviseId?: number;
  deviseCode?: string;    // "XOF", "EUR", "USD"
  deviseSymbole?: string; // "CFA", "€", "$"
}
```

**Appliqué à** :
- ✅ `achat.model.ts`
- ✅ `vente.model.ts`
- ✅ `depense.model.ts`

---

## 📝 Formulaires - Ajouter un Sélecteur de Devise

### Dans chaque formulaire (Achats, Ventes, Dépenses)

#### **1. Charger les devises disponibles**
```typescript
currencies: Currency[] = [];
selectedCurrency?: Currency;

ngOnInit(): void {
  // Charger les devises
  this.currencyService.getAllCurrencies().subscribe(currencies => {
    this.currencies = currencies;
    // Sélectionner automatiquement la devise par défaut
    this.selectedCurrency = currencies.find(c => c.isDefault);
  });
}
```

#### **2. Ajouter le sélecteur dans le template**
```html
<!-- Dans le formulaire, avant le bouton de soumission -->
<div class="form-group">
  <label>Devise *</label>
  <select [(ngModel)]="selectedCurrency" [ngModelOptions]="{standalone: true}">
    <option *ngFor="let currency of currencies" [ngValue]="currency">
      {{ currency.symbole }} {{ currency.code }} - {{ currency.nom }}
    </option>
  </select>
</div>
```

#### **3. Inclure la devise lors de la soumission**
```typescript
onSubmit(): void {
  const formValue = this.form.getRawValue();

  const data = {
    ...formValue,
    deviseId: this.selectedCurrency?.id,
    deviseCode: this.selectedCurrency?.code,
    deviseSymbole: this.selectedCurrency?.symbole
  };

  this.service.create(data).subscribe(/* ... */);
}
```

---

## 📊 Tableaux - Afficher la Devise

### Dans les templates HTML

#### **Colonne Montant avec Devise**
```html
<!-- AVANT -->
<td>{{ achat.prixTotal | number:'1.0-2':'fr-FR' }}</td>

<!-- APRÈS -->
<td>
  {{ achat.prixTotal | number:'1.0-2':'fr-FR' }}
  <span class="currency-badge">{{ achat.deviseSymbole || 'CFA' }}</span>
</td>
```

#### **Style du badge de devise**
```scss
.currency-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: #f3f4f6;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #c2185b;
  margin-left: 0.25rem;
}
```

---

## 🎨 Interface Utilisateur

### 1. **Sélecteur de Devise dans le Header** (Optionnel)
Permet aux utilisateurs de voir/changer rapidement la devise active :

```html
<div class="currency-selector">
  <select [(ngModel)]="activeCurrency" (change)="onCurrencyChange()">
    <option *ngFor="let currency of currencies" [ngValue]="currency">
      {{ currency.symbole }} {{ currency.code }}
    </option>
  </select>
</div>
```

### 2. **Indicateur de Devise dans le Dashboard**
```html
<div class="currency-info">
  <span class="icon">💰</span>
  <span>Devise actuelle: <strong>{{ defaultCurrency?.nom }} ({{ defaultCurrency?.symbole }})</strong></span>
</div>
```

---

## 🔄 Conversion Automatique (Optionnel)

Pour les **statistiques et rapports**, vous pouvez convertir tous les montants dans la devise par défaut :

### Dans le Service
```typescript
calculateTotalInDefaultCurrency(transactions: (Achat | Vente | Depense)[]): number {
  const defaultCurrency = this.currencyService.defaultCurrencySubject.value;

  return transactions.reduce((total, transaction) => {
    // Si la transaction est dans la devise par défaut
    if (transaction.deviseCode === defaultCurrency?.code) {
      return total + transaction.montant;
    }

    // Sinon, convertir
    const transactionCurrency = this.currencies.find(c => c.code === transaction.deviseCode);
    if (transactionCurrency && defaultCurrency) {
      const converted = this.currencyService.convertAmount(
        transaction.montant,
        transactionCurrency,
        defaultCurrency
      );
      return total + converted;
    }

    return total + transaction.montant; // Fallback
  }, 0);
}
```

---

## 📱 Exemple Complet : Formulaire d'Achat

### TypeScript
```typescript
export class AchatsComponent implements OnInit {
  currencies: Currency[] = [];
  selectedCurrency?: Currency;
  achatForm: FormGroup;

  constructor(
    private currencyService: CurrencyService,
    private achatService: AchatService,
    private fb: FormBuilder
  ) {
    this.achatForm = this.fb.group({
      nomProduit: ['', Validators.required],
      quantite: [1, [Validators.required, Validators.min(1)]],
      prixUnitaire: [0, [Validators.required, Validators.min(0)]],
      fournisseur: ['', Validators.required],
      dateAchat: [new Date().toISOString().split('T')[0], Validators.required]
    });
  }

  ngOnInit(): void {
    // Charger les devises
    this.currencyService.getAllCurrencies().subscribe(currencies => {
      this.currencies = currencies;
      this.selectedCurrency = currencies.find(c => c.isDefault);
    });
  }

  onSubmit(): void {
    if (this.achatForm.invalid || !this.selectedCurrency) return;

    const formValue = this.achatForm.getRawValue();
    const prixTotal = formValue.quantite * formValue.prixUnitaire;

    const achat = {
      ...formValue,
      prixTotal,
      deviseId: this.selectedCurrency.id,
      deviseCode: this.selectedCurrency.code,
      deviseSymbole: this.selectedCurrency.symbole
    };

    this.achatService.createAchat(achat).subscribe({
      next: () => {
        this.notificationService.success('Achat créé avec succès');
        this.closeForm();
        this.loadAchats();
      },
      error: (err) => {
        this.notificationService.error('Erreur lors de la création');
      }
    });
  }
}
```

### HTML
```html
<form [formGroup]="achatForm" (ngSubmit)="onSubmit()">
  <!-- Champs existants -->
  <div class="form-group">
    <label>Nom du produit *</label>
    <input type="text" formControlName="nomProduit" />
  </div>

  <div class="form-row">
    <div class="form-group">
      <label>Quantité *</label>
      <input type="number" formControlName="quantite" />
    </div>
    <div class="form-group">
      <label>Prix unitaire *</label>
      <input type="number" formControlName="prixUnitaire" />
    </div>
  </div>

  <!-- NOUVEAU : Sélecteur de devise -->
  <div class="form-group">
    <label>Devise *</label>
    <select [(ngModel)]="selectedCurrency" [ngModelOptions]="{standalone: true}" required>
      <option *ngFor="let currency of currencies" [ngValue]="currency">
        {{ currency.symbole }} {{ currency.code }} - {{ currency.nom }}
        <span *ngIf="currency.isDefault">(Par défaut)</span>
      </option>
    </select>
  </div>

  <!-- Prix total avec devise -->
  <div class="form-group" *ngIf="achatForm.valid">
    <label>Prix total</label>
    <div class="total-display">
      {{ (achatForm.get('quantite')?.value * achatForm.get('prixUnitaire')?.value) | number:'1.0-2':'fr-FR' }}
      <span class="currency">{{ selectedCurrency?.symbole || 'CFA' }}</span>
    </div>
  </div>

  <div class="form-actions">
    <button type="button" class="btn btn-secondary" (click)="closeForm()">Annuler</button>
    <button type="submit" class="btn btn-primary" [disabled]="achatForm.invalid || !selectedCurrency">
      Enregistrer
    </button>
  </div>
</form>
```

---

## 🗄️ Backend - Modifications Requises

### 1. **Ajouter les champs dans les Entities**

```java
@Entity
public class Achat {
    // ... champs existants

    @ManyToOne
    @JoinColumn(name = "devise_id")
    private Devise devise;

    // Dénormalisation pour performance (optionnel)
    @Column(length = 10)
    private String deviseCode;

    @Column(length = 10)
    private String deviseSymbole;
}
```

### 2. **Lors de la création, récupérer la devise**

```java
@PostMapping
public ResponseEntity<Achat> createAchat(@RequestBody AchatDto dto) {
    Achat achat = new Achat();
    // ... mapping des champs

    // Récupérer et attacher la devise
    if (dto.getDeviseId() != null) {
        Devise devise = deviseRepository.findById(dto.getDeviseId())
            .orElseThrow(() -> new RuntimeException("Devise introuvable"));
        achat.setDevise(devise);
        achat.setDeviseCode(devise.getCode());
        achat.setDeviseSymbole(devise.getSymbole());
    } else {
        // Utiliser la devise par défaut
        Devise defaultDevise = deviseRepository.findByIsDefaultTrue()
            .orElseThrow(() -> new RuntimeException("Aucune devise par défaut"));
        achat.setDevise(defaultDevise);
        achat.setDeviseCode(defaultDevise.getCode());
        achat.setDeviseSymbole(defaultDevise.getSymbole());
    }

    return ResponseEntity.ok(achatRepository.save(achat));
}
```

---

## ✅ Checklist d'Implémentation

### Frontend
- [ ] Ajouter champs devise dans les modèles (✅ Fait)
- [ ] Charger les devises dans les composants
- [ ] Ajouter sélecteur de devise dans formulaires Achats
- [ ] Ajouter sélecteur de devise dans formulaires Ventes
- [ ] Ajouter sélecteur de devise dans formulaires Dépenses
- [ ] Afficher la devise dans les tableaux
- [ ] Afficher la devise dans les statistiques
- [ ] (Optionnel) Ajouter sélecteur global dans le header
- [ ] (Optionnel) Implémenter conversion automatique pour rapports

### Backend
- [ ] Ajouter champ `devise_id` dans tables `achats`, `ventes`, `depenses`
- [ ] Ajouter relations JPA avec `Devise`
- [ ] Modifier DTOs pour inclure `deviseId`
- [ ] Lors de création, attacher la devise (défaut si non spécifiée)
- [ ] Retourner `deviseCode` et `deviseSymbole` dans les réponses
- [ ] Permettre filtrage par devise dans les endpoints liste

---

## 🎯 Résultat Final

1. **Admin configure les devises** : XOF (par défaut), EUR, USD, MAD...
2. **Utilisateur crée un achat** : Sélectionne "USD" → Montant enregistré en USD
3. **Tableau affiche** : "5 000 $" avec le symbole de la devise
4. **Statistiques** : Conversion automatique dans la devise par défaut pour les totaux
5. **Changement de devise par défaut** : Les nouvelles transactions utilisent la nouvelle devise, les anciennes gardent leur devise d'origine

---

**Système de devises global prêt à être implémenté ! 🚀**
