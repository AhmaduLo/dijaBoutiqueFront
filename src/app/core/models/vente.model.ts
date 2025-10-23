/**
 * Modèle représentant une vente à un client
 */
export interface Vente {
  id?: number;
  quantite: number;
  nomProduit: string;
  prixUnitaire: number;
  prixTotal: number;
  dateVente: string; // Format: YYYY-MM-DD
  client: string;
  utilisateur?: {
    id: number;
    prenom: string;
    nom: string;
  };
}

/**
 * Statistiques des ventes sur une période donnée
 */
export interface StatistiquesVentes {
  totalVentes: number;
  nombreVentes: number;
  montantMoyen: number;
  chiffreAffaires: number;
  periodeDebut: string;
  periodeFin: string;
}
