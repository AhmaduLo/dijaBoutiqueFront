/**
 * Requête pour demander la réinitialisation du mot de passe
 */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * Requête pour réinitialiser le mot de passe avec le token
 */
export interface ResetPasswordRequest {
  token: string;
  nouveauMotDePasse: string;
  confirmationMotDePasse: string;
}

/**
 * Réponse de l'API pour forgot/reset password
 */
export interface PasswordResetResponse {
  message: string;
}
