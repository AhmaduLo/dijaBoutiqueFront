import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vente, StatistiquesVentes } from '../models/vente.model';
import { AuthService } from './auth.service';

/**
 * Service de gestion des ventes
 */
@Injectable({
  providedIn: 'root'
})
export class VenteService {
  private readonly API_URL = 'http://localhost:8080/api/ventes';
  private authService = inject(AuthService);

  constructor(private http: HttpClient) {}

  /**
   * Récupère toutes les ventes
   */
  getAll(): Observable<Vente[]> {
    return this.http.get<Vente[]>(this.API_URL);
  }

  /**
   * Récupère une vente par son ID
   */
  getById(id: number): Observable<Vente> {
    return this.http.get<Vente>(`${this.API_URL}/${id}`);
  }

  /**
   * Récupère les ventes de l'utilisateur connecté
   */
  getByUtilisateur(): Observable<Vente[]> {
    const userId = this.authService.getCurrentUserId();
    return this.http.get<Vente[]>(`${this.API_URL}/utilisateur/${userId}`);
  }

  /**
   * Récupère le chiffre d'affaires sur une période pour l'utilisateur connecté
   */
  getChiffreAffaires(dateDebut: string, dateFin: string): Observable<number> {
    const userId = this.authService.getCurrentUserId();
    const params = new HttpParams()
      .set('debut', dateDebut)
      .set('fin', dateFin)
      .set('utilisateurId', userId.toString());

    return this.http.get<number>(`${this.API_URL}/chiffre-affaires`, { params });
  }

  /**
   * Récupère les statistiques sur une période pour l'utilisateur connecté
   */
  getStatistiques(dateDebut: string, dateFin: string): Observable<StatistiquesVentes> {
    const userId = this.authService.getCurrentUserId();
    const params = new HttpParams()
      .set('debut', dateDebut)
      .set('fin', dateFin)
      .set('utilisateurId', userId.toString());

    return this.http.get<StatistiquesVentes>(`${this.API_URL}/statistiques`, { params });
  }

  /**
   * Crée une nouvelle vente
   */
  create(vente: Vente): Observable<Vente> {
    const userId = this.authService.getCurrentUserId();
    const params = new HttpParams().set('utilisateurId', userId.toString());
    return this.http.post<Vente>(this.API_URL, vente, { params });
  }

  /**
   * Met à jour une vente existante
   */
  update(id: number, vente: Vente): Observable<Vente> {
    return this.http.put<Vente>(`${this.API_URL}/${id}`, vente);
  }

  /**
   * Supprime une vente
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
