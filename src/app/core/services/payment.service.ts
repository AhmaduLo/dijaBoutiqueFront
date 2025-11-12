import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  CreatePaymentIntentRequest,
  PaymentIntentResponse,
  PaymentSuccessRequest,
  SubscriptionStatusResponse,
  StripeConfig,
  PlanInfo,
  PlanAbonnement
} from '../models/payment.model';

/**
 * Service de gestion des paiements et abonnements
 */
@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = environment.apiUrl;
  private subscriptionStatusSubject = new BehaviorSubject<SubscriptionStatusResponse | null>(null);

  /**
   * Observable du statut d'abonnement actuel
   */
  subscriptionStatus$ = this.subscriptionStatusSubject.asObservable();

  constructor(private http: HttpClient) {
    // NE PAS charger le statut automatiquement (erreur 403 sur les pages publiques)
    // Le statut sera chargé uniquement sur les pages authentifiées
  }

  /**
   * Récupère la clé publique Stripe
   */
  getStripeConfig(): Observable<StripeConfig> {
    return this.http.get<StripeConfig>(`${this.apiUrl}/payment/config`);
  }

  /**
   * Récupère le statut de l'abonnement actuel
   */
  getSubscriptionStatus(): Observable<SubscriptionStatusResponse> {
    return this.http.get<SubscriptionStatusResponse>(`${this.apiUrl}/payment/subscription`)
      .pipe(
        tap(status => this.subscriptionStatusSubject.next(status))
      );
  }

  /**
   * Charge le statut d'abonnement (utilisé au démarrage)
   */
  loadSubscriptionStatus(): void {
    this.getSubscriptionStatus().subscribe({
      next: (status) => {
        console.log('Statut d\'abonnement chargé:', status);
      },
      error: (error) => {
        console.error('Erreur lors du chargement du statut d\'abonnement:', error);
        // En cas d'erreur, on garde le BehaviorSubject à null
        // getCurrentPlan() retournera BASIC par défaut
      }
    });
  }

  /**
   * Récupère la liste des plans disponibles
   */
  getAvailablePlans(): Observable<PlanInfo[]> {
    return this.http.get<PlanInfo[]>(`${this.apiUrl}/payment/plans`);
  }

  /**
   * Crée un PaymentIntent pour initier un paiement
   */
  createPaymentIntent(request: CreatePaymentIntentRequest): Observable<PaymentIntentResponse> {
    return this.http.post<PaymentIntentResponse>(`${this.apiUrl}/payment/create-intent`, request);
  }

  /**
   * Confirme un paiement réussi et active l'abonnement
   */
  confirmPaymentSuccess(request: PaymentSuccessRequest): Observable<SubscriptionStatusResponse> {
    return this.http.post<SubscriptionStatusResponse>(`${this.apiUrl}/payment/success`, request)
      .pipe(
        tap(status => this.subscriptionStatusSubject.next(status))
      );
  }

  /**
   * Vérifie si l'abonnement est actif
   */
  isSubscriptionActive(): boolean {
    const status = this.subscriptionStatusSubject.value;
    return status ? status.actif : false;
  }

  /**
   * Vérifie si l'abonnement est expiré
   */
  isSubscriptionExpired(): boolean {
    const status = this.subscriptionStatusSubject.value;
    if (!status) return false;
    return !status.actif && status.joursRestants <= 0;
  }

  /**
   * Obtient le nombre de jours restants
   */
  getDaysRemaining(): number {
    const status = this.subscriptionStatusSubject.value;
    return status ? status.joursRestants : 0;
  }

  /**
   * Obtient le plan actuel
   */
  getCurrentPlan(): PlanAbonnement {
    const status = this.subscriptionStatusSubject.value;
    return status ? status.plan : PlanAbonnement.BASIC;
  }

  /**
   * Rafraîchit le statut d'abonnement
   */
  refreshSubscriptionStatus(): Observable<SubscriptionStatusResponse> {
    return this.getSubscriptionStatus();
  }
}
