/**
 * Métriques du tableau de bord
 */
export interface MetriquesDashboard {
  totalAchats: number;
  chiffreAffaires: number;
  totalDepenses: number;
  beneficeNet: number;
  periodeDebut: string;
  periodeFin: string;
}

/**
 * Données pour les graphiques d'évolution
 */
export interface DonneesGraphique {
  labels: string[];
  achats: number[];
  ventes: number[];
  depenses: number[];
}
