/**
 * Modèle représentant une vente à un client
 */
export interface Vente {
  id?: number;
  quantite: number;
  nomProduit: string;
  photoUrl?: string; // URL de la photo du produit (optionnel)
  prixUnitaire: number;
  prixTotal: number;
  dateVente: string; // Format: YYYY-MM-DD
  client: string;
  deviseId?: number; // ID de la devise utilisée
  deviseCode?: string; // Code de la devise (XOF, EUR, USD...)
  deviseSymbole?: string; // Symbole de la devise (CFA, €, $...)
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
