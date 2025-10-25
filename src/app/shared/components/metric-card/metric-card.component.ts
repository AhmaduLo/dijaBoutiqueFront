import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Composant de carte pour afficher une métrique
 */
@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="metric-card" [class]="'metric-card--' + color">
      <div class="metric-card__icon">{{ icon }}</div>
      <div class="metric-card__content">
        <h3 class="metric-card__title">{{ title }}</h3>
        <p class="metric-card__value">
          {{ value | number:'1.0-2':'fr-FR' }}
        </p>
        <p class="metric-card__subtitle" *ngIf="subtitle">{{ subtitle }}</p>
      </div>
    </div>
  `,
  styleUrls: ['./metric-card.component.scss']
})
export class MetricCardComponent {
  @Input() title: string = '';
  @Input() value: number = 0;
  @Input() icon: string = '📊';
  @Input() color: 'pink' | 'green' | 'orange' | 'purple' = 'pink';
  @Input() subtitle?: string;
}
