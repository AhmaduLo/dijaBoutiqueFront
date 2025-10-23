import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/auth.model';

/**
 * Composant d'en-tête de l'application
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <h1>✨ Dija Boutique</h1>
          <p class="subtitle">Gestion d'accessoires féminins</p>
        </div>
        <nav class="nav-menu" *ngIf="isAuthenticated">
          <a routerLink="/dashboard" routerLinkActive="active">
            <span class="icon">📊</span>
            Tableau de bord
          </a>
          <a routerLink="/achats" routerLinkActive="active">
            <span class="icon">🛒</span>
            Achats
          </a>
          <a routerLink="/ventes" routerLinkActive="active">
            <span class="icon">💰</span>
            Ventes
          </a>
          <a routerLink="/depenses" routerLinkActive="active">
            <span class="icon">💳</span>
            Dépenses
          </a>
          <a routerLink="/stock" routerLinkActive="active">
            <span class="icon">📦</span>
            Stock
          </a>
          <a routerLink="/rapports" routerLinkActive="active">
            <span class="icon">📈</span>
            Rapports
          </a>
        </nav>
        <div class="user-info" *ngIf="isAuthenticated && currentUser">
          <span class="user-name">👤 {{ currentUser.prenom }} {{ currentUser.nom }}</span>
          <button class="btn-logout" (click)="logout()" title="Se déconnecter">
            🚪 Déconnexion
          </button>
        </div>
        <div class="auth-links" *ngIf="!isAuthenticated">
          <a routerLink="/login" class="btn-link">Connexion</a>
          <a routerLink="/register" class="btn-link btn-primary">Inscription</a>
        </div>
      </div>
    </header>
  `,
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  isAuthenticated = false;
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // S'abonner aux changements d'utilisateur
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAuthenticated = !!user;
    });
  }

  logout(): void {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
}
