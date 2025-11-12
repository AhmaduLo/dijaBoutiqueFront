import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { PaymentService } from '../../core/services/payment.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import {
  PlanInfo,
  PlanAbonnement,
  DevisePayment,
  SubscriptionStatusResponse
} from '../../core/models/payment.model';

/**
 * Page de paiement isolée (sans menu/header)
 * L'utilisateur doit obligatoirement payer avant d'accéder à l'application
 */
@Component({
  selector: 'app-payment-only',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="payment-only-page">
      <!-- Header minimaliste -->
      <div class="minimal-header">
        <div class="logo">
          <h1>✨ HeasyStock</h1>
          <p>Choisissez votre plan pour continuer</p>
        </div>
        <button class="btn-logout" (click)="logout()">
          🚪 Déconnexion
        </button>
      </div>

      <div class="payment-container">
        <!-- Message d'accueil -->
        <div class="welcome-message">
          <h2>🎉 Bienvenue {{ currentUserName }} !</h2>
          <p>Pour accéder à HeasyStock, veuillez choisir un plan d'abonnement.</p>
          <p class="info">💡 Vous pouvez choisir le plan qui correspond le mieux à vos besoins.</p>
        </div>

        <!-- Statut de l'abonnement -->
        <div class="subscription-status" *ngIf="subscriptionStatus">
          <div class="status-card status-expired">
            <div class="status-info">
              <div class="status-item">
                <label>Plan actuel:</label>
                <span class="plan-badge plan-gratuit">{{ subscriptionStatus.plan }}</span>
              </div>
              <div class="status-item">
                <label>Statut:</label>
                <span class="status-badge badge-danger">Paiement requis</span>
              </div>
            </div>
            <div class="status-message">
              <p>⚠️ Veuillez souscrire à un plan pour accéder à HeasyStock.</p>
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

        <!-- Liste des plans (sans formulaire de paiement) -->
        <div class="plans-section" *ngIf="!isProcessingPayment">
          <h2>Plans Disponibles</h2>
          <div class="plans-grid">
            <div class="plan-card" *ngFor="let plan of availablePlans"
                 [ngClass]="{
                   'plan-basic': plan.nom === 'BASIC',
                   'plan-pro': plan.nom === 'PREMIUM' || plan.nom === 'PRO',
                   'plan-enterprise': plan.nom === 'ENTREPRISE'
                 }">
              <div class="plan-badge" *ngIf="plan.nom === 'PREMIUM' || plan.nom === 'PRO'">Le plus populaire</div>
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
                  Choisir {{ plan.nom === 'PREMIUM' ? 'PRO' : plan.nom }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Formulaire de paiement Stripe -->
        <div class="payment-section" *ngIf="isProcessingPayment && selectedPlan">
          <div class="payment-card">
            <button class="btn-back" (click)="cancelPayment()">← Retour aux plans</button>

            <div class="payment-header">
              <h3>Paiement pour {{ selectedPlan.nom === 'PREMIUM' ? 'PRO' : selectedPlan.nom }}</h3>
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
      </div>
    </div>
  `,
  styles: [`
    .payment-only-page {
      min-height: 100vh;
      background: linear-gradient(to bottom, #f9fafb 0%, #ffffff 100%);
    }

    .minimal-header {
      background: white;
      border-bottom: 2px solid #e5e7eb;
      padding: 20px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .logo h1 {
      font-size: 28px;
      font-weight: 700;
      color: #1e40af;
      margin: 0 0 5px 0;
    }

    .logo p {
      margin: 0;
      font-size: 14px;
      color: #6b7280;
    }

    .btn-logout {
      padding: 10px 20px;
      background: white;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      color: #6b7280;
    }

    .btn-logout:hover {
      background: #f9fafb;
      border-color: #d1d5db;
    }

    .payment-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    .welcome-message {
      text-align: center;
      margin-bottom: 40px;
      padding: 30px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .welcome-message h2 {
      font-size: 32px;
      font-weight: 700;
      color: #1e40af;
      margin: 0 0 16px 0;
    }

    .welcome-message p {
      font-size: 16px;
      color: #4b5563;
      margin: 8px 0;
    }

    .welcome-message .info {
      font-size: 14px;
      color: #6b7280;
      font-style: italic;
    }

    .subscription-status {
      margin-bottom: 40px;
    }

    .status-card {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .status-expired {
      border-left: 4px solid #ef4444;
    }

    .status-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 16px;
    }

    .status-item label {
      display: block;
      font-weight: 600;
      color: #6b7280;
      margin-bottom: 5px;
      font-size: 14px;
    }

    .status-item span {
      font-size: 16px;
      color: #111827;
    }

    .plan-badge {
      padding: 4px 12px;
      border-radius: 4px;
      font-weight: 600;
      font-size: 14px;
    }

    .plan-gratuit {
      background: #d1d5db;
      color: #374151;
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 4px;
      font-weight: 600;
      font-size: 14px;
    }

    .badge-danger {
      background: #ef4444;
      color: white;
    }

    .status-message {
      background: #fef2f2;
      border: 1px solid #fecaca;
      padding: 12px;
      border-radius: 8px;
    }

    .status-message p {
      margin: 0;
      color: #991b1b;
      font-size: 14px;
    }

    .currency-selector {
      text-align: center;
      max-width: 300px;
      margin: 0 auto 40px;
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .currency-selector label {
      display: block;
      font-weight: 600;
      margin-bottom: 10px;
      color: #111827;
    }

    .form-control {
      width: 100%;
      padding: 10px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 16px;
    }

    .plans-section {
      margin-bottom: 40px;
    }

    .plans-section h2 {
      text-align: center;
      font-size: 28px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 32px 0;
    }

    .plans-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
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
      padding: 24px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
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
      color: #111827;
      margin: 0 0 16px 0;
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
      color: #6b7280;
      margin-left: 4px;
    }

    .plan-description {
      text-align: center;
      color: #6b7280;
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
      color: #111827;
      font-size: 14px;
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }

    .check-icon {
      color: #10b981;
      font-weight: 700;
      flex-shrink: 0;
      font-size: 16px;
    }

    .plan-users {
      text-align: center;
      padding: 15px;
      background: #f3f4f6;
      border-radius: 8px;
      color: #111827;
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
      position: relative;
    }

    .btn-back {
      position: absolute;
      top: 20px;
      left: 20px;
      padding: 8px 16px;
      background: white;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      color: #6b7280;
    }

    .btn-back:hover {
      background: #f9fafb;
      border-color: #d1d5db;
    }

    .payment-header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #f3f4f6;
      margin-top: 20px;
    }

    .payment-header h3 {
      font-size: 24px;
      color: #111827;
      margin: 0 0 15px 0;
    }

    .payment-amount {
      font-size: 32px;
      font-weight: 700;
      color: #1e40af;
    }

    .payment-form {
      margin-bottom: 30px;
    }

    .stripe-card-element {
      padding: 15px;
      border: 2px solid #d1d5db;
      border-radius: 8px;
      background: white;
    }

    .card-errors {
      color: #ef4444;
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
      color: #6b7280;
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
      background: #1e40af;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #1e3a8a;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);
    }

    .btn-secondary {
      background: #9ca3af;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #6b7280;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `]
})
export class PaymentOnlyComponent implements OnInit {
  availablePlans: PlanInfo[] = [];
  selectedPlan: PlanInfo | null = null;
  selectedCurrency: DevisePayment = DevisePayment.EUR;
  isProcessingPayment = false;
  isProcessing = false;
  paymentError = '';
  subscriptionStatus: SubscriptionStatusResponse | null = null;
  currentUserName = '';

  private stripe: Stripe | null = null;
  private cardElement: StripeCardElement | null = null;
  private elements: StripeElements | null = null;

  constructor(
    private paymentService: PaymentService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadSubscriptionStatus();
    this.loadAvailablePlans();
  }

  /**
   * Charge les informations de l'utilisateur connecté
   */
  private loadCurrentUser(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUserName = user.prenom;
      }
    });
  }

  /**
   * Charge le statut d'abonnement
   */
  private loadSubscriptionStatus(): void {
    this.paymentService.getSubscriptionStatus().subscribe({
      next: (status) => {
        this.subscriptionStatus = status;

        // Si l'abonnement est actif, rediriger vers le dashboard
        if (status.actif) {
          this.notificationService.success('Votre abonnement est actif !');
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement du statut:', error);
      }
    });
  }

  /**
   * Charge les plans disponibles
   */
  private loadAvailablePlans(): void {
    this.paymentService.getAvailablePlans().subscribe({
      next: (plans) => {
        if (plans && typeof plans === 'object' && !Array.isArray(plans)) {
          const plansArray = Object.entries(plans).map(([key, value]: [string, any]) => ({
            nom: key as PlanAbonnement,
            prixEUR: value.prixEuro,
            prixXOF: value.prixCFA,
            maxUtilisateurs: value.maxUtilisateurs,
            description: value.description,
            fonctionnalites: this.getFonctionnalitesByPlan(key as PlanAbonnement)
          }));

          this.availablePlans = plansArray;
        } else if (Array.isArray(plans)) {
          this.availablePlans = plans;
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des plans:', error);
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
          'Dashboard et rapports',
          'Export PDF et Excel',
          'Support par email'
        ];
      case PlanAbonnement.PRO:
      case 'PREMIUM' as any:
        return [
          'Toutes les fonctionnalités Basic',
          'Rapports avancés',
          'Gestion multi-boutiques',
          'Support prioritaire'
        ];
      case PlanAbonnement.ENTREPRISE:
        return [
          'Toutes les fonctionnalités Pro',
          'Support téléphonique 24/7',
          'Personnalisation avancée',
          'Formation sur site'
        ];
      default:
        return [];
    }
  }

  /**
   * Charge les plans statiques (fallback)
   */
  private loadStaticPlans(): void {
    this.availablePlans = [
      {
        nom: PlanAbonnement.BASIC,
        prixEUR: 9.99,
        prixXOF: 6555,
        maxUtilisateurs: 3,
        description: 'Idéal pour les petites boutiques',
        fonctionnalites: this.getFonctionnalitesByPlan(PlanAbonnement.BASIC)
      },
      {
        nom: PlanAbonnement.PRO,
        prixEUR: 15.24,
        prixXOF: 10000,
        maxUtilisateurs: 10,
        description: 'Pour les boutiques en croissance',
        fonctionnalites: this.getFonctionnalitesByPlan(PlanAbonnement.PRO)
      },
      {
        nom: PlanAbonnement.ENTREPRISE,
        prixEUR: 22.87,
        prixXOF: 15000,
        maxUtilisateurs: 999,
        description: 'Solution complète pour les grandes entreprises',
        fonctionnalites: this.getFonctionnalitesByPlan(PlanAbonnement.ENTREPRISE)
      }
    ];
  }

  /**
   * Sélectionne un plan et initialise le paiement
   */
  async selectPlan(plan: PlanInfo): Promise<void> {
    this.selectedPlan = plan;
    this.isProcessingPayment = true;

    try {
      const config = await this.paymentService.getStripeConfig().toPromise();
      let stripePublicKey: string;

      if (config && config.publicKey) {
        stripePublicKey = config.publicKey;
      } else {
        stripePublicKey = 'pk_test_51QGbOy05YzugGAb1O3gkO3GzRB8OZKExMKU4MKGk4vCgJNYu7RKQ75eR6BuCMmqn1hWOWqOdgBm2pUswfqkONSDd00FWBeDhwB';
      }

      this.stripe = await loadStripe(stripePublicKey);
      if (!this.stripe) {
        throw new Error('Erreur lors du chargement de Stripe');
      }

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
          color: '#111827',
          '::placeholder': {
            color: '#9ca3af'
          }
        },
        invalid: {
          color: '#ef4444'
        }
      }
    });

    const cardElementContainer = document.getElementById('card-element');
    if (cardElementContainer) {
      this.cardElement.mount('#card-element');
    }

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
      const paymentIntentResponse = await this.paymentService.createPaymentIntent({
        plan: this.selectedPlan.nom,
        devise: this.selectedCurrency
      }).toPromise();

      if (!paymentIntentResponse) {
        throw new Error('Erreur lors de la création du paiement');
      }

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
        // Confirmer le paiement côté backend
        const request = {
          paymentIntentId: paymentIntent.id,
          plan: this.selectedPlan.nom
        };

        this.paymentService.confirmPaymentSuccess(request).subscribe({
          next: () => {
            this.notificationService.success('Paiement réussi ! Votre abonnement a été activé.');

            // Rediriger vers le dashboard
            setTimeout(() => {
              this.router.navigate(['/dashboard']);
            }, 1500);
          },
          error: (err: any) => {
            this.notificationService.error(err.message || 'Erreur lors de l\'activation de l\'abonnement');
            this.isProcessing = false;
          }
        });
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
   * Déconnexion
   */
  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Erreur lors de la déconnexion:', error);
        this.router.navigate(['/login']);
      }
    });
  }
}
