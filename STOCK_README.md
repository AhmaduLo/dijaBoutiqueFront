# 📦 Module de Gestion de Stock - Dija Boutique

## Vue d'ensemble

Module complet de gestion de stock pour la boutique de bijoux, offrant une interface moderne et responsive pour suivre l'inventaire en temps réel.

## ✨ Fonctionnalités

### 1. Dashboard avec Cartes de Résumé
- **Total Produits** : Nombre total de produits en stock
- **Produits En Stock** : Nombre de produits disponibles + quantité totale
- **Stock Bas** : Alerte pour les produits à commander
- **Rupture** : Produits en rupture de stock
- **Valeur du Stock** : Valeur totale de l'inventaire + marge globale

### 2. Système d'Alertes Visuelles
- **Alertes en temps réel** pour ruptures et stocks bas
- **Codes couleur** selon le statut :
  - 🟢 Vert : Stock suffisant
  - 🟠 Orange : Stock bas
  - 🔴 Rouge : Rupture
  - ⚫ Rouge foncé : Stock négatif

### 3. Tableau de Stock Complet
Affiche pour chaque produit :
- Nom du produit
- Quantité achetée / vendue
- Stock disponible avec barre de progression
- Prix moyen d'achat / vente
- Valeur du stock
- Marge unitaire
- Taux de rotation (%)
- Statut visuel avec badge coloré

### 4. Filtres et Recherche
- **Recherche par nom** de produit
- **Filtre par statut** (En stock, Stock bas, Rupture, Négatif)
- **Tri multiple** :
  - Par nom (alphabétique)
  - Par stock (croissant/décroissant)
  - Par valeur (décroissant)
  - Par marge (décroissant)

### 5. Responsive Design
- Adapté aux écrans desktop, tablette et mobile
- Tableau scrollable sur mobile
- Cartes empilées sur petits écrans

## 🗂️ Structure des Fichiers

```
src/app/
├── core/
│   ├── models/
│   │   └── stock.model.ts          # Modèles de données (StockDto, ResumeStock, etc.)
│   └── services/
│       └── stock.service.ts        # Service API et méthodes utilitaires
└── features/
    └── stock/
        ├── stock-dashboard.component.ts    # Composant principal
        └── stock-dashboard.component.scss  # Styles modernes
```

## 📡 API Backend

### Endpoints Utilisés

```typescript
GET /api/stock
// Retourne tous les stocks
Response: StockDto[]

GET /api/stock/produit/{nom}
// Retourne le stock d'un produit spécifique
Response: StockDto

GET /api/stock/alertes
// Retourne les alertes (ruptures + stocks bas)
Response: AlerteStock[]

GET /api/stock/resume
// Retourne le résumé global du stock
Response: ResumeStock
```

### Format des Données

#### StockDto
```typescript
{
  nomProduit: string;
  quantiteAchetee: number;
  quantiteVendue: number;
  stockDisponible: number;
  prixMoyenAchat: number;
  prixMoyenVente: number;
  valeurStock: number;
  margeUnitaire: number;
  statut: 'EN_STOCK' | 'STOCK_BAS' | 'RUPTURE' | 'NEGATIF';
}
```

#### ResumeStock
```typescript
{
  totalProduits: number;
  produitsEnStock: number;
  produitsEnRupture: number;
  produitsStockBas: number;
  valeurTotaleStock: number;
  quantiteTotaleDisponible: number;
  margeGlobale: number;
}
```

#### AlerteStock
```typescript
{
  nomProduit: string;
  stockDisponible: number;
  statut: StatutStock;
  valeurStock: number;
}
```

## 🎨 Design et UX

