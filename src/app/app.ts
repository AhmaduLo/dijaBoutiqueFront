import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { NotificationComponent } from './shared/components/notification/notification.component';
import { UpgradeModalComponent } from './shared/components/upgrade-modal/upgrade-modal.component';
import { ConfirmModalComponent } from './shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, NotificationComponent, UpgradeModalComponent, ConfirmModalComponent],
  template: `
    <app-header></app-header>
    <app-notification></app-notification>
    <app-upgrade-modal></app-upgrade-modal>
    <app-confirm-modal></app-confirm-modal>
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
  `,
  styleUrl: './app.scss'
})
export class App {}
