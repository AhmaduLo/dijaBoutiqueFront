/**
 * Modèle représentant une devise (unité monétaire)
 */
export interface Currency {
  id?: number;
  code: string;          // Ex: USD, EUR, XOF, MAD
  nom: string;           // Ex: Dollar américain, Euro, Franc CFA
  symbole: string;       // Ex: $, €, CFA, DH
  pays: string;          // Ex: États-Unis, France, Sénégal, Maroc
  tauxChange?: number;   // Taux de change par rapport à une devise de référence
  isDefault?: boolean;   // Devise par défaut du système
  dateCreation?: string;
}

/**
 * DTO pour créer une nouvelle devise
 */
export interface CreateCurrencyDto {
  code: string;
  nom: string;
  symbole: string;
  pays: string;
  tauxChange?: number;
  isDefault?: boolean;
}

/**
 * DTO pour modifier une devise
 */
export interface UpdateCurrencyDto {
  code?: string;
  nom?: string;
  symbole?: string;
  pays?: string;
  tauxChange?: number;
  isDefault?: boolean;
}

/**
 * Liste des devises courantes prédéfinies
 */
export const DEVISES_COMMUNES: Omit<Currency, 'id'>[] = [
  {
    code: 'XOF',
    nom: 'Franc CFA',
    symbole: 'CFA',
    pays: 'Sénégal',
    tauxChange: 1,
    isDefault: true
  },
  {
    code: 'EUR',
    nom: 'Euro',
    symbole: '€',
    pays: 'France',
    tauxChange: 655.957
  },
  {
    code: 'USD',
    nom: 'Dollar américain',
    symbole: '$',
    pays: 'États-Unis',
    tauxChange: 600
  },
  {
    code: 'MAD',
    nom: 'Dirham marocain',
    symbole: 'DH',
    pays: 'Maroc',
    tauxChange: 60
  },
  {
    code: 'GBP',
    nom: 'Livre sterling',
    symbole: '£',
    pays: 'Royaume-Uni',
    tauxChange: 770
  }
];
