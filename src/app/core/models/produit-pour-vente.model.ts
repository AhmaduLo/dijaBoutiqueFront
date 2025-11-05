/**
 * Modèle représentant un produit avec son prix de vente suggéré
 * Utilisé pour pré-remplir les ventes (accessible à tous les rôles)
 */
export interface ProduitPourVente {
  nomProduit: string;
  prixVenteSuggere?: number;
}
