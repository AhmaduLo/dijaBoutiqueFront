import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './shared/components/header/header.component';
import { NotificationComponent } from './shared/components/notification/notification.component';
import { UpgradeModalComponent } from './shared/components/upgrade-modal/upgrade-modal.component';
import { ConfirmModalComponent } from './shared/components/confirm-modal/confirm-modal.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, HeaderComponent, NotificationComponent, UpgradeModalComponent, ConfirmModalComponent],
  template: `
    <app-header *ngIf="!isPaymentPage"></app-header>
    <app-notification></app-notification>
    <app-upgrade-modal></app-upgrade-modal>
    <app-confirm-modal></app-confirm-modal>
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
  `,
  styleUrl: './app.scss'
})
export class App implements OnInit {
  isPaymentPage = false;

  constructor(private router: Router) {
    // Écouter les changements de route pour détecter la page de paiement
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.checkIfPaymentPage(event.urlAfterRedirects);
    });
  }

  ngOnInit(): void {
    // Vérifier l'URL au chargement initial
    this.checkIfPaymentPage(this.router.url);
  }

  private checkIfPaymentPage(url: string): void {
    // Cacher le header sur les pages /payment ET /subscription
    // Ces deux pages ont leur propre header minimaliste ou doivent rediriger vers paiement
    this.isPaymentPage =
      url === '/payment' || url.startsWith('/payment?') || url.startsWith('/payment;') ||
      url === '/subscription' || url.startsWith('/subscription?') || url.startsWith('/subscription;');
  }
}
