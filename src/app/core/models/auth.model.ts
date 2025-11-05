/**
 * Modèle d'utilisateur
 */
export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  nomEntreprise?: string;
  numeroTelephone?: string;
  role?: string;
  createdAt?: string;
}

/**
 * Requête d'inscription
 */
export interface RegisterRequest {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  nomEntreprise: string;
  adresseEntreprise: string;
  numeroTelephone: string;
  role?: 'USER' | 'ADMIN' | 'GERANT'; // Optionnel, par défaut USER
}

/**
 * Requête de connexion
 */
export interface LoginRequest {
  email: string;
  motDePasse: string;
}

/**
 * Réponse d'authentification (login ou register)
 * Note: Le token est null car il est maintenant stocké dans un cookie HttpOnly
 */
export interface AuthResponse {
  role: string | undefined;
  email: string;
  prenom: string;
  nom: string;
  id: number;
  user: User;
  token: string | null;  // Nullable car maintenant dans cookie HttpOnly
  message?: string;
}

/**
 * État d'authentification stocké
 * Note: Le token n'est plus stocké côté frontend (cookie HttpOnly)
 */
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
