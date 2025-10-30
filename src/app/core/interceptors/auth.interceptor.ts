import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Intercepteur pour ajouter withCredentials à toutes les requêtes
 * Permet l'envoi automatique des cookies HttpOnly contenant le JWT
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Cloner la requête pour ajouter withCredentials
  // Cela permet au navigateur d'envoyer automatiquement le cookie JWT HttpOnly
  const clonedReq = req.clone({
    withCredentials: true
  });

  return next(clonedReq);
};
