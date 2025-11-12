/**
 * Plan d'abonnement
 */
export enum PlanAbonnement {
  GRATUIT = 'GRATUIT',  // Plan gratuit par défaut après inscription
  BASIC = 'BASIC',
  PRO = 'PRO',
  PREMIUM = 'PREMIUM',  // Alias pour PRO (compatibilité backend)
  ENTREPRISE = 'ENTREPRISE'
}

/**
 * Devise pour les paiements
 */
export enum DevisePayment {
  EUR = 'EUR',
  XOF = 'XOF'
}

/**
 * Informations sur un plan d'abonnement
 */
export interface PlanInfo {
  nom: PlanAbonnement;
  prixEUR: number;
  prixXOF: number;
  maxUtilisateurs: number;
  fonctionnalites: string[];
  description: string;
}

/**
 * Requête pour créer un PaymentIntent
 */
export interface CreatePaymentIntentRequest {
  plan: PlanAbonnement;
  devise: DevisePayment;
}

/**
 * Réponse contenant le clientSecret pour Stripe
 */
export interface PaymentIntentResponse {
  clientSecret: string;
  montant: number;
  devise: string;
}

/**
 * Requête pour confirmer un paiement réussi
 */
export interface PaymentSuccessRequest {
  paymentIntentId: string;
  plan: PlanAbonnement;
}

/**
 * Statut de l'abonnement
 */
export interface SubscriptionStatusResponse {
  plan: PlanAbonnement;
  dateExpiration: string;
  actif: boolean;
  joursRestants: number;
  message: string;
}

/**
 * Configuration Stripe (clé publique)
 */
export interface StripeConfig {
  publicKey: string;
}
