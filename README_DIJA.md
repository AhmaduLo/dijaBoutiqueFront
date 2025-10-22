# 🌸 Dija Boutique - Application de Gestion

Application Angular moderne pour la gestion d'une activité de vente d'accessoires féminins.

## ✨ Fonctionnalités

### 📊 Dashboard
- Vue d'ensemble avec métriques clés du mois
- Total des achats, chiffre d'affaires, dépenses et bénéfice net
- Filtres par période (mois, trimestre, année, personnalisée)
- Calcul de la marge brute et conseils automatiques

### 🛒 Gestion des Achats
- Liste paginée avec recherche et tri
- Formulaire d'ajout/modification avec calcul automatique du prix total
- Suppression avec confirmation
- Affichage du total des achats

### 💰 Gestion des Ventes
- Liste des ventes avec recherche
- Formulaire complet (produit, client, quantité, prix)
- Calcul automatique du prix total
- Statistiques en temps réel

### 💳 Gestion des Dépenses
- Liste avec filtres par catégorie
- 14 catégories prédéfinies (Loyer, Électricité, Marketing, etc.)
- Badge pour les dépenses récurrentes
- Notes optionnelles par dépense

### 📈 Rapports (en développement)
- Génération de bilans mensuels
- Graphiques d'évolution
- Export PDF (à venir)

## 🎨 Design

- Interface moderne et épurée
- Couleurs douces : rose poudré, beige, or
- Responsive (mobile, tablette, desktop)
- Animations fluides
- Police Inter pour une meilleure lisibilité

## 🚀 Démarrage

### Prérequis

- Node.js 18+ et npm
- Backend Spring Boot démarré sur `http://localhost:8080`

### Installation

```bash
cd frontdijaBoutique
npm install
```

### Lancement en développement

```bash
npm start
```

L'application sera accessible sur `http://localhost:4200`

### Build de production

```bash
npm run build
```

Les fichiers générés seront dans `dist/frontdijaBoutique/`

## 📁 Structure du projet

```
src/app/
├── core/                     # Services et logique métier
│   ├── services/             # Services HTTP (achats, ventes, dépenses)
│   ├── models/               # Interfaces TypeScript
│   └── interceptors/         # Gestion des erreurs HTTP
├── features/                 # Modules fonctionnels
│   ├── dashboard/            # Tableau de bord
│   ├── achats/               # Gestion des achats
│   ├── ventes/               # Gestion des ventes
│   ├── depenses/             # Gestion des dépenses
│   └── rapports/             # Rapports (en dev)
└── shared/                   # Composants réutilisables
    ├── components/           # Header, notifications, cartes métriques
    └── pipes/                # Pipe de formatage devise EUR
```

## 🔌 Configuration du Backend

L'application se connecte à l'API Spring Boot sur `http://localhost:8080/api`

### Endpoints utilisés

- `GET/POST/PUT/DELETE /api/achats` - Gestion des achats
- `GET /api/achats/statistiques?debut=YYYY-MM-DD&fin=YYYY-MM-DD`
- `GET/POST/PUT/DELETE /api/ventes` - Gestion des ventes
- `GET /api/ventes/chiffre-affaires?debut=YYYY-MM-DD&fin=YYYY-MM-DD`
- `GET/POST/PUT/DELETE /api/depenses` - Gestion des dépenses
- `GET /api/depenses/total?debut=YYYY-MM-DD&fin=YYYY-MM-DD`

**Important :** L'utilisateur ID est fixé à `1` pour le moment (authentification à venir).

## 🛠 Technologies

- **Angular 20** - Framework frontend
- **TypeScript** - Langage
- **SCSS** - Styles
- **RxJS** - Gestion asynchrone
- **HttpClient** - Communication API
- **Reactive Forms** - Gestion des formulaires

## 📝 Prochaines étapes

- [ ] Implémenter les graphiques dans le dashboard (Chart.js ou ng2-charts)
- [ ] Compléter la page Rapports avec génération PDF
- [ ] Ajouter l'authentification utilisateur
- [ ] Implémenter la gestion des stocks (quantité disponible)
- [ ] Ajouter des graphiques d'évolution temporelle
- [ ] Système de backup/export des données
- [ ] Mode sombre

## 🐛 Débogage

Si le backend n'est pas accessible :
```
Erreur: "Impossible de contacter le serveur. Vérifiez que le backend est démarré."
```

Vérifiez que Spring Boot tourne sur le port 8080.

## 👤 Auteur

Développé pour Dija Boutique - Gestion familiale d'accessoires féminins


