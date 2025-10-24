# 👑 Implémentation du Système d'Administration

## ✅ Fichiers Créés

### 1. **Modèles** (`admin.model.ts`)
- `UserRole` - Enum ADMIN/USER
- `Utilisateur` - Modèle d'utilisateur complet
- `CreateUtilisateurDto` - DTO pour création
- `UpdateUtilisateurDto` - DTO pour modification
- `ChangeRoleDto` - DTO pour changement de rôle
- `StatistiquesAdmin` - Statistiques du système

### 2. **Service** (`admin.service.ts`)
- `getAllUtilisateurs()` - Récupérer tous les utilisateurs
- `getUtilisateurById(id)` - Récupérer par ID
- `createUtilisateur(data)` - Créer un utilisateur
- `updateUtilisateur(id, data)` - Modifier un utilisateur
- `deleteUtilisateur(id)` - Supprimer un utilisateur
- `changeRole(id, role)` - Changer le rôle
- `getStatistiques()` - Statistiques
- Méthodes utilitaires (labels, couleurs, icônes)
- `generateTemporaryPassword()` - Générer mot de passe

### 3. **Guard** (`auth.guard.ts`)
- `adminGuard()` - Protège les routes ADMIN

### 4. **AuthService** (modifié)
- `isAdmin()` - Vérifie si utilisateur est ADMIN

### 5. **Composant** (`admin-dashboard.component.ts`)
- Dashboard avec statistiques
- Tableau de gestion des utilisateurs
- Formulaire création/modification
- Recherche et filtres
- Changement de rôle
- Suppression d'utilisateur

## 🔧 Fichiers à Compléter

### Template HTML (`admin-dashboard.component.html`)

