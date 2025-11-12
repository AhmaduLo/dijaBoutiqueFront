import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { PaymentService } from '../../core/services/payment.service';
import { NotificationService } from '../../core/services/notification.service';
import {
  PlanInfo,
  PlanAbonnement,
  DevisePayment
} from '../../core/models/payment.model';

/**
 * Composant public de tarification et paiement (AVANT inscription)
 */
@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="pricing-page">
      <div class="page-header">
        <h1>Choisissez votre Plan</h1>
        <p>Payez d'abord, créez votre compte ensuite</p>
      </div>

      <!-- Message explicatif -->
      <div class="info-banner">
        <div class="info-content">
          <span class="info-icon">ℹ️</span>
          <div>
            <strong>Comment ça marche ?</strong>
            <p>1. Choisissez votre plan et effectuez le paiement → 2. Créez votre compte avec accès immédiat</p>
          </div>
        </div>
      </div>

      <!-- Sélecteur de devise -->
      <div class="currency-selector" *ngIf="!isProcessingPayment">
        <label>Devise de paiement:</label>
        <select [(ngModel)]="selectedCurrency" class="form-control">
          <option value="EUR">Euro (€)</option>
          <option value="XOF">Franc CFA (CFA)</option>
        </select>
      </div>

      <!-- Liste des plans disponibles -->
      <div class="plans-section" *ngIf="!isProcessingPayment">
        <div class="plans-grid">
          <div class="plan-card" *ngFor="let plan of availablePlans"
               [ngClass]="{
                 'plan-basic': plan.nom === 'BASIC',
                 'plan-pro': plan.nom === 'PRO' || plan.nom === 'PREMIUM',
                 'plan-enterprise': plan.nom === 'ENTREPRISE'
               }">
            <div class="plan-badge" *ngIf="plan.nom === 'PRO' || plan.nom === 'PREMIUM'">Le plus populaire</div>
            <div class="plan-header">
              <h3>{{ plan.nom === 'PREMIUM' ? 'PRO' : plan.nom }}</h3>
              <div class="plan-price">
                <span class="price" *ngIf="selectedCurrency === 'EUR'">{{ plan.prixEUR }}€</span>
                <span class="price" *ngIf="selectedCurrency === 'XOF'">{{ plan.prixXOF }} CFA</span>
                <span class="period">/mois</span>
              </div>
            </div>
            <div class="plan-body">
              <p class="plan-description">{{ plan.description }}</p>
              <ul class="plan-features">
                <li *ngFor="let feature of plan.fonctionnalites">
                  <span class="check-icon">✓</span> {{ feature }}
                </li>
              </ul>
              <div class="plan-users">
                <strong>{{ plan.maxUtilisateurs }}</strong> utilisateur(s) maximum
              </div>
            </div>
            <div class="plan-footer">
              <button
                class="btn btn-primary"
                (click)="selectPlan(plan)"
                [disabled]="isProcessing">
                Choisir {{ plan.nom }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Formulaire de paiement Stripe -->
      <div class="payment-section" *ngIf="isProcessingPayment && selectedPlan">
        <div class="payment-card">
          <div class="payment-header">
            <h3>Paiement pour {{ selectedPlan.nom }}</h3>
            <div class="payment-amount">
              <span *ngIf="selectedCurrency === 'EUR'">{{ selectedPlan.prixEUR }}€</span>
              <span *ngIf="selectedCurrency === 'XOF'">{{ selectedPlan.prixXOF }} CFA</span>
              <span class="period">/mois</span>
            </div>
          </div>

          <div class="payment-form">
            <div id="card-element" class="stripe-card-element"></div>
            <div id="card-errors" class="card-errors" *ngIf="paymentError">
              {{ paymentError }}
            </div>
          </div>

          <div class="payment-actions">
            <button class="btn btn-secondary" (click)="cancelPayment()" [disabled]="isProcessing">
              Annuler
            </button>
            <button class="btn btn-primary" (click)="processPayment()" [disabled]="isProcessing">
              <span *ngIf="!isProcessing">Payer maintenant</span>
              <span *ngIf="isProcessing">Traitement en cours...</span>
            </button>
          </div>

          <div class="payment-security">
            <p>🔒 Paiement sécurisé par Stripe</p>
          </div>
        </div>
      </div>

      <!-- Lien retour -->
      <div class="back-link">
        <a (click)="goToHome()" class="link-button">← Retour à l'accueil</a>
      </div>
    </div>
  `,
  styles: [`
    .pricing-page {
      min-height: 100vh;
      background: linear-gradient(to bottom, #f9fafb 0%, #ffffff 100%);
      padding: 40px 20px;
    }

    .page-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .page-header h1 {
      font-size: 36px;
      font-weight: 700;
      color: #2c3e50;
      margin: 0 0 10px 0;
    }

    .page-header p {
      font-size: 18px;
      color: #7f8c8d;
      margin: 0;
    }

    .info-banner {
      max-width: 800px;
      margin: 0 auto 40px;
      background: #e3f2fd;
      border: 2px solid #2196f3;
      border-radius: 8px;
      padding: 20px;
    }

    .info-content {
      display: flex;
      gap: 15px;
      align-items: flex-start;
    }

    .info-icon {
      font-size: 24px;
    }

    .info-content strong {
      display: block;
      color: #1976d2;
      margin-bottom: 5px;
    }

    .info-content p {
      margin: 0;
      color: #424242;
      font-size: 14px;
    }

    .currency-selector {
      text-align: center;
      max-width: 300px;
      margin: 0 auto 40px;
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .currency-selector label {
      display: block;
      font-weight: 600;
      margin-bottom: 10px;
      color: #2c3e50;
    }

    .form-control {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
    }

    .plans-section {
      max-width: 1200px;
      margin: 0 auto;
    }

    .plans-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 32px;
      max-width: 1100px;
      margin: 0 auto;
    }

    @media (max-width: 1024px) {
      .plans-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .plans-grid {
        grid-template-columns: 1fr;
        max-width: 400px;
      }
    }

    .plan-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      padding: 30px;
      transition: all 0.3s ease;
      position: relative;
      border: 3px solid transparent;
    }

    .plan-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }

    .plan-basic {
      border-color: #3b82f6;
    }

    .plan-pro {
      border-color: #f59e0b;
    }

    .plan-enterprise {
      border-color: #8b5cf6;
    }

    .plan-badge {
      position: absolute;
      top: -12px;
      left: 50%;
      transform: translateX(-50%);
      background: #f59e0b;
      color: white;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
    }

    .plan-header h3 {
      font-size: 24px;
      font-weight: 700;
      color: #2c3e50;
      margin: 0 0 15px 0;
      text-align: center;
    }

    .plan-price {
      text-align: center;
      margin-bottom: 20px;
    }

    .plan-price .price {
      font-size: 36px;
      font-weight: 800;
      color: #1e40af;
    }

    .plan-price .period {
      font-size: 14px;
      color: #7f8c8d;
    }

    .plan-description {
      text-align: center;
      color: #7f8c8d;
      font-size: 14px;
      margin-bottom: 20px;
      min-height: 40px;
    }

    .plan-features {
      list-style: none;
      padding: 0;
      margin: 0 0 20px 0;
    }

    .plan-features li {
      padding: 8px 0;
      color: #2c3e50;
      font-size: 14px;
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }

    .check-icon {
      color: #27ae60;
      font-weight: 700;
      flex-shrink: 0;
    }

    .plan-users {
      text-align: center;
      padding: 15px;
      background: #ecf0f1;
      border-radius: 4px;
      color: #2c3e50;
      margin-bottom: 20px;
    }

    .plan-footer .btn {
      width: 100%;
    }

    .payment-section {
      max-width: 600px;
      margin: 40px auto;
    }

    .payment-card {
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }

    .payment-header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #ecf0f1;
    }

    .payment-header h3 {
      font-size: 24px;
      color: #2c3e50;
      margin: 0 0 15px 0;
    }

    .payment-amount {
      font-size: 32px;
      font-weight: 700;
      color: #667eea;
    }

    .payment-form {
      margin-bottom: 30px;
    }

    .stripe-card-element {
      padding: 15px;
      border: 2px solid #ddd;
      border-radius: 8px;
      background: white;
    }

    .card-errors {
      color: #e74c3c;
      margin-top: 10px;
      font-size: 14px;
    }

    .payment-actions {
      display: flex;
      gap: 15px;
      justify-content: center;
    }

    .payment-security {
      margin-top: 20px;
      text-align: center;
      color: #7f8c8d;
      font-size: 14px;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 16px;
      transition: all 0.3s ease;
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #5568d3;
      transform: translateY(-2px);
    }

    .btn-secondary {
      background: #95a5a6;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #7f8c8d;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .back-link {
      text-align: center;
      margin-top: 40px;
    }

    .link-button {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
      cursor: pointer;
    }

    .link-button:hover {
      text-decoration: underline;
    }
  `]
})
export class PricingComponent implements OnInit {
  availablePlans: PlanInfo[] = [];
  selectedPlan: PlanInfo | null = null;
  selectedCurrency: DevisePayment = DevisePayment.EUR;
  isProcessingPayment = false;
  isProcessing = false;
  paymentError = '';
  paymentIntentId = '';

  private stripe: Stripe | null = null;
  private cardElement: StripeCardElement | null = null;
  private elements: StripeElements | null = null;

  constructor(
    private paymentService: PaymentService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAvailablePlans();
  }

  /**
   * Charge les plans disponibles
   */
  private loadAvailablePlans(): void {
    this.paymentService.getAvailablePlans().subscribe({
      next: (plans) => {
        // L'API retourne un objet { "BASIC": {...}, "PREMIUM": {...} }
        // On doit le convertir en tableau
        if (plans && typeof plans === 'object' && !Array.isArray(plans)) {
          // Convertir l'objet en tableau
          const plansArray = Object.entries(plans).map(([key, value]: [string, any]) => ({
            nom: key as PlanAbonnement,
            prixEUR: value.prixEuro,
            prixXOF: value.prixCFA,
            maxUtilisateurs: value.maxUtilisateurs,
            description: value.description,
            fonctionnalites: this.getFonctionnalitesByPlan(key as PlanAbonnement)
          }));

          // Tous les plans sont maintenant payants (pas de plan GRATUIT)
          this.availablePlans = plansArray;
        } else if (Array.isArray(plans)) {
          // Si c'est déjà un tableau (comportement alternatif de l'API)
          this.availablePlans = plans;
        } else {
          throw new Error('Format de réponse inattendu');
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des plans depuis l\'API:', error);
        // Charger les plans statiques en fallback
        this.loadStaticPlans();
      }
    });
  }

  /**
   * Retourne les fonctionnalités selon le plan
   */
  private getFonctionnalitesByPlan(plan: PlanAbonnement): string[] {
    switch (plan) {
      case PlanAbonnement.BASIC:
        return [
          'Gestion complète des ventes',
          'Gestion du stock en temps réel',
          'Gestion des achats et fournisseurs',
          'Suivi des dépenses',
          'Dashboard et rapports',
          'Export PDF et Excel',
          'Multi-devises',
          'Support par email'
        ];
      case PlanAbonnement.PRO:
      case 'PREMIUM' as any:
        return [
          'Toutes les fonctionnalités Basic',
          'Rapports avancés',
          'Analyses détaillées',
          'Gestion multi-boutiques',
          'API d\'intégration',
          'Sauvegarde automatique',
          'Support prioritaire',
          'Formation en ligne'
        ];
      case PlanAbonnement.ENTREPRISE:
        return [
          'Toutes les fonctionnalités Pro',
          'Support téléphonique 24/7',
          'Gestionnaire de compte dédié',
          'Personnalisation avancée',
          'Formation sur site',
          'SLA garanti 99.9%',
          'Sauvegardes quotidiennes',
          'Intégrations personnalisées'
        ];
      default:
        return [];
    }
  }

  /**
   * Charge les plans statiques (fallback si l'API n'est pas accessible)
   */
  private loadStaticPlans(): void {
    this.availablePlans = [
      {
        nom: PlanAbonnement.BASIC,
        prixEUR: 9.99,
        prixXOF: 6555,
        maxUtilisateurs: 3,
        description: 'Idéal pour les petites boutiques et commerces',
        fonctionnalites: [
          'Gestion complète des ventes',
          'Gestion du stock en temps réel',
          'Gestion des achats et fournisseurs',
          'Suivi des dépenses',
          'Dashboard et rapports',
          'Export PDF et Excel',
          'Multi-devises',
          'Support par email'
        ]
      },
      {
        nom: PlanAbonnement.PRO,
        prixEUR: 19.99,
        prixXOF: 13110,
        maxUtilisateurs: 10,
        description: 'Pour les boutiques en croissance avec plusieurs employés',
        fonctionnalites: [
          'Toutes les fonctionnalités Basic',
          'Rapports avancés',
          'Analyses détaillées',
          'Gestion multi-boutiques',
          'API d\'intégration',
          'Sauvegarde automatique',
          'Support prioritaire',
          'Formation en ligne'
        ]
      },
      {
        nom: PlanAbonnement.ENTREPRISE,
        prixEUR: 49.99,
        prixXOF: 32775,
        maxUtilisateurs: 999,
        description: 'Solution complète pour les grandes entreprises',
        fonctionnalites: [
          'Toutes les fonctionnalités Pro',
          'Support téléphonique 24/7',
          'Gestionnaire de compte dédié',
          'Personnalisation avancée',
          'Formation sur site',
          'SLA garanti 99.9%',
          'Sauvegardes quotidiennes',
          'Intégrations personnalisées'
        ]
      }
    ];
  }

  /**
   * Sélectionne un plan et initialise le paiement
   */
  async selectPlan(plan: PlanInfo): Promise<void> {
    this.selectedPlan = plan;
    this.isProcessingPayment = true;

    // Charger Stripe
    try {
      let stripePublicKey: string;

      try {
        const config = await this.paymentService.getStripeConfig().toPromise();
        if (config && config.publicKey) {
          stripePublicKey = config.publicKey;
        } else {
          throw new Error('Configuration non disponible');
        }
      } catch (error) {
        // Si l'API n'est pas accessible (403), utiliser la clé de test Stripe
        console.warn('API Stripe config non accessible, utilisation de la clé de test');
        // IMPORTANT: Remplacer par votre vraie clé publique Stripe en production
        stripePublicKey = 'pk_test_51QGbOy05YzugGAb1O3gkO3GzRB8OZKExMKU4MKGk4vCgJNYu7RKQ75eR6BuCMmqn1hWOWqOdgBm2pUswfqkONSDd00FWBeDhwB';
      }

      this.stripe = await loadStripe(stripePublicKey);
      if (!this.stripe) {
        throw new Error('Erreur lors du chargement de Stripe');
      }

      // Attendre que l'élément DOM soit disponible
      setTimeout(() => {
        this.initializeStripeElements();
      }, 100);
    } catch (error: any) {
      console.error('Erreur lors de l\'initialisation de Stripe:', error);
      this.notificationService.error('Erreur lors de l\'initialisation du paiement');
      this.cancelPayment();
    }
  }

  /**
   * Initialise les éléments Stripe
   */
  private initializeStripeElements(): void {
    if (!this.stripe) return;

    this.elements = this.stripe.elements();
    this.cardElement = this.elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#2c3e50',
          '::placeholder': {
            color: '#aab7c4'
          }
        },
        invalid: {
          color: '#e74c3c'
        }
      }
    });

    const cardElementContainer = document.getElementById('card-element');
    if (cardElementContainer) {
      this.cardElement.mount('#card-element');
    }

    // Écouter les erreurs de saisie
    this.cardElement.on('change', (event) => {
      if (event.error) {
        this.paymentError = event.error.message;
      } else {
        this.paymentError = '';
      }
    });
  }

  /**
   * Traite le paiement
   */
  async processPayment(): Promise<void> {
    if (!this.stripe || !this.cardElement || !this.selectedPlan) {
      this.notificationService.error('Erreur: formulaire de paiement non initialisé');
      return;
    }

    this.isProcessing = true;
    this.paymentError = '';

    try {
      // 1. Créer un PaymentIntent
      const paymentIntentResponse = await this.paymentService.createPaymentIntent({
        plan: this.selectedPlan.nom,
        devise: this.selectedCurrency
      }).toPromise();

      if (!paymentIntentResponse) {
        throw new Error('Erreur lors de la création du paiement');
      }

      // 2. Confirmer le paiement avec Stripe
      const { error, paymentIntent } = await this.stripe.confirmCardPayment(
        paymentIntentResponse.clientSecret,
        {
          payment_method: {
            card: this.cardElement
          }
        }
      );

      if (error) {
        this.paymentError = error.message || 'Erreur lors du paiement';
        this.notificationService.error(this.paymentError);
        this.isProcessing = false;
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Stocker l'ID du paiement pour l'utiliser lors de l'inscription
        this.paymentIntentId = paymentIntent.id;

        // Notification de succès
        this.notificationService.success('Paiement réussi ! Créez maintenant votre compte.');

        // Rediriger vers la page d'inscription avec les infos du paiement
        setTimeout(() => {
          this.router.navigate(['/register'], {
            queryParams: {
              paymentIntentId: paymentIntent.id,
              plan: this.selectedPlan?.nom
            }
          });
        }, 1500);
      }
    } catch (error: any) {
      console.error('Erreur lors du paiement:', error);
      this.paymentError = error.error?.message || 'Erreur lors du traitement du paiement';
      this.notificationService.error(this.paymentError);
      this.isProcessing = false;
    }
  }

  /**
   * Annule le processus de paiement
   */
  cancelPayment(): void {
    this.isProcessingPayment = false;
    this.selectedPlan = null;
    this.paymentError = '';

    if (this.cardElement) {
      this.cardElement.destroy();
      this.cardElement = null;
    }

    this.elements = null;
  }

  /**
   * Retour à l'accueil
   */
  goToHome(): void {
    this.router.navigate(['/']);
  }
}
