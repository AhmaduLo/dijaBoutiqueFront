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
  numeroTelephone: string;
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
 */
export interface AuthResponse {
  role: string | undefined;
  email: string;
  prenom: string;
  nom: string;
  id: number;
  user: User;
  token: string;
  message?: string;
}

/**
 * État d'authentification stocké
 */
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
