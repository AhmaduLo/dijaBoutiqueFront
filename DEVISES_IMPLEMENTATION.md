# 💰 Système de Gestion des Devises (Unités Monétaires)

## ✅ Vue d'ensemble

Le système permet aux administrateurs de gérer les devises utilisées dans l'application (Franc CFA, Euro, Dollar, Dirham, etc.) avec des taux de change configurables.

## 📁 Fichiers Créés

### 1. **Modèle** (`currency.model.ts`)
```typescript
interface Currency {
  id?: number;
  code: string;          // USD, EUR, XOF, MAD
  nom: string;           // Dollar américain, Euro, Franc CFA
  symbole: string;       // $, €, CFA, DH
  pays: string;          // États-Unis, France, Sénégal
  tauxChange?: number;   // Taux de change
  isDefault?: boolean;   // Devise par défaut
}
```

**Devises prédéfinies** :
- 🇸🇳 **XOF** - Franc CFA (Sénégal) - `CFA`
- 🇪🇺 **EUR** - Euro (France) - `€`
- 🇺🇸 **USD** - Dollar américain (États-Unis) - `$`
- 🇲🇦 **MAD** - Dirham marocain (Maroc) - `DH`
- 🇬🇧 **GBP** - Livre sterling (Royaume-Uni) - `£`

### 2. **Service** (`currency.service.ts`)

**Méthodes principales** :
- `getAllCurrencies()` - Récupérer toutes les devises
- `getCurrencyById(id)` - Récupérer une devise par ID
- `getDefaultCurrency()` - Récupérer la devise par défaut
- `createCurrency(data)` - Créer une nouvelle devise
- `updateCurrency(id, data)` - Modifier une devise
- `deleteCurrency(id)` - Supprimer une devise
- `setDefaultCurrency(id)` - Définir comme devise par défaut
- `formatAmount(amount, currency)` - Formater un montant avec la devise
- `convertAmount(amount, from, to)` - Convertir entre deux devises

**Observable** :
```typescript
defaultCurrency$: Observable<Currency | null>
```
Permet de s'abonner aux changements de devise par défaut dans toute l'application.

### 3. **Interface Admin** (`admin-dashboard.component.*`)

#### Onglets de navigation
- **👥 Utilisateurs** : Gestion des utilisateurs (existant)
- **💰 Devises** : Gestion des devises (nouveau)

#### Fonctionnalités

**Liste des devises** :
- Affichage en tableau avec toutes les informations
- La devise par défaut est surlignée en jaune
- Recherche par code, nom, pays ou symbole

**Actions disponibles** :
- ⭐ **Définir par défaut** : Marquer comme devise principale du système
- ✏️ **Modifier** : Éditer les informations d'une devise
- 🗑️ **Supprimer** : Retirer une devise (sauf la devise par défaut)

**Formulaire de création/modification** :
- **Devises prédéfinies** : Boutons rapides pour ajouter USD, EUR, XOF, MAD, GBP
- **Code devise*** : Ex : XOF, EUR, USD (automatiquement en majuscules)
- **Symbole*** : Ex : CFA, €, $
- **Nom complet*** : Ex : Franc CFA
- **Pays*** : Ex : Sénégal
- **Taux de change*** : Par rapport à la devise de référence
- **Devise par défaut** : Case à cocher

**Protection** :
- ❌ Impossible de supprimer la devise par défaut
- ❌ Les actions destructives nécessitent une confirmation

## 🎨 Interface Utilisateur

### Design
- **Onglets stylisés** avec gradient rose pour l'onglet actif
- **Badges colorés** :
  - 🟢 Vert pour "Devise par défaut"
  - ⚪ Gris pour les autres
- **Ligne jaune** pour la devise par défaut dans le tableau
- **Devises prédéfinies** : Boutons cliquables pour pré-remplir le formulaire
- **Responsive** : S'adapte aux écrans mobiles

### Symboles
- 💰 Icône des devises
- ⭐ Définir par défaut
- ✏️ Modifier
- 🗑️ Supprimer

