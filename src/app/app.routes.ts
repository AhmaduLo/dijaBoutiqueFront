import { Routes } from '@angular/router';
import { authGuard, guestGuard, adminGuard, adminOrGerantGuard } from './core/guards/auth.guard';

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
  // Route publique de tarification et paiement (AVANT inscription)
  {
    path: 'pricing',
    loadComponent: () => import('./features/pricing/pricing.component').then(m => m.PricingComponent)
  },
  // Route de paiement isolée (page dédiée sans menu - OBLIGATOIRE après connexion si plan GRATUIT)
  {
    path: 'payment',
    loadComponent: () => import('./features/payment-only/payment-only.component').then(m => m.PaymentOnlyComponent),
    canActivate: [authGuard]
  },
  // Route d'abonnement (accessible aux utilisateurs authentifiés)
  {
    path: 'subscription',
    loadComponent: () => import('./features/subscription/subscription.component').then(m => m.SubscriptionComponent),
    canActivate: [authGuard]
  },
  // Routes protégées (nécessitent une authentification)
  // Routes ADMIN uniquement (Administration)
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [adminGuard]
  },
  // Routes ADMIN + GERANT (Dashboard, Achats, Dépenses, Rapports)
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [adminOrGerantGuard]
  },
  {
    path: 'achats',
    loadComponent: () => import('./features/achats/achats.component').then(m => m.AchatsComponent),
    canActivate: [adminOrGerantGuard]
  },
  {
    path: 'depenses',
    loadComponent: () => import('./features/depenses/depenses.component').then(m => m.DepensesComponent),
    canActivate: [adminOrGerantGuard]
  },
  {
    path: 'rapports',
    loadComponent: () => import('./features/rapports/rapports.component').then(m => m.RapportsComponent),
    canActivate: [adminOrGerantGuard]
  },
  // Routes accessibles par USER + GERANT + ADMIN (Ventes, Stock, Contact)
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
  {
    path: 'contact',
    loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent),
    canActivate: [adminGuard]
  },
  // Redirection par défaut
  {
    path: '**',
    redirectTo: '/login'
  }
];
