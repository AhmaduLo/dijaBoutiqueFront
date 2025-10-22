import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Depense, CategorieDepense, StatistiquesDepenses } from '../models/depense.model';
import { AuthService } from './auth.service';

/**
 * Service de gestion des dépenses
 */
@Injectable({
  providedIn: 'root'
})
export class DepenseService {
  private readonly API_URL = 'http://localhost:8080/api/depenses';
  private authService = inject(AuthService);

  constructor(private http: HttpClient) {}

  /**
   * Récupère toutes les dépenses
   */
  getAll(): Observable<Depense[]> {
    return this.http.get<Depense[]>(this.API_URL);
  }

  /**
   * Récupère une dépense par son ID
   */
  getById(id: number): Observable<Depense> {
    return this.http.get<Depense>(`${this.API_URL}/${id}`);
  }

  /**
   * Récupère les dépenses de l'utilisateur connecté
   */
  getByUtilisateur(): Observable<Depense[]> {
    const userId = this.authService.getCurrentUserId();
    return this.http.get<Depense[]>(`${this.API_URL}/utilisateur/${userId}`);
  }

  /**
   * Récupère les dépenses par catégorie
   */
  getByCategorie(categorie: CategorieDepense): Observable<Depense[]> {
    return this.http.get<Depense[]>(`${this.API_URL}/categorie/${categorie}`);
  }

  /**
   * Récupère le total des dépenses sur une période
   */
  getTotal(dateDebut: string, dateFin: string): Observable<number> {
    const params = new HttpParams()
      .set('debut', dateDebut)
      .set('fin', dateFin);

    return this.http.get<number>(`${this.API_URL}/total`, { params });
  }

  /**
   * Récupère les statistiques sur une période
   */
  getStatistiques(dateDebut: string, dateFin: string): Observable<StatistiquesDepenses> {
    const params = new HttpParams()
      .set('debut', dateDebut)
      .set('fin', dateFin);

    return this.http.get<StatistiquesDepenses>(`${this.API_URL}/statistiques`, { params });
  }

  /**
   * Crée une nouvelle dépense
   */
  create(depense: Depense): Observable<Depense> {
    const userId = this.authService.getCurrentUserId();
    const params = new HttpParams().set('utilisateurId', userId.toString());
    return this.http.post<Depense>(this.API_URL, depense, { params });
  }

  /**
   * Met à jour une dépense existante
   */
  update(id: number, depense: Depense): Observable<Depense> {
    return this.http.put<Depense>(`${this.API_URL}/${id}`, depense);
  }

  /**
   * Supprime une dépense
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  /**
   * Retourne la liste des catégories disponibles
   */
  getCategories(): CategorieDepense[] {
    return Object.values(CategorieDepense);
  }

  /**
   * Retourne un libellé lisible pour une catégorie
   */
  getCategorieLabel(categorie: CategorieDepense): string {
    const labels: { [key in CategorieDepense]: string } = {
      LOYER: 'Loyer',
      ELECTRICITE: 'Électricité',
      EAU: 'Eau',
      INTERNET: 'Internet',
      TRANSPORT: 'Transport',
      MARKETING: 'Marketing',
      FOURNITURES: 'Fournitures',
      MAINTENANCE: 'Maintenance',
      SALAIRES: 'Salaires',
      ASSURANCE: 'Assurance',
      TAXES: 'Taxes',
      FORMATION: 'Formation',
      EQUIPEMENT: 'Équipement',
      AUTRE: 'Autre'
    };
    return labels[categorie];
  }
}
