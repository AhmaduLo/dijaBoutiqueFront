# 🏗️ Architecture de l'Application Dija Boutique

## 📦 Vue d'Ensemble

Application Angular moderne avec architecture modulaire, utilisant les dernières fonctionnalités d'Angular (standalone components, signals, etc.).

---

## 📂 Structure des Dossiers

```
frontdijaBoutique/
│
├── src/
│   ├── app/
│   │   ├── core/                          # Cœur de l'application
│   │   │   ├── services/                  # Services HTTP et métier
│   │   │   │   ├── achat.service.ts       # Service gestion achats
│   │   │   │   ├── vente.service.ts       # Service gestion ventes
│   │   │   │   ├── depense.service.ts     # Service gestion dépenses
│   │   │   │   └── notification.service.ts # Service notifications
│   │   │   │
│   │   │   ├── models/                    # Interfaces TypeScript
│   │   │   │   ├── achat.model.ts         # Interface Achat + Stats
│   │   │   │   ├── vente.model.ts         # Interface Vente + Stats
│   │   │   │   ├── depense.model.ts       # Interface Depense + Enum
│   │   │   │   └── dashboard.model.ts     # Métriques Dashboard
│   │   │   │
│   │   │   └── interceptors/              # Intercepteurs HTTP
│   │   │       └── http-error.interceptor.ts
│   │   │
│   │   ├── features/                      # Modules fonctionnels
│   │   │   ├── dashboard/                 # Tableau de bord
│   │   │   │   ├── dashboard.component.ts
│   │   │   │   └── dashboard.component.scss
│   │   │   │
│   │   │   ├── achats/                    # Gestion achats
│   │   │   │   ├── achats.component.ts
│   │   │   │   └── achats.component.scss
│   │   │   │
│   │   │   ├── ventes/                    # Gestion ventes
│   │   │   │   ├── ventes.component.ts
│   │   │   │   └── (réutilise achats.scss)
│   │   │   │
│   │   │   ├── depenses/                  # Gestion dépenses
│   │   │   │   ├── depenses.component.ts
│   │   │   │   └── depenses.component.scss
│   │   │   │
│   │   │   └── rapports/                  # Rapports (stub)
│   │   │       ├── rapports.component.ts
│   │   │       └── rapports.component.scss
│   │   │
│   │   ├── shared/                        # Composants réutilisables
│   │   │   ├── components/
│   │   │   │   ├── header/                # En-tête navigation
│   │   │   │   │   ├── header.component.ts
│   │   │   │   │   └── header.component.scss
│   │   │   │   │
│   │   │   │   ├── metric-card/           # Carte métrique
│   │   │   │   │   ├── metric-card.component.ts
│   │   │   │   │   └── metric-card.component.scss
│   │   │   │   │
│   │   │   │   └── notification/          # Système toasts
│   │   │   │       ├── notification.component.ts
│   │   │   │       └── notification.component.scss
│   │   │   │
│   │   │   └── pipes/
│   │   │       └── currency-eur.pipe.ts   # Formatage devise
│   │   │
│   │   ├── app.ts                         # Composant racine
│   │   ├── app.scss                       # Styles racine
│   │   ├── app.routes.ts                  # Configuration routes
│   │   └── app.config.ts                  # Configuration app
│   │
│   ├── styles/
│   │   └── shared.scss                    # Styles partagés (boutons, formulaires, modals)
│   │
│   ├── styles.scss                        # Styles globaux
│   └── index.html                         # Point d'entrée HTML
│
├── package.json                           # Dépendances npm
├── angular.json                           # Configuration Angular
├── tsconfig.json                          # Configuration TypeScript
├── README_DIJA.md                         # Documentation principale
├── GUIDE_UTILISATION.md                   # Guide utilisateur
└── ARCHITECTURE.md                        # Ce fichier
```

---

## 🔧 Stack Technique

### Frontend
- **Framework :** Angular 20 (dernière version)
- **Langage :** TypeScript (strict mode)
- **Styles :** SCSS
- **Gestion d'état :** Services + RxJS
- **Requêtes HTTP :** HttpClient
- **Formulaires :** Reactive Forms
- **Routing :** Lazy Loading avec loadComponent()

