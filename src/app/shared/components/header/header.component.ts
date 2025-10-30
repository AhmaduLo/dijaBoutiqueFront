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
          <h1>✨ {{ getCompanyName() }}</h1>
          <p class="subtitle" *ngIf="isAuthenticated">Gestion commerciale</p>
          <p class="subtitle" *ngIf="!isAuthenticated">Gestion d'accessoires féminins</p>
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
          <div class="user-menu" (click)="toggleUserMenu()">
            <span class="user-name">👤 {{ currentUser.prenom }} {{ currentUser.nom }}</span>
            <span class="dropdown-arrow">▼</span>
          </div>
          <div class="user-dropdown" *ngIf="showUserMenu">
            <a routerLink="/admin" *ngIf="isAdmin()" (click)="closeUserMenu()">
              <span class="icon">👑</span>
              Administration
            </a>
            <button class="dropdown-item" (click)="logout()">
              <span class="icon">🚪</span>
              Déconnexion
            </button>
          </div>
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
  showUserMenu = false;

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

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  closeUserMenu(): void {
    this.showUserMenu = false;
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  getCompanyName(): string {
    if (this.isAuthenticated && this.currentUser?.nomEntreprise) {
      return this.currentUser.nomEntreprise;
    }
    return 'Dija Boutique';
  }

  logout(): void {
    this.closeUserMenu();
    if (confirm('Êtes-vous sûr de vouloir vous déconnexter ?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
}
