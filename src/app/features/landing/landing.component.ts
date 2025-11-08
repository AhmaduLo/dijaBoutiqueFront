import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

/**
 * Composant de la page d'accueil (Landing page)
 * Présentation du site avant connexion/inscription
 */
@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="landing-page">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="container">
          <div class="hero-content">
            <h2 class="hero-title">
              Gérez votre boutique en toute simplicité
            </h2>
            <p class="hero-subtitle">
              Une solution complète pour la gestion de vos achats, ventes, stock et finances.
              Optimisez votre activité commerciale avec notre plateforme intuitive.
            </p>
            <div class="hero-actions">
              <button class="btn btn-large btn-primary" (click)="goToRegister()">
                Commencer maintenant
              </button>
              <button class="btn btn-large btn-payment" (click)="handlePayment()" disabled>
                Paiement
              </button>
            </div>
            <p class="small-text">Essai gratuit - Aucune carte bancaire requise</p>
          </div>

          <div class="hero-media">
            <div class="media-placeholder">
              <div class="placeholder-icon">📊</div>
              <p>Aperçu de l'application</p>
              <small>Vous pouvez ajouter une photo ou vidéo ici</small>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="features-section">
        <div class="container">
          <h2 class="section-title">Fonctionnalités principales</h2>
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">🛒</div>
              <h3>Gestion des achats</h3>
              <p>Suivez tous vos achats auprès de vos fournisseurs. Historique complet et statistiques détaillées.</p>
            </div>

            <div class="feature-card">
              <div class="feature-icon">💰</div>
              <h3>Gestion des ventes</h3>
              <p>Enregistrez vos ventes facilement. Visualisez vos revenus en temps réel avec des rapports détaillés.</p>
            </div>

            <div class="feature-card">
              <div class="feature-icon">📦</div>
              <h3>Gestion du stock</h3>
              <p>Contrôlez votre inventaire en temps réel. Recevez des alertes pour les produits en rupture de stock.</p>
            </div>

            <div class="feature-card">
              <div class="feature-icon">💸</div>
              <h3>Suivi des dépenses</h3>
              <p>Gérez toutes vos dépenses professionnelles. Catégorisez et analysez vos coûts opérationnels.</p>
            </div>

            <div class="feature-card">
              <div class="feature-icon">📈</div>
              <h3>Rapports détaillés</h3>
              <p>Tableaux de bord et rapports complets. Prenez des décisions éclairées grâce aux données.</p>
            </div>

            <div class="feature-card">
              <div class="feature-icon">🌍</div>
              <h3>Multi-devises</h3>
              <p>Gérez vos transactions en plusieurs devises. Conversion automatique et taux de change actualisés.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Benefits Section -->
      <section class="benefits-section">
        <div class="container">
          <h2 class="section-title">Pourquoi choisir notre solution ?</h2>
          <div class="benefits-list">
            <div class="benefit-item">
              <div class="benefit-icon">✅</div>
              <div class="benefit-content">
                <h3>Interface intuitive</h3>
                <p>Facile à utiliser, même sans formation technique</p>
              </div>
            </div>

            <div class="benefit-item">
              <div class="benefit-icon">🔒</div>
              <div class="benefit-content">
                <h3>Sécurité garantie</h3>
                <p>Vos données sont protégées avec un cryptage de niveau bancaire</p>
              </div>
            </div>

            <div class="benefit-item">
              <div class="benefit-icon">📱</div>
              <div class="benefit-content">
                <h3>Accès partout</h3>
                <p>Gérez votre boutique depuis n'importe quel appareil connecté</p>
              </div>
            </div>

            <div class="benefit-item">
              <div class="benefit-icon">⚡</div>
              <div class="benefit-content">
                <h3>Mises à jour en temps réel</h3>
                <p>Synchronisation instantanée de toutes vos données</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="cta-section">
        <div class="container">
          <div class="cta-content">
            <h2>Prêt à transformer votre gestion ?</h2>
            <p>Rejoignez les nombreux commerçants qui font confiance à notre plateforme</p>
            <div class="cta-actions">
              <button class="btn btn-large btn-white" (click)="goToRegister()">
                Créer un compte gratuit
              </button>
              <button class="btn btn-large btn-payment-white" (click)="handlePayment()" disabled>
                Accéder via paiement
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="landing-footer">
        <div class="container">
          <p>&copy; 2025 HeasyStock. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  `,
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {
  constructor(private router: Router) { }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  handlePayment(): void {
    // Fonction de paiement non implémentée pour l'instant
    alert('Le paiement n\'est pas encore disponible. Veuillez vous inscrire gratuitement pour commencer.');
  }
}