### Backend (Existant)
- **Framework :** Spring Boot
- **Base URL :** `http://localhost:8080/api`
- **Format :** REST API JSON

---

## 🧩 Architecture des Composants

### Pattern Standalone Components

Tous les composants utilisent le pattern **standalone** (Angular 14+) :
- Pas de NgModule
- Imports directs dans les métadonnées du composant
- Lazy loading natif
- Meilleure tree-shaking

### Structure d'un Composant Typique

```typescript
@Component({
  selector: 'app-exemple',
  standalone: true,
  imports: [CommonModule, FormsModule, ...],
  template: `...`,
  styleUrls: ['./exemple.component.scss']
})
export class ExempleComponent implements OnInit { }
```

**Template inline** ou **fichier séparé** selon la taille.

---

## 📡 Architecture des Services

### Pattern Service Singleton

Tous les services utilisent `providedIn: 'root'` :
- Instance unique dans toute l'application
- Injectés via le constructeur
- Gestion centralisée des requêtes HTTP

### Structure d'un Service Type

```typescript
@Injectable({ providedIn: 'root' })
export class ExempleService {
  private readonly API_URL = 'http://localhost:8080/api/exemple';
  private readonly UTILISATEUR_ID = 1;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Exemple[]> {
    return this.http.get<Exemple[]>(this.API_URL);
  }

  create(item: Exemple): Observable<Exemple> {
    const params = new HttpParams()
      .set('utilisateurId', this.UTILISATEUR_ID);
    return this.http.post<Exemple>(this.API_URL, item, { params });
  }

  // ... autres méthodes CRUD
}
```

---

## 🛣️ Routing & Lazy Loading

### Configuration des Routes

```typescript
export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/...')
      .then(m => m.DashboardComponent)
  },
  // ... autres routes
  { path: '**', redirectTo: '/dashboard' }
];
```

**Avantages :**
- Chargement à la demande
- Bundles séparés par feature
- Temps de chargement initial réduit
- Meilleures performances

---

## 🎨 Architecture des Styles

### Hiérarchie SCSS

1. **styles.scss** (global)
   - Reset CSS
   - Polices
   - Utilitaires
   - Background général

2. **styles/shared.scss** (partagé)
   - Variables de couleurs
   - Boutons
   - Formulaires
   - Modals
   - Animations

3. **Component-level** (spécifique)
   - Styles encapsulés par composant
   - Import de shared.scss si nécessaire

### Variables de Couleurs

```scss
$primary: #c2185b;    // Rose principal
$secondary: #7b1fa2;  // Violet
$success: #2e7d32;    // Vert
$warning: #e65100;    // Orange
$danger: #c62828;     // Rouge
$info: #1976d2;       // Bleu
```

---

## 🔄 Flux de Données

### Architecture du Dashboard

```
User Action
    ↓
Dashboard Component
    ↓
Service Methods (forkJoin)
    ├─→ AchatService.getStatistiques()
    ├─→ VenteService.getStatistiques()
    ├─→ DepenseService.getTotal()
    └─→ DepenseService.getStatistiques()
    ↓
HTTP Interceptor (error handling)
    ↓
Backend API (Spring Boot)
    ↓
Response (JSON)
    ↓
Component Logic (calculs)
    ↓
Template Update (binding)
    ↓
UI Display
```

### Gestion des Erreurs

```
HTTP Error
    ↓
HttpErrorInterceptor
    ↓
Error Formatting
    ↓
throwError()
    ↓
Service catchError
    ↓
NotificationService.error()
    ↓
Toast Display (top-right)
```

---

## 📊 Modèles de Données

### Interfaces Principales

**Achat :**
```typescript
interface Achat {
  id?: number;
  quantite: number;
  nomProduit: string;
  prixUnitaire: number;
  prixTotal: number;
  dateAchat: string;  // YYYY-MM-DD
  fournisseur: string;
}
```

