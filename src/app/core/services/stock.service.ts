import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StockDto, ResumeStock, AlerteStock, StatutStock } from '../models/stock.model';

/**
 * Service de gestion du stock des produits
 */
@Injectable({
  providedIn: 'root'
})
export class StockService {
  private readonly API_URL = 'http://localhost:8080/api/stock';

  constructor(private http: HttpClient) {}

  /**
   * Récupère tous les stocks
   */
  getAllStocks(): Observable<StockDto[]> {
    return this.http.get<StockDto[]>(this.API_URL);
  }

  /**
   * Récupère le stock d'un produit spécifique
   */
  getStockByProduit(nomProduit: string): Observable<StockDto> {
    return this.http.get<StockDto>(`${this.API_URL}/produit/${encodeURIComponent(nomProduit)}`);
  }

  /**
   * Récupère les alertes (ruptures + stocks bas)
   */
  getAlertes(): Observable<AlerteStock[]> {
    return this.http.get<AlerteStock[]>(`${this.API_URL}/alertes`);
  }

  /**
   * Récupère le résumé global du stock
   */
  getResume(): Observable<ResumeStock> {
    return this.http.get<ResumeStock>(`${this.API_URL}/resume`);
  }

  /**
   * Retourne le libellé lisible pour un statut
   */
  getStatutLabel(statut: StatutStock): string {
    const labels: { [key in StatutStock]: string } = {
      EN_STOCK: 'En stock',
      STOCK_BAS: 'Stock bas',
      RUPTURE: 'Rupture',
      NEGATIF: 'Négatif'
    };
    return labels[statut];
  }

  /**
   * Retourne la couleur associée à un statut
   */
  getStatutColor(statut: StatutStock): string {
    const colors: { [key in StatutStock]: string } = {
      EN_STOCK: '#10b981', // Vert
      STOCK_BAS: '#f59e0b', // Orange
      RUPTURE: '#ef4444', // Rouge
      NEGATIF: '#dc2626' // Rouge foncé
    };
    return colors[statut];
  }

  /**
   * Retourne l'icône associée à un statut
   */
  getStatutIcon(statut: StatutStock): string {
    const icons: { [key in StatutStock]: string } = {
      EN_STOCK: '✓',
      STOCK_BAS: '⚠',
      RUPTURE: '✗',
      NEGATIF: '⚠'
    };
    return icons[statut];
  }

  /**
   * Calcule le pourcentage de stock disponible
   */
  calculerPourcentageStock(stock: StockDto): number {
    if (stock.quantiteAchetee === 0) return 0;
    return (stock.stockDisponible / stock.quantiteAchetee) * 100;
  }

  /**
   * Calcule le taux de rotation du stock
   */
  calculerTauxRotation(stock: StockDto): number {
    if (stock.quantiteAchetee === 0) return 0;
    return (stock.quantiteVendue / stock.quantiteAchetee) * 100;
  }
}
