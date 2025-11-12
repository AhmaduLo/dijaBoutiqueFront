import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { PaymentService } from '../services/payment.service';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';

/**
 * Guard pour vérifier si l'abonnement est actif
 * Redirige vers la page d'abonnement si expiré
 */
@Injectable({
  providedIn: 'root'
})
export class SubscriptionGuard implements CanActivate {
  constructor(
    private paymentService: PaymentService,
    private router: Router,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    // Vérifier le statut d'abonnement
    return this.paymentService.getSubscriptionStatus().pipe(
      map(status => {
        // Si l'abonnement est actif ou en période d'essai, autoriser l'accès
        if (status.actif || status.joursRestants > 0) {
          // Afficher un avertissement si proche de l'expiration (moins de 3 jours)
          if (status.joursRestants > 0 && status.joursRestants <= 3 && !status.actif) {
            this.notificationService.warning(
              `Attention: il vous reste ${status.joursRestants} jour(s) d'essai gratuit`
            );
          }
          return true;
        }

        // L'abonnement est expiré, rediriger vers la page d'abonnement
        this.notificationService.error(
          'Votre abonnement a expiré. Veuillez souscrire à un plan pour continuer.'
        );
        this.router.navigate(['/subscription']);
        return false;
      }),
      catchError((error) => {
        console.error('Erreur lors de la vérification de l\'abonnement:', error);
        // En cas d'erreur, autoriser l'accès pour ne pas bloquer l'utilisateur
        return of(true);
      })
    );
  }
}