```html
<div class="admin-dashboard">
  <!-- Statistiques -->
  <div class="stats-cards" *ngIf="statistiques">
    <div class="card">
      <div class="card-icon">👥</div>
      <div class="card-content">
        <h3>Total Utilisateurs</h3>
        <p class="card-value">{{ statistiques.nombreTotal }}</p>
      </div>
    </div>
    <div class="card card-admin">
      <div class="card-icon">👑</div>
      <div class="card-content">
        <h3>Administrateurs</h3>
        <p class="card-value">{{ statistiques.nombreAdmins }}</p>
      </div>
    </div>
    <div class="card card-user">
      <div class="card-icon">👤</div>
      <div class="card-content">
        <h3>Employés</h3>
        <p class="card-value">{{ statistiques.nombreUsers }}</p>
      </div>
    </div>
    <div class="card card-new">
      <div class="card-icon">✨</div>
      <div class="card-content">
        <h3>Nouveaux (7j)</h3>
        <p class="card-value">{{ statistiques.nouveauxUtilisateurs7Jours }}</p>
      </div>
    </div>
  </div>

  <!-- Header avec bouton -->
  <div class="page-header">
    <h1>👑 Administration</h1>
    <button class="btn btn-primary" (click)="openForm()">+ Créer un utilisateur</button>
  </div>

  <!-- Formulaire modal -->
  <div class="modal" *ngIf="showForm">
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ isEditing ? 'Modifier' : 'Créer' }} un utilisateur</h2>
        <button class="close-btn" (click)="closeForm()">×</button>
      </div>
      <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
        <div class="form-row">
          <div class="form-group">
            <label>Nom *</label>
            <input type="text" formControlName="nom" />
          </div>
          <div class="form-group">
            <label>Prénom *</label>
            <input type="text" formControlName="prenom" />
          </div>
        </div>
        <div class="form-group">
          <label>Email *</label>
          <input type="email" formControlName="email" />
        </div>
        <div class="form-group">
          <label>Mot de passe {{ isEditing ? '(laisser vide si inchangé)' : '*' }}</label>
          <div class="password-input">
            <input [type]="showPassword ? 'text' : 'password'" formControlName="motDePasse" />
            <button type="button" (click)="showPassword = !showPassword">👁️</button>
            <button type="button" class="btn btn-secondary" (click)="generatePassword()">🎲 Générer</button>
          </div>
        </div>
        <div class="form-group">
          <label>Rôle *</label>
          <select formControlName="role">
            <option [value]="userRoles.USER">👤 Employé</option>
            <option [value]="userRoles.ADMIN">👑 Administrateur</option>
          </select>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" (click)="closeForm()">Annuler</button>
          <button type="submit" class="btn btn-primary" [disabled]="userForm.invalid || isSubmitting">
            {{ isSubmitting ? 'Enregistrement...' : (isEditing ? 'Modifier' : 'Créer') }}
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- Filtres -->
  <div class="filters">
    <input type="text" placeholder="🔍 Rechercher..." [(ngModel)]="searchTerm" (input)="filterUtilisateurs()" />
    <select [(ngModel)]="selectedRole" (change)="filterUtilisateurs()">
      <option value="">Tous les rôles</option>
      <option [value]="userRoles.ADMIN">Administrateurs</option>
      <option [value]="userRoles.USER">Employés</option>
    </select>
  </div>

  <!-- Tableau -->
  <div class="users-table">
    <table *ngIf="filteredUtilisateurs.length > 0">
      <thead>
        <tr>
          <th>Utilisateur</th>
          <th>Email</th>
          <th>Rôle</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let user of filteredUtilisateurs">
          <td>
            <div class="user-info">
              <strong>{{ user.prenom }} {{ user.nom }}</strong>
            </div>
          </td>
          <td>{{ user.email }}</td>
          <td>
            <span class="role-badge" [style.background-color]="getRoleColor(user.role)">
              {{ getRoleIcon(user.role) }} {{ getRoleLabel(user.role) }}
            </span>
          </td>
          <td>
            <div class="actions">
              <button class="btn-icon" (click)="changeRole(user)" title="Changer le rôle">🔄</button>
              <button class="btn-icon" (click)="editUser(user)" title="Modifier">✏️</button>
              <button
                class="btn-icon btn-delete"
                (click)="deleteUser(user)"
                [disabled]="user.id === currentUser?.id"
                title="Supprimer">🗑️</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

### Styles SCSS (`admin-dashboard.component.scss`)

```scss
.admin-dashboard {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;

  .stats-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;

    .card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      display: flex;
      align-items: center;
      gap: 1rem;

      .card-icon {
        font-size: 2.5rem;
      }

      .card-value {
        font-size: 2rem;
        font-weight: 700;
        color: #1f2937;
        margin: 0;
      }

      &.card-admin { border-left: 4px solid #e91e63; }
      &.card-user { border-left: 4px solid #3b82f6; }
      &.card-new { border-left: 4px solid #10b981; }
    }
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .filters {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;

    input, select {
      padding: 0.75rem;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      &:focus {
        outline: none;
        border-color: #c2185b;
      }
    }

    input { flex: 1; }
  }

  .users-table {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    overflow: hidden;

    table {
      width: 100%;
      border-collapse: collapse;

      th {
        background: linear-gradient(135deg, #c2185b 0%, #e91e63 100%);
        color: white;
        padding: 1rem;
        text-align: left;
        font-weight: 600;
      }

      td {
        padding: 1rem;
        border-bottom: 1px solid #e5e7eb;
      }

      .role-badge {
        padding: 0.5rem 1rem;
        border-radius: 6px;
        color: white;
        font-weight: 600;
      }

      .actions {
        display: flex;
        gap: 0.5rem;

        button {
          padding: 0.5rem;
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 1.2rem;

          &:hover { transform: scale(1.1); }
          &:disabled { opacity: 0.3; cursor: not-allowed; }
        }
      }
    }
  }

  .password-input {
    display: flex;
    gap: 0.5rem;

    input { flex: 1; }
  }
}
```

### Routes (`app.routes.ts`)

Ajouter:
```typescript
{
  path: 'admin',
  loadComponent: () => import('./features/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent),
  canActivate: [adminGuard]
}
```

### Menu Header (`header.component.ts`)

Ajouter:
```html
<a routerLink="/admin" routerLinkActive="active" *ngIf="currentUser?.role === 'ADMIN'">
  <span class="icon">👑</span>
  Administration
</a>
```

## 🚀 Endpoints Backend Attendus

```
GET    /api/admin/utilisateurs        - Liste tous les utilisateurs
POST   /api/admin/utilisateurs        - Crée un utilisateur
GET    /api/admin/utilisateurs/:id    - Récupère un utilisateur
PUT    /api/admin/utilisateurs/:id    - Modifie un utilisateur
DELETE /api/admin/utilisateurs/:id    - Supprime un utilisateur
PUT    /api/admin/utilisateurs/:id/role - Change le rôle
GET    /api/admin/statistiques        - Statistiques
```

## ✅ Fonctionnalités Implémentées

- ✅ Statistiques en temps réel
- ✅ Création d'utilisateurs (employés/admins)
- ✅ Modification d'utilisateurs
- ✅ Suppression (sauf son propre compte)
- ✅ Changement de rôle (USER ↔ ADMIN)
- ✅ Génération de mot de passe temporaire
- ✅ Recherche par nom/prénom/email
- ✅ Filtre par rôle
- ✅ Protection par guard (ADMIN uniquement)
- ✅ Validation des formulaires
- ✅ Feedback utilisateur (notifications)

## 🔐 Sécurité

- Routes protégées par `adminGuard`
- Vérification `isAdmin()` avant actions
- Impossibilité de supprimer son propre compte
- Token JWT requis pour toutes les requêtes

---

**Le système d'administration est prêt à l'emploi !** 🎊
