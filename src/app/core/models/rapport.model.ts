/**
 * Modèle pour les rapports et bilans
 */

export interface RapportPeriode {
  dateDebut: string;
  dateFin: string;
  totalAchats: number;
  chiffreAffaires: number;
  totalDepenses: number;
  beneficeNet: number;
  margeBrute: number;
  margeNette: number;
  nombreAchats: number;
  nombreVentes: number;
  nombreDepenses: number;
  moyenneAchatParTransaction: number;
  moyenneVenteParTransaction: number;
  moyenneDepenseParTransaction: number;
}

export interface RapportMensuel {
  mois: string;
  annee: number;
  totalAchats: number;
  chiffreAffaires: number;
  totalDepenses: number;
  beneficeNet: number;
  margeBrute: number;
}

export interface RapportAnnuel {
  annee: number;
  moisParMois: RapportMensuel[];
  totalAchats: number;
  chiffreAffaires: number;
  totalDepenses: number;
  beneficeNet: number;
  margeBrute: number;
  meilleurMois: string;
  piresMois: string;
}

export interface StatistiquesCategories {
  categorie: string;
  montant: number;
  pourcentage: number;
}

export interface RapportComplet {
  periode: RapportPeriode;
  evolutionMensuelle: RapportMensuel[];
  depensesParCategorie: StatistiquesCategories[];
  tendances: {
    evolutionCA: number; // pourcentage d'évolution
    evolutionBenefice: number;
    evolutionDepenses: number;
  };
}

export type TypeRapport = 'mensuel' | 'trimestriel' | 'annuel' | 'personnalise';

export interface FiltreRapport {
  type: TypeRapport;
  dateDebut?: string;
  dateFin?: string;
  mois?: number;
  annee?: number;
}
