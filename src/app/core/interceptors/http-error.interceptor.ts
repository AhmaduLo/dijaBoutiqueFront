import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { PlanService } from '../services/plan.service';

/**
 * Intercepteur pour gérer les erreurs HTTP de manière centralisée
 */
export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const planService = inject(PlanService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = '';

      if (error.error instanceof ErrorEvent) {
        // Erreur côté client
        errorMessage = `Erreur: ${error.error.message}`;
      } else {
        // Vérifier si c'est une erreur de limite d'utilisateurs
        if (planService.isUserLimitError(error)) {
          const userLimitError = planService.extractUserLimitError(error);
          if (userLimitError) {
            planService.setUserLimitError(userLimitError);
            // Retourner l'erreur originale pour que le composant puisse la gérer
            return throwError(() => error);
          }
        }

        // Erreur côté serveur
        switch (error.status) {
          case 400:
            errorMessage = 'Requête invalide. Veuillez vérifier les données saisies.';
            break;
          case 404:
            errorMessage = 'Ressource non trouvée.';
            break;
          case 500:
            errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
            break;
          case 0:
            errorMessage = 'Impossible de contacter le serveur. Vérifiez que le backend est démarré.';
            break;
          default:
            errorMessage = `Erreur ${error.status}: ${error.message}`;
        }
      }

      console.error('Erreur HTTP:', errorMessage, error);
      return throwError(() => new Error(errorMessage));
    })
  );
};
