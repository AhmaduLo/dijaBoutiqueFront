import { Routes } from '@angular/router';
import { authGuard, guestGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  // Routes d'authentification (accessibles uniquement si non connecté)
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent),
    canActivate: [guestGuard]
  },
  // Routes protégées (nécessitent une authentification)
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'achats',
    loadComponent: () => import('./features/achats/achats.component').then(m => m.AchatsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'ventes',
    loadComponent: () => import('./features/ventes/ventes.component').then(m => m.VentesComponent),
    canActivate: [authGuard]
  },
  {
    path: 'depenses',
    loadComponent: () => import('./features/depenses/depenses.component').then(m => m.DepensesComponent),
    canActivate: [authGuard]
  },
  {
    path: 'rapports',
    loadComponent: () => import('./features/rapports/rapports.component').then(m => m.RapportsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'stock',
    loadComponent: () => import('./features/stock/stock-dashboard.component').then(m => m.StockDashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [adminGuard]
  },
  // Redirection par défaut
  {
    path: '**',
    redirectTo: '/login'
  }
];
