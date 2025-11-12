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
              <button class="btn btn-large btn-primary" (click)="goToSubscription()">
                Découvrir nos Plans
              </button>
            </div>
            <p class="small-text">🔒 Paiement sécurisé par Stripe - Choisissez votre plan dès maintenant</p>
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

      <!-- Pricing Section -->
      <section class="pricing-section">
        <div class="container">
          <h2 class="section-title">Nos Plans d'Abonnement</h2>
          <p class="section-subtitle">Choisissez le plan qui correspond le mieux à vos besoins</p>

          <!-- Onglets de sélection des plans -->
          <div class="plan-tabs">
            <button
              class="plan-tab"
              [class.active]="selectedPlan === 'basic'"
              (click)="selectPlan('basic')">
              <span class="tab-icon">📦</span>
              <span class="tab-text">Basic</span>
            </button>
            <button
              class="plan-tab"
              [class.active]="selectedPlan === 'pro'"
              (click)="selectPlan('pro')">
              <span class="tab-icon">⭐</span>
              <span class="tab-text">Pro</span>
              <span class="popular-label">Populaire</span>
            </button>
            <button
              class="plan-tab"
              [class.active]="selectedPlan === 'entreprise'"
              (click)="selectPlan('entreprise')">
              <span class="tab-icon">🏢</span>
              <span class="tab-text">Entreprise</span>
            </button>
          </div>

          <!-- Carte du plan sélectionné -->
          <div class="pricing-card-container">
            <!-- Plan Basic -->
            <div class="pricing-card" *ngIf="selectedPlan === 'basic'">
              <div class="plan-header">
                <h3 class="plan-name">Plan Basic</h3>
                <div class="plan-price">
                  <span class="price">9,99€</span>
                  <span class="period">/ mois</span>
                </div>
                <div class="plan-price-alt">
                  <span class="price-alt">6 555 CFA / mois</span>
                </div>
                <p class="plan-description">Idéal pour les petites boutiques et commerces</p>
              </div>
              <div class="plan-body">
                <div class="plan-highlight">
                  <span class="highlight-icon">👥</span>
                  <span class="highlight-text">Jusqu'à <strong>3 utilisateurs</strong></span>
                </div>
                <ul class="plan-features">
                  <li><span class="check">✓</span> Gestion complète des ventes</li>
                  <li><span class="check">✓</span> Gestion du stock en temps réel</li>
                  <li><span class="check">✓</span> Gestion des achats et fournisseurs</li>
                  <li><span class="check">✓</span> Suivi des dépenses</li>
                  <li><span class="check">✓</span> Dashboard et rapports</li>
                  <li><span class="check">✓</span> Export PDF et Excel</li>
                  <li><span class="check">✓</span> Multi-devises</li>
                  <li><span class="check">✓</span> Support par email</li>
                </ul>
              </div>
              <div class="plan-footer">
                <button class="btn btn-plan btn-basic" (click)="goToSubscription()">
                  Choisir Basic
                </button>
              </div>
            </div>

            <!-- Plan Pro -->
            <div class="pricing-card" *ngIf="selectedPlan === 'pro'">
              <div class="plan-header">
                <div class="popular-badge">⭐ Le plus populaire</div>
                <h3 class="plan-name">Plan Pro</h3>
                <div class="plan-price">
                  <span class="price">15,24€</span>
                  <span class="period">/ mois</span>
                </div>
                <div class="plan-price-alt">
                  <span class="price-alt">10 000 CFA / mois</span>
                </div>
                <p class="plan-description">Pour les boutiques en croissance avec plusieurs employés</p>
              </div>
              <div class="plan-body">
                <div class="plan-highlight">
                  <span class="highlight-icon">👥</span>
                  <span class="highlight-text">Jusqu'à <strong>10 utilisateurs</strong></span>
                </div>
                <ul class="plan-features">
                  <li><span class="check">✓</span> Toutes les fonctionnalités Basic</li>
                  <li><span class="check">✓</span> Rapports avancés</li>
                  <li><span class="check">✓</span> Analyses détaillées</li>
                  <li><span class="check">✓</span> Gestion multi-boutiques</li>
                  <li><span class="check">✓</span> API d'intégration</li>
                  <li><span class="check">✓</span> Sauvegarde automatique</li>
                  <li><span class="check">✓</span> Support prioritaire</li>
                  <li><span class="check">✓</span> Formation en ligne</li>
                </ul>
              </div>
              <div class="plan-footer">
                <button class="btn btn-plan btn-pro" (click)="goToSubscription()">
                  Choisir Pro
                </button>
              </div>
            </div>

            <!-- Plan Entreprise -->
            <div class="pricing-card" *ngIf="selectedPlan === 'entreprise'">
              <div class="plan-header">
                <h3 class="plan-name">Plan Entreprise</h3>
                <div class="plan-price">
                  <span class="price">22,87€</span>
                  <span class="period">/ mois</span>
                </div>
                <div class="plan-price-alt">
                  <span class="price-alt">15 000 CFA / mois</span>
                </div>
                <p class="plan-description">Solution complète pour les grandes entreprises</p>
              </div>
              <div class="plan-body">
                <div class="plan-highlight">
                  <span class="highlight-icon">👥</span>
                  <span class="highlight-text"><strong>Utilisateurs illimités</strong></span>
                </div>
                <ul class="plan-features">
                  <li><span class="check">✓</span> Toutes les fonctionnalités Pro</li>
                  <li><span class="check">✓</span> Support téléphonique 24/7</li>
                  <li><span class="check">✓</span> Gestionnaire de compte dédié</li>
                  <li><span class="check">✓</span> Personnalisation avancée</li>
                  <li><span class="check">✓</span> Formation sur site</li>
                  <li><span class="check">✓</span> SLA garanti 99.9%</li>
                  <li><span class="check">✓</span> Sauvegardes quotidiennes</li>
                  <li><span class="check">✓</span> Intégrations personnalisées</li>
                </ul>
              </div>
              <div class="plan-footer">
                <button class="btn btn-plan btn-entreprise" (click)="goToSubscription()">
                  Choisir Entreprise
                </button>
              </div>
            </div>
          </div>

          <div class="pricing-note">
            <p><strong>⚡ Accès immédiat après paiement</strong> - Commencez à gérer votre boutique instantanément</p>
            <p>🔒 Paiement sécurisé par <strong>Stripe</strong> - Aucune donnée bancaire stockée</p>
            <p><strong>💡 Garantie satisfait ou remboursé</strong> - 30 jours pour changer d'avis</p>
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
                Créer un Compte
              </button>
              <button class="btn btn-large btn-outline-white" (click)="goToLogin()">
                Se Connecter
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
  selectedPlan: 'basic' | 'pro' | 'entreprise' = 'pro'; // Plan Pro sélectionné par défaut

  constructor(private router: Router) { }

  selectPlan(plan: 'basic' | 'pro' | 'entreprise'): void {
    this.selectedPlan = plan;
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  goToSubscription(): void {
    // Rediriger vers la page de tarification publique
    // L'utilisateur paie d'abord, puis s'inscrit
    this.router.navigate(['/pricing']);
  }
}
