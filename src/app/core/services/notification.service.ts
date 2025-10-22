import { Injectable } from '@angular/core';

/**
 * Types de notifications
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

/**
 * Structure d'une notification
 */
export interface Notification {
  message: string;
  type: NotificationType;
  duration?: number;
}

/**
 * Service de gestion des notifications utilisateur
 * Utilise un système simple de toasts/snackbar
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications: Notification[] = [];

  /**
   * Affiche une notification de succès
   */
  success(message: string, duration: number = 3000): void {
    this.show(message, 'success', duration);
  }

  /**
   * Affiche une notification d'erreur
   */
  error(message: string, duration: number = 5000): void {
    this.show(message, 'error', duration);
  }

  /**
   * Affiche une notification d'avertissement
   */
  warning(message: string, duration: number = 4000): void {
    this.show(message, 'warning', duration);
  }

  /**
   * Affiche une notification d'information
   */
  info(message: string, duration: number = 3000): void {
    this.show(message, 'info', duration);
  }

  /**
   * Affiche une notification
   */
  private show(message: string, type: NotificationType, duration: number): void {
    const notification: Notification = { message, type, duration };
    this.notifications.push(notification);

    // Auto-suppression après la durée spécifiée
    setTimeout(() => {
      this.remove(notification);
    }, duration);
  }

  /**
   * Supprime une notification
   */
  remove(notification: Notification): void {
    const index = this.notifications.indexOf(notification);
    if (index > -1) {
      this.notifications.splice(index, 1);
    }
  }

  /**
   * Récupère toutes les notifications actives
   */
  getNotifications(): Notification[] {
    return this.notifications;
  }
}
