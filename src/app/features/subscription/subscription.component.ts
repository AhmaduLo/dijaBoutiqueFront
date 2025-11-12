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
 * Composant de gestion des abonnements et paiements
 */
@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="subscription-page">
      <div class="page-header">
        <h1>Mon Abonnement</h1>
      </div>

      <!-- Statut de l'abonnement actuel -->
      <div class="subscription-status" *ngIf="subscriptionStatus">
        <div class="status-card" [ngClass]="{
          'status-active': subscriptionStatus.actif,
          'status-trial': !subscriptionStatus.actif && subscriptionStatus.joursRestants > 0,
          'status-expired': !subscriptionStatus.actif && subscriptionStatus.joursRestants <= 0
        }">
          <h2>Statut Actuel</h2>
          <div class="status-info">
            <div class="status-item">
              <label>Plan:</label>
              <span class="plan-badge">{{ subscriptionStatus.plan }}</span>
            </div>
            <div class="status-item">
              <label>Statut:</label>
              <span class="status-badge" [ngClass]="{
                'badge-success': subscriptionStatus.actif,
                'badge-danger': !subscriptionStatus.actif
              }">
                {{ subscriptionStatus.actif ? 'Actif' : 'Inactif - Paiement requis' }}
              </span>
            </div>
            <div class="status-item" *ngIf="subscriptionStatus.joursRestants > 0">
              <label>Jours restants:</label>
              <span class="days-remaining">{{ subscriptionStatus.joursRestants }} jour(s)</span>
            </div>
            <div class="status-item">
              <label>Date d'expiration:</label>
              <span>{{ formatDate(subscriptionStatus.dateExpiration) }}</span>
            </div>
          </div>
          <div class="status-message" *ngIf="subscriptionStatus.message">
            <p>{{ subscriptionStatus.message }}</p>
          </div>
        </div>
      </div>

      <!-- Message de paiement requis -->
      <div class="alert alert-danger" *ngIf="subscriptionStatus && !subscriptionStatus.actif">
        <strong>🔒 Paiement requis</strong>
        <p>Veuillez souscrire à un plan pour accéder à toutes les fonctionnalités de HeasyStock. Choisissez le plan qui correspond le mieux à vos besoins ci-dessous.</p>
      </div>

      <!-- Liste des plans disponibles -->
      <div class="plans-section" *ngIf="!isProcessingPayment">
        <h2>Plans Disponibles</h2>
        <div class="plans-grid">
          <div class="plan-card" *ngFor="let plan of availablePlans"
               [ngClass]="{ 'plan-current': plan.nom === subscriptionStatus?.plan }">
            <div class="plan-header">
              <h3>{{ plan.nom }}</h3>
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
                *ngIf="plan.nom !== subscriptionStatus?.plan"
                (click)="selectPlan(plan)"
                [disabled]="isProcessing">
                Choisir ce plan
              </button>
              <span class="current-plan-badge" *ngIf="plan.nom === subscriptionStatus?.plan">
                Plan actuel
              </span>
            </div>
          </div>
        </div>

        <!-- Sélecteur de devise -->
        <div class="currency-selector">
          <label>Devise de paiement:</label>
          <select [(ngModel)]="selectedCurrency" class="form-control">
            <option value="EUR">Euro (€)</option>
            <option value="XOF">Franc CFA (CFA)</option>
          </select>
        </div>
      </div>

      <!-- Formulaire de paiement Stripe -->
      <div class="payment-section" *ngIf="isProcessingPayment && selectedPlan">
        <h2>Paiement sécurisé</h2>
        <div class="payment-card">
          <div class="payment-header">
            <h3>{{ selectedPlan.nom }}</h3>
            <div class="payment-amount">
              <span *ngIf="selectedCurrency === 'EUR'">{{ selectedPlan.prixEUR }}€</span>
              <span *ngIf="selectedCurrency === 'XOF'">{{ selectedPlan.prixXOF }} CFA</span>
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
  `,
  styles: [`
    .subscription-page {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 30px;
    }

    .page-header h1 {
      font-size: 28px;
      font-weight: 600;
      color: #2c3e50;
    }

    .subscription-status {
      margin-bottom: 40px;
    }

    .status-card {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border-left: 4px solid #3498db;
    }

    .status-card.status-active {
      border-left-color: #27ae60;
    }

    .status-card.status-trial {
      border-left-color: #f39c12;
    }

    .status-card.status-expired {
      border-left-color: #e74c3c;
    }

    .status-card h2 {
      font-size: 20px;
      margin-bottom: 20px;
      color: #2c3e50;
    }

    .status-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 15px;
    }

    .status-item label {
      display: block;
      font-weight: 600;
      color: #7f8c8d;
      margin-bottom: 5px;
      font-size: 14px;
    }

    .status-item span {
      font-size: 16px;
      color: #2c3e50;
    }

    .plan-badge {
      background: #3498db;
      color: white;
      padding: 4px 12px;
      border-radius: 4px;
      font-weight: 600;
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 4px;
      font-weight: 600;
      font-size: 14px;
    }

    .badge-success {
      background: #27ae60;
      color: white;
    }

    .badge-warning {
      background: #f39c12;
      color: white;
    }

    .badge-danger {
      background: #e74c3c;
      color: white;
    }

    .days-remaining {
      font-weight: 600;
      color: #f39c12;
    }

    .status-message {
      margin-top: 15px;
      padding: 15px;
      background: #ecf0f1;
      border-radius: 4px;
    }

    .status-message p {
      margin: 0;
      color: #34495e;
    }

    .alert {
      padding: 15px;
      border-radius: 4px;
      margin-bottom: 30px;
    }

    .alert-danger {
      background: #fee;
      border: 1px solid #fcc;
      color: #c33;
    }

    .plans-section h2 {
      font-size: 24px;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 30px;
    }

    .plans-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .plan-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      transition: transform 0.2s;
    }

    .plan-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .plan-current {
      border: 2px solid #27ae60;
    }

    .plan-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      text-align: center;
    }

    .plan-header h3 {
      font-size: 22px;
      margin: 0 0 10px 0;
      font-weight: 600;
    }

    .plan-price {
      font-size: 32px;
      font-weight: 700;
    }

    .plan-price .period {
      font-size: 16px;
      font-weight: 400;
    }

    .plan-body {
      padding: 20px;
    }

    .plan-description {
      color: #7f8c8d;
      margin-bottom: 20px;
      font-size: 14px;
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
    }

    .check-icon {
      color: #27ae60;
      font-weight: 600;
      margin-right: 8px;
    }

    .plan-users {
      text-align: center;
      padding: 15px;
      background: #ecf0f1;
      border-radius: 4px;
      color: #2c3e50;
    }

    .plan-footer {
      padding: 20px;
      border-top: 1px solid #ecf0f1;
      text-align: center;
    }

    .current-plan-badge {
      display: inline-block;
      background: #27ae60;
      color: white;
      padding: 8px 16px;
      border-radius: 4px;
      font-weight: 600;
    }

    .currency-selector {
      text-align: center;
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

    .currency-selector select {
      max-width: 200px;
      margin: 0 auto;
    }

    .payment-section {
      margin-top: 40px;
    }

    .payment-section h2 {
      font-size: 24px;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 20px;
    }

    .payment-card {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      max-width: 500px;
      margin: 0 auto;
    }

    .payment-header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #ecf0f1;
    }

    .payment-header h3 {
      font-size: 20px;
      color: #2c3e50;
      margin-bottom: 10px;
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
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;
    }

    .card-errors {
      color: #e74c3c;
      margin-top: 10px;
      font-size: 14px;
    }

    .payment-actions {
      display: flex;
      gap: 10px;
      justify-content: center;
    }

    .payment-security {
      margin-top: 20px;
      text-align: center;
      color: #7f8c8d;
      font-size: 14px;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #5568d3;
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
  `]
})
export class SubscriptionComponent implements OnInit {
  subscriptionStatus: SubscriptionStatusResponse | null = null;
  availablePlans: PlanInfo[] = [];
  selectedPlan: PlanInfo | null = null;
  selectedCurrency: DevisePayment = DevisePayment.EUR;
  isProcessingPayment = false;
  isProcessing = false;
  paymentError = '';

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
    this.loadSubscriptionStatus();
    this.loadAvailablePlans();
  }

  /**
   * Charge le statut d'abonnement
   */
  private loadSubscriptionStatus(): void {
    this.paymentService.getSubscriptionStatus().subscribe({
      next: (status) => {
        this.subscriptionStatus = status;

        // Si l'abonnement n'est pas actif (plan GRATUIT ou expiré),
        // rediriger vers la page de paiement isolée
        if (!status.actif && status.plan === PlanAbonnement.GRATUIT) {
          this.notificationService.info('Veuillez choisir un plan pour accéder à HeasyStock.');
          this.router.navigate(['/payment']);
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement du statut:', error);
        this.notificationService.error('Erreur lors du chargement du statut d\'abonnement');
      }
    });
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
          console.error('Format de réponse inattendu:', plans);
          this.availablePlans = [];
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des plans:', error);
        this.notificationService.error('Erreur lors du chargement des plans');
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
          'Rapports globaux (Excel/PDF)',
          'Multi-devises',
          'Support par email'
        ];
      case PlanAbonnement.PRO:
      case PlanAbonnement.PREMIUM:
        return [
          'Toutes les fonctionnalités Basic',
          'Exports individuels (achats, ventes, dépenses)',
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
          'Toutes les fonctionnalités Premium',
          'Facturation professionnelle',
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
   * Sélectionne un plan et initialise le paiement
   */
  async selectPlan(plan: PlanInfo): Promise<void> {
    // Tous les plans sont maintenant payants, pas besoin de vérifier GRATUIT
    this.selectedPlan = plan;
    this.isProcessingPayment = true;

    // Charger Stripe
    try {
      const config = await this.paymentService.getStripeConfig().toPromise();
      if (!config) {
        throw new Error('Configuration Stripe non disponible');
      }

      this.stripe = await loadStripe(config.publicKey);
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
            card: this.cardElement,
            billing_details: {
              email: this.authService.getCurrentUser()?.email
            }
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
        // 3. Confirmer le succès du paiement au backend
        await this.paymentService.confirmPaymentSuccess({
          paymentIntentId: paymentIntent.id,
          plan: this.selectedPlan.nom
        }).toPromise();

        this.notificationService.success('Paiement réussi ! Votre abonnement a été activé.');

        // Rediriger vers le tableau de bord après 1.5 secondes
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);
      }
    } catch (error: any) {
      console.error('Erreur lors du paiement:', error);
      this.paymentError = error.error?.message || 'Erreur lors du traitement du paiement';
      this.notificationService.error(this.paymentError);
    } finally {
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
   * Formate une date
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Vérifie si l'utilisateur est admin
   */
  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}
