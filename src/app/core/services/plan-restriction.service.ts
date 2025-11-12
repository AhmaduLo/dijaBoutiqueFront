import { Injectable } from '@angular/core';
import { PaymentService } from './payment.service';
import { PlanAbonnement } from '../models/payment.model';

/**
 * Service de gestion des restrictions par plan
 */
@Injectable({
  providedIn: 'root'
})
export class PlanRestrictionService {

  constructor(private paymentService: PaymentService) {}

  /**
   * Vérifie si l'utilisateur a accès aux exports individuels
   * Les exports individuels (achats, ventes, dépenses) sont réservés aux plans PREMIUM et ENTREPRISE
   */
  canExportIndividual(): boolean {
    const currentPlan = this.paymentService.getCurrentPlan();
    return currentPlan === PlanAbonnement.PREMIUM ||
           currentPlan === PlanAbonnement.PRO ||
           currentPlan === PlanAbonnement.ENTREPRISE;
  }

  /**
   * Vérifie si l'utilisateur a accès à la facturation
   * La facturation est réservée uniquement au plan ENTREPRISE
   */
  canGenerateInvoices(): boolean {
    const currentPlan = this.paymentService.getCurrentPlan();
    return currentPlan === PlanAbonnement.ENTREPRISE;
  }

  /**
   * Vérifie si l'utilisateur a accès aux exports globaux (rapports)
   * Tous les plans payants ont accès aux rapports
   */
  canExportGlobal(): boolean {
    // Tous les plans (BASIC, PREMIUM, ENTREPRISE) ont accès aux rapports globaux
    return true;
  }

  /**
   * Vérifie si une fonctionnalité est accessible selon le plan
   */
  hasFeatureAccess(feature: 'export-individual' | 'export-global' | 'multi-boutiques' | 'api-integration' | 'facturation'): boolean {
    const currentPlan = this.paymentService.getCurrentPlan();

    switch (feature) {
      case 'export-individual':
        return currentPlan === PlanAbonnement.PREMIUM ||
               currentPlan === PlanAbonnement.PRO ||
               currentPlan === PlanAbonnement.ENTREPRISE;

      case 'export-global':
        return true; // Tous les plans ont accès

      case 'facturation':
        return currentPlan === PlanAbonnement.ENTREPRISE;

      case 'multi-boutiques':
        return currentPlan === PlanAbonnement.PREMIUM ||
               currentPlan === PlanAbonnement.PRO ||
               currentPlan === PlanAbonnement.ENTREPRISE;

      case 'api-integration':
        return currentPlan === PlanAbonnement.PREMIUM ||
               currentPlan === PlanAbonnement.PRO ||
               currentPlan === PlanAbonnement.ENTREPRISE;

      default:
        return false;
    }
  }

  /**
   * Retourne le nom du plan actuel formaté pour l'affichage
   */
  getCurrentPlanName(): string {
    const currentPlan = this.paymentService.getCurrentPlan();
    switch (currentPlan) {
      case PlanAbonnement.BASIC:
        return 'Plan Basic';
      case PlanAbonnement.PREMIUM:
      case PlanAbonnement.PRO:
        return 'Plan Premium';
      case PlanAbonnement.ENTREPRISE:
        return 'Plan Entreprise';
      default:
        return 'Plan Basic';
    }
  }

  /**
   * Retourne le message d'erreur pour une fonctionnalité restreinte
   */
  getRestrictionMessage(feature: string): string {
    const currentPlanName = this.getCurrentPlanName();
    return `Cette fonctionnalité est réservée aux plans Premium et Entreprise. Votre plan actuel (${currentPlanName}) ne permet pas d'accéder à cette fonctionnalité. Veuillez mettre à jour votre abonnement pour y accéder.`;
  }
}
