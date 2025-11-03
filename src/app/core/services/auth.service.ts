import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../models/auth.model';
import { ForgotPasswordRequest, ResetPasswordRequest, PasswordResetResponse } from '../models/password-reset.model';

/**
 * Service d'authentification
 * Gère l'inscription, la connexion, la déconnexion
 * Note: Le JWT est maintenant stocké dans un cookie HttpOnly pour plus de sécurité
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8080/api/auth';
  private readonly USER_KEY = 'dija_user';

  // État d'authentification observable
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Vérifie si l'utilisateur est connecté
   * Note: Vérifie simplement si un utilisateur est en mémoire
   * Le JWT est maintenant dans un cookie HttpOnly géré automatiquement par le navigateur
   */
  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }

  /**
   * Récupère l'utilisateur courant
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Récupère l'ID de l'utilisateur courant
   */
  getCurrentUserId(): number {
    const user = this.getCurrentUser();
    return user?.id || 1; // Fallback à 1 si pas connecté
  }

  /**
   * Vérifie si l'utilisateur courant est un ADMIN
   */
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'ADMIN';
  }

  /**
   * Vérifie si l'utilisateur courant est un GERANT
   */
  isGerant(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'GERANT';
  }

  /**
   * Vérifie si l'utilisateur courant est un ADMIN ou un GERANT
   */
  isAdminOrGerant(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'ADMIN' || user?.role === 'GERANT';
  }

  /**
   * Inscription d'un nouvel utilisateur
   * Note: withCredentials est ajouté automatiquement par l'intercepteur
   */
  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, data).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  /**
   * Connexion d'un utilisateur
   * Note: withCredentials est ajouté automatiquement par l'intercepteur
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  /**
   * Déconnexion
   * Appelle l'endpoint backend pour supprimer le cookie HttpOnly
   */
  logout(): Observable<string> {
    return this.http.post(`${this.API_URL}/logout`, {}, {
      responseType: 'text'  // Le backend renvoie du texte brut, pas du JSON
    }).pipe(
      tap(() => {
        // Nettoyer le localStorage et réinitialiser l'état
        localStorage.removeItem(this.USER_KEY);
        this.currentUserSubject.next(null);
      })
    );
  }

  /**
   * Recharge les informations de l'utilisateur actuel
   * Utile après modification de l'entreprise pour mettre à jour le header
   */
  refreshCurrentUser(): void {
    const user = this.getUserFromStorage();
    if (user) {
      // Faire un appel API pour récupérer les infos à jour
      // Pour l'instant, on force juste un reload depuis le storage
      this.currentUserSubject.next({...user});
    }
  }

  /**
   * Demande de réinitialisation du mot de passe
   * Envoie un email avec un lien de réinitialisation
   */
  forgotPassword(request: ForgotPasswordRequest): Observable<PasswordResetResponse> {
    return this.http.post<PasswordResetResponse>(`${this.API_URL}/forgot-password`, request);
  }

  /**
   * Réinitialise le mot de passe avec le token reçu par email
   */
  resetPassword(request: ResetPasswordRequest): Observable<PasswordResetResponse> {
    return this.http.post<PasswordResetResponse>(`${this.API_URL}/reset-password`, request);
  }

  /**
   * Gère la réponse d'authentification (stockage user uniquement)
   * Note: Le token n'est plus stocké ici, il est dans un cookie HttpOnly
   */
  private handleAuthResponse(response: AuthResponse): void {
    if (response.user) {
      // Stocker uniquement les infos utilisateur, pas le token
      localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
      this.currentUserSubject.next(response.user);
    }
  }

  /**
   * Récupère l'utilisateur depuis le localStorage
   */
  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch {
        return null;
      }
    }
    return null;
  }
}
