# Restrictions par Plan - Frontend

## 📋 Vue d'Ensemble

Le système de restrictions par plan permet de limiter l'accès à certaines fonctionnalités selon le plan d'abonnement de l'utilisateur.

---

## 🎯 Fonctionnalités par Plan

| Fonctionnalité | BASIC | PREMIUM/PRO | ENTREPRISE |
|----------------|-------|-------------|------------|
| **Gestion de base** |
| Gestion des ventes | ✅ | ✅ | ✅ |
| Gestion des achats | ✅ | ✅ | ✅ |
| Gestion des dépenses | ✅ | ✅ | ✅ |
| Gestion du stock | ✅ | ✅ | ✅ |
| Dashboard | ✅ | ✅ | ✅ |
| **Exports** |
| Export rapports globaux | ✅ | ✅ | ✅ |
| Export achats individuels | ❌ | ✅ | ✅ |
| Export ventes individuelles | ❌ | ✅ | ✅ |
| Export dépenses individuelles | ❌ | ✅ | ✅ |
| **Fonctionnalités avancées** |
| Rapports avancés | ❌ | ✅ | ✅ |
| Gestion multi-boutiques | ❌ | ✅ | ✅ |
| API d'intégration | ❌ | ✅ | ✅ |
| **Support** |
| Support par email | ✅ | ✅ | ✅ |
| Support prioritaire | ❌ | ✅ | ✅ |
| Support 24/7 | ❌ | ❌ | ✅ |
| **Limites** |
| Nombre d'utilisateurs | 3 max | 10 max | Illimité |

---

## 🛠️ Utilisation du Service

### Import du Service

```typescript
import { PlanRestrictionService } from '../../core/services/plan-restriction.service';

export class MonComposant {
  constructor(private planRestrictionService: PlanRestrictionService) {}
}
```

### Vérifier l'Accès aux Exports Individuels

```typescript
// Dans le composant
canExport: boolean = false;

ngOnInit(): void {
  this.canExport = this.planRestrictionService.canExportIndividual();
}
```

### Dans le Template

```html
<!-- Bouton d'export activé/désactivé selon le plan -->
<button
  [disabled]="!canExport"
  (click)="exporterVentes()"
  class="btn btn-primary">
  Exporter en Excel
</button>

<!-- Message informatif si fonctionnalité bloquée -->
<div *ngIf="!canExport" class="alert alert-warning">
  <i class="icon-lock"></i>
  {{ planRestrictionService.getRestrictionMessage('export') }}
  <a routerLink="/subscription" class="btn btn-link">Mettre à niveau</a>
</div>
```

### Exemple Complet : Composant Ventes

```typescript
import { Component, OnInit } from '@angular/core';
import { PlanRestrictionService } from '../../core/services/plan-restriction.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-ventes',
  templateUrl: './ventes.component.html'
})
export class VentesComponent implements OnInit {
  canExportIndividual = false;
  planName = '';

  constructor(
    private planRestrictionService: PlanRestrictionService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.canExportIndividual = this.planRestrictionService.canExportIndividual();
    this.planName = this.planRestrictionService.getCurrentPlanName();
  }

  exporterVentes(): void {
    if (!this.canExportIndividual) {
      const message = this.planRestrictionService.getRestrictionMessage('export');
      this.notificationService.warning(message);
      return;
    }

    // Code d'export...
    this.venteService.exportExcel().subscribe({
      next: (blob) => {
        // Télécharger le fichier
      },
      error: (err) => {
        if (err.status === 403) {
          // Erreur de restriction backend
          this.notificationService.error('Fonctionnalité réservée aux plans Premium et Entreprise');
        }
      }
    });
  }
}
```

---

## 🎨 Exemple de Template avec Restrictions

```html
<div class="ventes-container">
  <h2>Gestion des Ventes</h2>

  <!-- Section accessible à tous -->
  <div class="ventes-list">
    <!-- Liste des ventes -->
  </div>

  <!-- Section d'export avec restriction -->
  <div class="export-section">
    <h3>Exporter les Ventes</h3>

    <!-- Badge du plan actuel -->
    <div class="plan-badge">
      {{ planName }}
    </div>

    <!-- Boutons d'export -->
    <div class="export-buttons">
      <button
        class="btn btn-export"
        [disabled]="!canExportIndividual"
        (click)="exporterVentes()">
        <i class="icon-excel"></i>
        Exporter en Excel
      </button>

      <button
        class="btn btn-export"
        [disabled]="!canExportIndividual"
        (click)="exporterVentesPDF()">
        <i class="icon-pdf"></i>
        Exporter en PDF
      </button>
    </div>

    <!-- Message de restriction -->
    <div *ngIf="!canExportIndividual" class="restriction-message">
      <div class="alert alert-info">
        <i class="icon-lock"></i>
        <div class="message-content">
          <strong>Fonctionnalité Premium</strong>
          <p>{{ planRestrictionService.getRestrictionMessage('export') }}</p>
          <a routerLink="/subscription" class="btn btn-upgrade">
            Mettre à niveau mon plan
          </a>
        </div>
      </div>
    </div>
  </div>
</div>
```

---

## 🎯 Styles CSS Recommandés

