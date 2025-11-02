import { Routes } from '@angular/router';
import { authGuard, guestGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Page d'accueil (Landing page)
  {
    path: '',
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent)
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
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'reset-password/:token',
    loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
    canActivate: [guestGuard]
  },
  // Routes protégées (nécessitent une authentification)
  // Routes ADMIN uniquement (Tableau de bord, Achats, Dépenses, Rapports)
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'achats',
    loadComponent: () => import('./features/achats/achats.component').then(m => m.AchatsComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'depenses',
    loadComponent: () => import('./features/depenses/depenses.component').then(m => m.DepensesComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'rapports',
    loadComponent: () => import('./features/rapports/rapports.component').then(m => m.RapportsComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [adminGuard]
  },
  // Routes accessibles par USER et ADMIN (Ventes, Stock)
  {
    path: 'ventes',
    loadComponent: () => import('./features/ventes/ventes.component').then(m => m.VentesComponent),
    canActivate: [authGuard]
  },
  {
    path: 'stock',
    loadComponent: () => import('./features/stock/stock-dashboard.component').then(m => m.StockDashboardComponent),
    canActivate: [authGuard]
  },
  // Redirection par défaut
  {
    path: '**',
    redirectTo: '/login'
  }
];
