export enum PlanType {
  GRATUIT = 'GRATUIT',
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
  ENTREPRISE = 'ENTREPRISE'
}

export interface Plan {
  name: PlanType;
  displayName: string;
  maxUsers: number;
  price: number;
  features: string[];
  isUnlimited: boolean;
}

export interface UserLimitError {
  error: string;
  message: string;
  planName: PlanType;
  currentCount: number;
  maxAllowed: number;
}

export const PLANS: Plan[] = [
  {
    name: PlanType.GRATUIT,
    displayName: 'Gratuit',
    maxUsers: 3,
    price: 0,
    features: [
      'Jusqu\'à 3 utilisateurs',
      'Gestion des ventes',
      'Gestion des achats',
      'Rapports basiques'
    ],
    isUnlimited: false
  },
  {
    name: PlanType.BASIC,
    displayName: 'Basic',
    maxUsers: 10,
    price: 15000,
    features: [
      'Jusqu\'à 10 utilisateurs',
      'Toutes les fonctionnalités Gratuit',
      'Gestion multi-devises',
      'Rapports avancés',
      'Support prioritaire'
    ],
    isUnlimited: false
  },
  {
    name: PlanType.PREMIUM,
    displayName: 'Premium',
    maxUsers: 50,
    price: 45000,
    features: [
      'Jusqu\'à 50 utilisateurs',
      'Toutes les fonctionnalités Basic',
      'Analyses approfondies',
      'Export des données',
      'API d\'intégration',
      'Support 24/7'
    ],
    isUnlimited: false
  },
  {
    name: PlanType.ENTREPRISE,
    displayName: 'Entreprise',
    maxUsers: -1,
    price: 0,
    features: [
      'Utilisateurs illimités',
      'Toutes les fonctionnalités Premium',
      'Solutions personnalisées',
      'Gestionnaire de compte dédié',
      'Formation sur mesure',
      'Support prioritaire 24/7'
    ],
    isUnlimited: true
  }
];
