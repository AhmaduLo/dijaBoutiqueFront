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