```scss
.restriction-message {
  margin-top: 1rem;

  .alert-info {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.5rem;
    background: linear-gradient(135deg, #fff9e6 0%, #fff3d4 100%);
    border: 2px solid #ffa726;
    border-radius: 8px;

    i.icon-lock {
      font-size: 24px;
      color: #f57c00;
    }

    .message-content {
      flex: 1;

      strong {
        display: block;
        color: #e65100;
        font-size: 1.1rem;
        margin-bottom: 0.5rem;
      }

      p {
        color: #bf360c;
        margin: 0.5rem 0 1rem;
      }

      .btn-upgrade {
        background: #ff9800;
        color: white;
        padding: 0.5rem 1.5rem;
        border-radius: 6px;
        text-decoration: none;
        display: inline-block;
        font-weight: 600;

        &:hover {
          background: #f57c00;
        }
      }
    }
  }
}

.btn-export {
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #ccc;

    &:hover {
      background: #ccc;
    }
  }
}

.plan-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #2196f3;
  color: white;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 1rem;
}
```

---

## 🔄 Gestion des Erreurs Backend

Le backend retourne une erreur `403 Forbidden` avec ce format :

```json
{
  "error": "Plan insuffisant",
  "message": "Cette fonctionnalité est réservée aux plans Premium, Entreprise...",
  "code": "PLAN_RESTRICTION"
}
```

### Intercepter l'Erreur

```typescript
exporterVentes(): void {
  this.venteService.exportExcel().subscribe({
    next: (blob) => {
      // Succès
      this.downloadFile(blob);
    },
    error: (err) => {
      if (err.status === 403 && err.error.code === 'PLAN_RESTRICTION') {
        // Erreur de restriction de plan
        this.notificationService.warning(err.error.message);
      } else {
        // Autre erreur
        this.notificationService.error('Erreur lors de l\'export');
      }
    }
  });
}
```

---

## 📊 Exemple : Page Rapports (Accessible à Tous)

Les rapports globaux sont accessibles à **tous les plans payants** (BASIC, PREMIUM, ENTREPRISE).

```typescript
export class RapportsComponent implements OnInit {
  canAccessReports = false;

  ngOnInit(): void {
    // Tous les plans payants peuvent accéder aux rapports
    this.canAccessReports = this.planRestrictionService.canExportGlobal();

    if (!this.canAccessReports) {
      // Rediriger vers la page d'abonnement
      this.router.navigate(['/subscription']);
    }
  }

  exporterRapportGlobal(): void {
    // Accessible à tous les plans payants
    // Pas de vérification supplémentaire nécessaire
    this.rapportService.exportGlobalExcel().subscribe({
      next: (blob) => {
        this.downloadFile(blob);
      }
    });
  }
}
```

---

## 🛡️ Guard de Route (Optionnel)

Créer un guard pour protéger certaines routes :

```typescript
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { PlanRestrictionService } from '../services/plan-restriction.service';

@Injectable({
  providedIn: 'root'
})
export class PremiumGuard implements CanActivate {
  constructor(
    private planRestrictionService: PlanRestrictionService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.planRestrictionService.canExportIndividual()) {
      return true;
    }

    // Rediriger vers la page d'abonnement
    this.router.navigate(['/subscription']);
    return false;
  }
}
```

**Utilisation dans les routes** :

```typescript
{
  path: 'rapports-avances',
  component: RapportsAvancesComponent,
  canActivate: [AuthGuard, PremiumGuard]  // Nécessite PREMIUM ou ENTREPRISE
}
```

---

## 📝 Checklist d'Implémentation

### Pour chaque composant avec exports :

- [ ] Importer `PlanRestrictionService`
- [ ] Vérifier `canExportIndividual()` dans `ngOnInit()`
- [ ] Désactiver les boutons d'export si plan insuffisant
- [ ] Afficher un message informatif avec lien vers `/subscription`
- [ ] Gérer l'erreur 403 du backend
- [ ] Tester avec les 3 plans (BASIC, PREMIUM, ENTREPRISE)

### Composants concernés :

- [ ] `ventes.component.ts` - Export ventes individuelles
- [ ] `achats.component.ts` - Export achats individuels
- [ ] `depenses.component.ts` - Export dépenses individuelles
- [ ] `rapports.component.ts` - Export rapports globaux (accessible à tous)

---

## 🎯 Résumé

**Plan BASIC** :
- ✅ Accès complet à la gestion (ventes, achats, dépenses, stock)
- ✅ Export des rapports globaux
- ❌ Export des ventes/achats/dépenses individuels
- Limite : 3 utilisateurs

**Plan PREMIUM/PRO** :
- ✅ Tout ce que BASIC offre
- ✅ Export des ventes/achats/dépenses individuels
- ✅ Rapports avancés
- ✅ Gestion multi-boutiques
- Limite : 10 utilisateurs

**Plan ENTREPRISE** :
- ✅ Tout ce que PREMIUM offre
- ✅ Support 24/7
- ✅ Gestionnaire de compte dédié
- Limite : Utilisateurs illimités

---

**Date de création** : 10/11/2025
**Version** : 1.0
**Statut** : Prêt à implémenter
