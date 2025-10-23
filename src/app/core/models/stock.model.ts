/**
 * Statut du stock d'un produit
 */
export enum StatutStock {
  EN_STOCK = 'EN_STOCK',
  STOCK_BAS = 'STOCK_BAS',
  RUPTURE = 'RUPTURE',
  NEGATIF = 'NEGATIF'
}

/**
 * Modèle représentant le stock d'un produit
 */
export interface StockDto {
  nomProduit: string;
  quantiteAchetee: number;
  quantiteVendue: number;
  stockDisponible: number;
  prixMoyenAchat: number;
  prixMoyenVente: number;
  valeurStock: number;
  margeUnitaire: number;
  statut: StatutStock;
}

/**
 * Résumé global du stock
 */
export interface ResumeStock {
  totalProduits: number;
  produitsEnStock: number;
  produitsEnRupture: number;
  produitsStockBas: number;
  valeurTotaleStock: number;
  quantiteTotaleDisponible: number;
  margeGlobale: number;
}

/**
 * Alerte de stock
 */
export interface AlerteStock {
  nomProduit: string;
  stockDisponible: number;
  statut: StatutStock;
  valeurStock: number;
}

/**
 * Statistiques du stock
 */
export interface StatistiquesStock {
  produitsLesPlusVendus: StockDto[];
  produitsLesPlusprofitables: StockDto[];
  produitsEnAlerte: AlerteStock[];
  tendances: {
    evolutionStock: number;
    evolutionVentes: number;
    tauxRotation: number;
  };
}
