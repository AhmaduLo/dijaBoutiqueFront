/**
 * Modèle représentant un achat de stock auprès d'un fournisseur
 */
export interface Achat {
  id?: number;
  quantite: number;
  nomProduit: string;
  prixUnitaire: number;
  prixTotal: number;
  dateAchat: string; // Format: YYYY-MM-DD
  fournisseur: string;
}

/**
 * Statistiques des achats sur une période donnée
 */
export interface StatistiquesAchats {
  totalAchats: number;
  nombreAchats: number;
  montantMoyen: number;
  periodeDebut: string;
  periodeFin: string;
}