### Palette de Couleurs
- **Principal** : Rose (#c2185b, #e91e63) - Gradient moderne
- **Succès** : Vert (#10b981) - Stock OK
- **Avertissement** : Orange (#f59e0b) - Stock bas
- **Danger** : Rouge (#ef4444) - Rupture
- **Info** : Bleu (#3b82f6) - Valeur
- **Neutre** : Gris (#6b7280, #e5e7eb)

### Animations
- Hover sur cartes : Translation + shadow
- Hover sur lignes du tableau : Background change
- Transitions fluides (0.2s - 0.3s)
- Spinner de chargement animé

### Icônes
- 📊 Dashboard
- ✓ En stock
- ⚠ Stock bas
- ✗ Rupture
- 💰 Valeur
- 🔄 Actualiser
- 🔍 Recherche

## 🚀 Utilisation

### Accès au Module
1. Se connecter à l'application
2. Cliquer sur "📦 Stock" dans le menu de navigation
3. Le dashboard s'affiche avec toutes les données

### Actualiser les Données
Cliquer sur le bouton "🔄 Actualiser" pour recharger les données du serveur

### Rechercher un Produit
Taper le nom du produit dans la barre de recherche (filtrage en temps réel)

### Filtrer par Statut
Sélectionner un statut dans la liste déroulante pour voir uniquement ces produits

### Trier les Résultats
Choisir un critère de tri dans la liste déroulante

## 📊 Métriques Calculées

### Pourcentage de Stock
```typescript
pourcentage = (stockDisponible / quantiteAchetee) * 100
```

### Taux de Rotation
```typescript
tauxRotation = (quantiteVendue / quantiteAchetee) * 100
```

### Marge Unitaire
```typescript
margeUnitaire = prixMoyenVente - prixMoyenAchat
```

### Valeur du Stock
```typescript
valeurStock = stockDisponible * prixMoyenAchat
```

## 🔧 Configuration

### URL de l'API
Par défaut : `http://localhost:8080/api/stock`

Pour modifier, éditer `stock.service.ts:13` :
```typescript
private readonly API_URL = 'http://votre-serveur:port/api/stock';
```

## 🎯 Cas d'Usage

### 1. Identifier les Produits à Commander
- Consulter la section "Alertes Stock"
- Filtrer par "Stock bas" ou "Rupture"
- Voir les quantités exactes

### 2. Analyser la Rentabilité
- Trier par "Marge (décroissant)"
- Identifier les produits les plus profitables
- Voir la marge globale dans le résumé

### 3. Surveiller la Rotation
- Consulter la colonne "Rotation"
- Identifier les produits à forte/faible rotation
- Ajuster les commandes en conséquence

### 4. Calculer la Valeur de l'Inventaire
- Voir "Valeur Stock" dans les cartes de résumé
- Total de l'investissement en stock
- Marge potentielle

## 🛠️ Personnalisation

### Modifier les Seuils d'Alerte
Les seuils sont définis côté backend. Contacter l'administrateur pour ajuster :
- Seuil "Stock bas" (ex: < 10 unités)
- Seuil "Rupture" (ex: = 0 unités)

### Ajouter des Colonnes
Éditer `stock-dashboard.component.ts` template section (lignes 130-145)

### Modifier les Couleurs
Éditer `stock-dashboard.component.scss` ou `stock.service.ts` (méthode `getStatutColor`)

## 📱 Responsive Breakpoints

- **Desktop** : > 1024px (pleine largeur)
- **Tablette** : 768px - 1024px (optimisé)
- **Mobile** : < 768px (empilé + scroll horizontal)

## 🔐 Sécurité

- Route protégée par `authGuard`
- Authentification JWT requise
- Accès réservé aux utilisateurs connectés

## 🐛 Dépannage

### Le stock ne s'affiche pas
1. Vérifier que le backend est démarré
2. Vérifier l'URL de l'API dans `stock.service.ts`
3. Ouvrir la console du navigateur pour voir les erreurs
4. Vérifier que vous êtes authentifié

### Les données ne s'actualisent pas
1. Cliquer sur "🔄 Actualiser"
2. Vider le cache du navigateur
3. Vérifier la connexion réseau

### Le tableau ne s'affiche pas correctement sur mobile
1. Le tableau est scrollable horizontalement
2. Swiper vers la gauche/droite pour voir toutes les colonnes
3. Les cartes s'empilent automatiquement

## 📈 Évolutions Futures

- Export Excel/PDF du stock
- Graphiques de tendances
- Prédictions de rupture
- Historique des mouvements
- Intégration avec achats/ventes
- Alertes par email/notification
- Gestion des seuils par produit
- Code-barres / QR codes

## 👥 Support

Pour toute question ou problème :
- Consulter la documentation technique
- Contacter l'équipe de développement
- Ouvrir un ticket de support

---

**Version** : 1.0.0
**Date** : 2025
**Auteur** : Dija Boutique Team
