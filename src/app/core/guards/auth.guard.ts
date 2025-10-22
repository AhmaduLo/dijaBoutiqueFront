import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard pour protéger les routes nécessitant une authentification
 */
export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Rediriger vers la page de connexion
  router.navigate(['/login']);
  return false;
};

/**
 * Guard pour empêcher l'accès aux pages auth si déjà connecté
 */
export const guestGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  // Rediriger vers le dashboard si déjà connecté
  router.navigate(['/dashboard']);
  return false;
};
