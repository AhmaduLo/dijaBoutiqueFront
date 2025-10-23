/**
 * Catégories de dépenses disponibles
 */
export enum CategorieDepense {
  LOYER = 'LOYER',
  ELECTRICITE = 'ELECTRICITE',
  EAU = 'EAU',
  INTERNET = 'INTERNET',
  TRANSPORT = 'TRANSPORT',
  MARKETING = 'MARKETING',
  FOURNITURES = 'FOURNITURES',
  MAINTENANCE = 'MAINTENANCE',
  SALAIRES = 'SALAIRES',
  ASSURANCE = 'ASSURANCE',
  TAXES = 'TAXES',
  FORMATION = 'FORMATION',
  EQUIPEMENT = 'EQUIPEMENT',
  AUTRE = 'AUTRE'
}

/**
 * Modèle représentant une dépense de l'activité
 */
export interface Depense {
  id?: number;
  libelle: string;
  montant: number;
  dateDepense: string; // Format: YYYY-MM-DD
  categorie: CategorieDepense;
  estRecurrente: boolean;
  notes?: string;
  utilisateur?: {
    id: number;
    prenom: string;
    nom: string;
  };
}

/**
 * Statistiques des dépenses sur une période donnée
 */
export interface StatistiquesDepenses {
  totalDepenses: number;
  nombreDepenses: number;
  montantMoyen: number;
  repartitionParCategorie: { [key: string]: number };
  periodeDebut: string;
  periodeFin: string;
}
