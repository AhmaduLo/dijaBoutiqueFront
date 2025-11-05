import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Achat, StatistiquesAchats } from '../models/achat.model';
import { ProduitPourVente } from '../models/produit-pour-vente.model';
import { AuthService } from './auth.service';

/**
 * Service de gestion des achats de stock
 */
@Injectable({
  providedIn: 'root'
})
export class AchatService {
  private readonly API_URL = 'http://localhost:8080/api/achats';
  private authService = inject(AuthService);

  constructor(private http: HttpClient) {}

  /**
   * Récupère tous les achats
   */
  getAll(): Observable<Achat[]> {
    return this.http.get<Achat[]>(this.API_URL);
  }

  /**
   * Récupère un achat par son ID
   */
  getById(id: number): Observable<Achat> {
    return this.http.get<Achat>(`${this.API_URL}/${id}`);
  }

  /**
   * Récupère les achats de l'utilisateur connecté
   */
  getByUtilisateur(): Observable<Achat[]> {
    const userId = this.authService.getCurrentUserId();
    return this.http.get<Achat[]>(`${this.API_URL}/utilisateur/${userId}`);
  }

  /**
   * Récupère la liste des produits avec leurs prix de vente suggérés
   * Accessible à TOUS les rôles (USER, GERANT, ADMIN)
   * Ne contient pas d'informations sensibles (prix d'achat, fournisseur, etc.)
   */
  getProduitsAvecPrixVente(): Observable<ProduitPourVente[]> {
    return this.http.get<ProduitPourVente[]>(`${this.API_URL}/produits-pour-vente`);
  }

  /**
   * Récupère les statistiques sur une période pour l'utilisateur connecté
   */
  getStatistiques(dateDebut: string, dateFin: string): Observable<StatistiquesAchats> {
    const userId = this.authService.getCurrentUserId();
    const params = new HttpParams()
      .set('debut', dateDebut)
      .set('fin', dateFin)
      .set('utilisateurId', userId.toString());

    return this.http.get<StatistiquesAchats>(`${this.API_URL}/statistiques`, { params });
  }

  /**
   * Crée un nouvel achat
   */
  create(achat: Achat): Observable<Achat> {
    const userId = this.authService.getCurrentUserId();
    const params = new HttpParams().set('utilisateurId', userId.toString());
    return this.http.post<Achat>(this.API_URL, achat, { params });
  }

  /**
   * Met à jour un achat existant
   */
  update(id: number, achat: Achat): Observable<Achat> {
    const userId = this.authService.getCurrentUserId();
    const params = new HttpParams().set('utilisateurId', userId.toString());
    return this.http.put<Achat>(`${this.API_URL}/${id}`, achat, { params });
  }

  /**
   * Supprime un achat
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  /**
   * Calcule le prix total (quantité × prix unitaire)
   */
  calculerPrixTotal(quantite: number, prixUnitaire: number): number {
    return quantite * prixUnitaire;
  }
}
