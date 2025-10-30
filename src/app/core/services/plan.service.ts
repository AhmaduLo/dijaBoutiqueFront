import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Plan, PlanType, PLANS, UserLimitError } from '../models/plan.model';

@Injectable({
  providedIn: 'root'
})
export class PlanService {
  private userLimitErrorSubject = new BehaviorSubject<UserLimitError | null>(null);
  public userLimitError$ = this.userLimitErrorSubject.asObservable();

  constructor() {}

  /**
   * Récupère tous les plans disponibles
   */
  getPlans(): Plan[] {
    return PLANS;
  }

  /**
   * Récupère un plan spécifique par son nom
   */
  getPlanByName(name: PlanType): Plan | undefined {
    return PLANS.find(plan => plan.name === name);
  }

  /**
   * Récupère le plan suivant pour un upgrade
   */
  getNextPlan(currentPlan: PlanType): Plan | null {
    const currentIndex = PLANS.findIndex(plan => plan.name === currentPlan);
    if (currentIndex === -1 || currentIndex === PLANS.length - 1) {
      return null; // Déjà au plan le plus élevé
    }
    return PLANS[currentIndex + 1];
  }

  /**
   * Émet une erreur de limite d'utilisateurs
   */
  setUserLimitError(error: UserLimitError): void {
    this.userLimitErrorSubject.next(error);
  }

  /**
   * Efface l'erreur de limite d'utilisateurs
   */
  clearUserLimitError(): void {
    this.userLimitErrorSubject.next(null);
  }

  /**
   * Vérifie si une erreur est une erreur de limite d'utilisateurs
   */
  isUserLimitError(error: any): boolean {
    return error?.status === 400 &&
           error?.error?.error === "Limite d'utilisateurs atteinte";
  }

  /**
   * Extrait les détails de l'erreur de limite
   */
  extractUserLimitError(error: any): UserLimitError | null {
    if (this.isUserLimitError(error)) {
      return {
        error: error.error.error,
        message: error.error.message,
        planName: error.error.planName,
        currentCount: error.error.currentCount,
        maxAllowed: error.error.maxAllowed
      };
    }
    return null;
  }
}
