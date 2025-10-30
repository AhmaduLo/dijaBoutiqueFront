import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Utilisateur,
  CreateUtilisateurDto,
  UpdateUtilisateurDto,
  ChangeRoleDto,
  StatistiquesAdmin,
  CreateUtilisateurResponse,
  UserRole
} from '../models/admin.model';

/**
 * Service de gestion administrative des utilisateurs
 */
@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly API_URL = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) {}

  /**
   * Récupère tous les utilisateurs (ADMIN uniquement)
   */
  getAllUtilisateurs(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(`${this.API_URL}/utilisateurs`);
  }

  /**
   * Récupère un utilisateur par son ID
   */
  getUtilisateurById(id: number): Observable<Utilisateur> {
    return this.http.get<Utilisateur>(`${this.API_URL}/utilisateurs/${id}`);
  }

  /**
   * Crée un nouvel utilisateur (ADMIN uniquement)
   */
  createUtilisateur(data: CreateUtilisateurDto): Observable<CreateUtilisateurResponse> {
    return this.http.post<CreateUtilisateurResponse>(`${this.API_URL}/utilisateurs`, data);
  }

  /**
   * Met à jour un utilisateur (ADMIN uniquement)
   */
  updateUtilisateur(id: number, data: UpdateUtilisateurDto): Observable<Utilisateur> {
    return this.http.put<Utilisateur>(`${this.API_URL}/utilisateurs/${id}`, data);
  }

  /**
   * Supprime un utilisateur (ADMIN uniquement)
   */
  deleteUtilisateur(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/utilisateurs/${id}`);
  }

  /**
   * Change le rôle d'un utilisateur (ADMIN uniquement)
   */
  changeRole(id: number, role: UserRole): Observable<Utilisateur> {
    const data: ChangeRoleDto = { role };
    return this.http.put<Utilisateur>(`${this.API_URL}/utilisateurs/${id}/role`, data);
  }

  /**
   * Récupère les statistiques du système (ADMIN uniquement)
   */
  getStatistiques(): Observable<StatistiquesAdmin> {
    return this.http.get<StatistiquesAdmin>(`${this.API_URL}/statistiques`);
  }

  /**
   * Retourne le libellé lisible pour un rôle
   */
  getRoleLabel(role: UserRole): string {
    const labels: { [key in UserRole]: string } = {
      ADMIN: 'Administrateur',
      USER: 'Employé'
    };
    return labels[role];
  }

  /**
   * Retourne la couleur associée à un rôle
   */
  getRoleColor(role: UserRole): string {
    const colors: { [key in UserRole]: string } = {
      ADMIN: '#0891b2', // Teal
      USER: '#3b82f6'  // Bleu
    };
    return colors[role];
  }

  /**
   * Retourne l'icône associée à un rôle
   */
  getRoleIcon(role: UserRole): string {
    const icons: { [key in UserRole]: string } = {
      ADMIN: '👑',
      USER: '👤'
    };
    return icons[role];
  }

  /**
   * Valide un email
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Génère un mot de passe temporaire sécurisé
   */
  generateTemporaryPassword(): string {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }
}
