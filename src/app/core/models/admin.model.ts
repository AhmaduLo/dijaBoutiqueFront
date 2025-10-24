/**
 * Rôles des utilisateurs dans le système
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

/**
 * Modèle représentant un utilisateur du système
 */
export interface Utilisateur {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  role: UserRole;
  motDePasse?: string; // Seulement pour la création/modification
  dateCreation?: string;
  derniereConnexion?: string;
}

/**
 * DTO pour créer un nouvel utilisateur
 */
export interface CreateUtilisateurDto {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  role: UserRole;
}

/**
 * DTO pour modifier un utilisateur
 */
export interface UpdateUtilisateurDto {
  nom?: string;
  prenom?: string;
  email?: string;
  motDePasse?: string;
}

/**
 * DTO pour changer le rôle d'un utilisateur
 */
export interface ChangeRoleDto {
  role: UserRole;
}

/**
 * Statistiques du système d'administration
 */
export interface StatistiquesAdmin {
  nombreTotal: number;
  nombreAdmins: number;
  nombreUsers: number;
  nouveauxUtilisateurs7Jours: number;
  utilisateursActifs?: number;
  dernièresConnexions?: {
    utilisateur: string;
    date: string;
  }[];
}

/**
 * Réponse après création d'un utilisateur
 */
export interface CreateUtilisateurResponse {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: UserRole;
  message?: string;
}