## 🔧 Endpoints Backend Attendus

```
GET    /api/devises                - Liste toutes les devises
POST   /api/devises                - Crée une devise
GET    /api/devises/:id            - Récupère une devise
PUT    /api/devises/:id            - Modifie une devise
DELETE /api/devises/:id            - Supprime une devise
GET    /api/devises/default        - Récupère la devise par défaut
PUT    /api/devises/:id/set-default - Définit comme devise par défaut
```

## 📊 Structure de Données

### Request - Créer/Modifier
```json
{
  "code": "XOF",
  "nom": "Franc CFA",
  "symbole": "CFA",
  "pays": "Sénégal",
  "tauxChange": 1,
  "isDefault": true
}
```

### Response - Devise
```json
{
  "id": 1,
  "code": "XOF",
  "nom": "Franc CFA",
  "symbole": "CFA",
  "pays": "Sénégal",
  "tauxChange": 1,
  "isDefault": true,
  "dateCreation": "2025-01-15T10:30:00"
}
```

## 🚀 Utilisation dans l'Application

### Dans un composant

```typescript
import { CurrencyService } from './core/services/currency.service';

// Injection
constructor(private currencyService: CurrencyService) {}

// S'abonner à la devise par défaut
this.currencyService.defaultCurrency$.subscribe(currency => {
  console.log('Devise par défaut:', currency);
});

// Formater un montant
const formatted = this.currencyService.formatAmount(10000);
// Résultat: "10 000 CFA"

// Convertir un montant
const montantUSD = this.currencyService.convertAmount(
  10000,
  deviseXOF,
  deviseUSD
);
```

### Dans le template

```html
<!-- Afficher un montant avec la devise -->
<p>{{ montant | number:'1.0-2':'fr-FR' }} {{ devise?.symbole }}</p>

<!-- Liste déroulante de devises -->
<select [(ngModel)]="selectedCurrency">
  <option *ngFor="let currency of currencies" [ngValue]="currency">
    {{ currency.symbole }} {{ currency.code }} - {{ currency.nom }}
  </option>
</select>
```

## 🔐 Sécurité

- ✅ Routes protégées par `adminGuard`
- ✅ Seuls les administrateurs peuvent gérer les devises
- ✅ Token JWT requis pour toutes les requêtes
- ✅ Validation des formulaires côté client
- ✅ Confirmations pour les actions destructives

## 📱 Responsive Design

- **Desktop** : Tableau complet avec tous les détails
- **Tablette** : Tableau défilant horizontalement
- **Mobile** : Boutons de devises prédéfinies en colonne

## 🎯 Prochaines Étapes

### Intégration dans les formulaires (À faire)
Il faut maintenant intégrer la sélection de devise dans :
1. **Achats** : Choisir la devise pour un achat
2. **Ventes** : Choisir la devise pour une vente
3. **Dépenses** : Choisir la devise pour une dépense

### Conversion automatique
Implémenter la conversion automatique des montants vers la devise par défaut pour les statistiques et rapports.

## 💡 Exemples d'Utilisation

### Ajouter une nouvelle devise
1. Aller dans **Admin > Devises**
2. Cliquer sur **+ Ajouter une devise**
3. Soit cliquer sur une devise prédéfinie (ex: € EUR - France)
4. Soit remplir manuellement tous les champs
5. Définir le taux de change (ex: 1 USD = 600 XOF)
6. Cocher "Devise par défaut" si nécessaire
7. Cliquer sur **Ajouter**

### Changer la devise par défaut
1. Dans le tableau des devises
2. Cliquer sur l'étoile ⭐ de la devise souhaitée
3. Confirmer le changement

### Modifier une devise
1. Cliquer sur l'icône ✏️
2. Modifier les informations
3. Cliquer sur **Modifier**

### Supprimer une devise
1. Cliquer sur l'icône 🗑️ (désactivée pour la devise par défaut)
2. Confirmer la suppression

---

**Système de gestion des devises opérationnel !** 🎊

La partie backend doit maintenant être implémentée pour activer toutes les fonctionnalités.
