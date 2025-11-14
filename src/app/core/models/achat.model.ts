/**
 * Modèle représentant un achat de stock auprès d'un fournisseur
 */
export interface Achat {
  id?: number;
  quantite: number;
  nomProduit: string;
  photoUrl?: string; // URL de la photo du produit (optionnel)
  prixUnitaire: number;
  prixTotal: number;
  prixVenteSuggere?: number; // Prix de vente suggéré pour pré-remplir les ventes
  dateAchat: string; // Format: YYYY-MM-DD
  fournisseur: string;
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
 * Statistiques des achats sur une période donnée
 */
export interface StatistiquesAchats {
  montantTotal: number; // Nom utilisé par le backend
  totalAchats?: number; // Alias optionnel pour compatibilité
  nombreAchats: number;
  montantMoyen?: number;
  dateDebut: string;
  dateFin: string;
  periodeDebut?: string; // Alias optionnel
  periodeFin?: string; // Alias optionnel
  achats?: Achat[]; // Liste des achats de la période
}
