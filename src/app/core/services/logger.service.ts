import { Injectable, isDevMode } from '@angular/core';

/**
 * Service de logging sécurisé
 * En production, les logs sont désactivés pour éviter les fuites d'informations sensibles
 */
@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private isDevelopment = isDevMode();

  constructor() {
    // Log uniquement en dev pour confirmer le mode
    if (this.isDevelopment) {
      console.log('🔧 LoggerService initialized in DEVELOPMENT mode');
    }
  }

  /**
   * Sanitize les données sensibles avant de logger
   */
  private sanitize(data: any): any {
    if (!data) return data;

    // Si c'est un objet, le cloner et supprimer les champs sensibles
    if (typeof data === 'object') {
      const safe = Array.isArray(data) ? [...data] : { ...data };

      // Liste des champs à supprimer
      const sensitiveFields = [
        'password',
        'motDePasse',
        'token',
        'jwt',
        'authorization',
        'apiKey',
        'secret',
        'creditCard',
        'cvv'
      ];

      // Supprimer récursivement les champs sensibles
      const removeSensitiveData = (obj: any): any => {
        if (!obj || typeof obj !== 'object') return obj;

        if (Array.isArray(obj)) {
          return obj.map(item => removeSensitiveData(item));
        }

        const cleaned: any = {};
        for (const key in obj) {
          if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
            cleaned[key] = '***REDACTED***';
          } else if (typeof obj[key] === 'object') {
            cleaned[key] = removeSensitiveData(obj[key]);
          } else {
            cleaned[key] = obj[key];
          }
        }
        return cleaned;
      };

      return removeSensitiveData(safe);
    }

    return data;
  }

  /**
   * Log d'information (seulement en développement)
   */
  log(message: string, data?: any): void {
    if (this.isDevelopment) {
      if (data) {
        console.log(message, this.sanitize(data));
      } else {
        console.log(message);
      }
    }
  }

  /**
   * Log d'avertissement (seulement en développement)
   */
  warn(message: string, data?: any): void {
    if (this.isDevelopment) {
      if (data) {
        console.warn(message, this.sanitize(data));
      } else {
        console.warn(message);
      }
    }
  }

  /**
   * Log d'erreur (toujours actif, mais sanitizé)
   * En production, on pourrait l'envoyer à un service comme Sentry
   */
  error(message: string, error?: any): void {
    const sanitizedError = this.sanitize(error);

    if (this.isDevelopment) {
      console.error(message, sanitizedError);
    } else {
      // En production, envoyer à un service de monitoring
      // Exemple: Sentry, Rollbar, LogRocket, etc.
      // this.sendToMonitoring(message, sanitizedError);

      // Pour l'instant, on log quand même en production mais sanitizé
      console.error(message);
    }
  }

  /**
   * Log de debug (seulement en développement)
   */
  debug(message: string, data?: any): void {
    if (this.isDevelopment) {
      if (data) {
        console.debug(message, this.sanitize(data));
      } else {
        console.debug(message);
      }
    }
  }

  /**
   * Log d'information générale (toujours visible)
   */
  info(message: string, data?: any): void {
    if (this.isDevelopment) {
      if (data) {
        console.info(message, this.sanitize(data));
      } else {
        console.info(message);
      }
    }
  }
}
