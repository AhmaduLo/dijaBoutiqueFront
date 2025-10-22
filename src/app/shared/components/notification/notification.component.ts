import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../../core/services/notification.service';

/**
 * Composant d'affichage des notifications (toasts)
 */
@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notifications-container">
      <div
        *ngFor="let notification of notifications"
        class="notification"
        [class]="'notification--' + notification.type"
        (click)="remove(notification)"
      >
        <span class="notification__icon">{{ getIcon(notification.type) }}</span>
        <span class="notification__message">{{ notification.message }}</span>
        <button class="notification__close">×</button>
      </div>
    </div>
  `,
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {
  notifications: Notification[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    // Écoute les changements de notifications
    setInterval(() => {
      this.notifications = this.notificationService.getNotifications();
    }, 100);
  }

  remove(notification: Notification): void {
    this.notificationService.remove(notification);
  }

  getIcon(type: string): string {
    const icons: { [key: string]: string } = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[type] || 'ℹ️';
  }
}