**Vente :**
```typescript
interface Vente {
  id?: number;
  quantite: number;
  nomProduit: string;
  prixUnitaire: number;
  prixTotal: number;
  dateVente: string;  // YYYY-MM-DD
  client: string;
}
```

**Dépense :**
```typescript
interface Depense {
  id?: number;
  libelle: string;
  montant: number;
  dateDepense: string;  // YYYY-MM-DD
  categorie: CategorieDepense;
  estRecurrente: boolean;
  notes?: string;
}

enum CategorieDepense {
  LOYER, ELECTRICITE, EAU, INTERNET,
  TRANSPORT, MARKETING, FOURNITURES,
  MAINTENANCE, SALAIRES, ASSURANCE,
  TAXES, FORMATION, EQUIPEMENT, AUTRE
}
```

---

## 🔐 Sécurité & Configuration

### Intercepteur HTTP

- Gère toutes les erreurs HTTP de manière centralisée
- Format les messages d'erreur de façon lisible
- Catch les erreurs réseau (serveur non démarré)

### Configuration

**app.config.ts :**
```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([httpErrorInterceptor])
    )
  ]
};
```

---

## 🚀 Performance & Optimisation

### Stratégies Implémentées

1. **Lazy Loading**
   - Chaque feature chargée à la demande
   - Bundles séparés par route

2. **Standalone Components**
   - Pas de modules lourds
   - Tree-shaking optimal

3. **OnPush Change Detection** (à implémenter)
   - Réduire les vérifications de changement

4. **Reactive Forms**
   - Performance supérieure aux Template Forms
   - Validation côté client

5. **SCSS Compilation**
   - Styles compilés au build
   - CSS optimisé et minifié

### Bundles de Production

```
Initial chunk: ~87 kB (gzippé)
Lazy chunks: 2-9 kB chacun
Total app: ~315 kB (non gzippé)
```

---

## 🧪 Tests (À Implémenter)

### Structure Recommandée

```
src/app/
├── core/
│   └── services/
│       ├── achat.service.ts
│       └── achat.service.spec.ts  ← Tests unitaires
│
└── features/
    └── dashboard/
        ├── dashboard.component.ts
        └── dashboard.component.spec.ts  ← Tests composant
```

### Outils
- **Karma + Jasmine** : Tests unitaires
- **Cypress** : Tests E2E (recommandé)

---

## 📈 Évolutions Futures

### Phase 2 (Court Terme)
- [ ] Ajouter graphiques (Chart.js / ng2-charts)
- [ ] Implémenter page Rapports complète
- [ ] Export PDF des bilans
- [ ] Mode sombre

### Phase 3 (Moyen Terme)
- [ ] Authentification (JWT)
- [ ] Multi-utilisateurs
- [ ] Gestion des stocks (quantités)
- [ ] Notifications push
- [ ] PWA (Progressive Web App)

### Phase 4 (Long Terme)
- [ ] Analytics avancées
- [ ] Prédictions IA
- [ ] Application mobile (Ionic)
- [ ] Synchronisation multi-devices

---

## 🛠️ Build & Déploiement

### Développement
```bash
npm start           # Démarre le serveur dev (port 4200)
npm run build       # Build de production
npm test            # Lance les tests
npm run lint        # Lint TypeScript/SCSS
```

### Production
```bash
npm run build
# Les fichiers sont dans dist/frontdijaBoutique/
# Déployer sur serveur web (Nginx, Apache, Firebase, Vercel, etc.)
```

---

## 📚 Conventions de Code

### Nommage

- **Fichiers :** kebab-case (`achat.service.ts`)
- **Classes :** PascalCase (`AchatService`)
- **Variables :** camelCase (`totalAchats`)
- **Constantes :** UPPER_SNAKE_CASE (`API_URL`)

### Structure

- **Services :** Suffixe `.service.ts`
- **Models :** Suffixe `.model.ts`
- **Components :** Suffixe `.component.ts`
- **Pipes :** Suffixe `.pipe.ts`

### TypeScript Strict Mode

```json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true
}
```

---

**Auteur :** Développé pour Dija Boutique
**Date :** Octobre 2025
**Version :** 1.0
