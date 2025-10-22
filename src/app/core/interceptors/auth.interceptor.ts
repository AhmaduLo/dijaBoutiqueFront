import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Intercepteur pour ajouter automatiquement le token JWT aux requêtes HTTP
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Ne pas ajouter le token aux requêtes d'authentification
  const isAuthRequest = req.url.includes('/auth/login') || req.url.includes('/auth/register');

  if (token && !isAuthRequest) {
    // Cloner la requête et ajouter le header Authorization
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
