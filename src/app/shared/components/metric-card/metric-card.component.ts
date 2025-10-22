import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyEurPipe } from '../../pipes/currency-eur.pipe';

/**
 * Composant de carte pour afficher une métrique
 */
@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [CommonModule, CurrencyEurPipe],
  template: `
    <div class="metric-card" [class]="'metric-card--' + color">
      <div class="metric-card__icon">{{ icon }}</div>
      <div class="metric-card__content">
        <h3 class="metric-card__title">{{ title }}</h3>
        <p class="metric-card__value">
          <ng-container *ngIf="isCurrency; else nonCurrency">
            {{ value | currencyEur }}
          </ng-container>
          <ng-template #nonCurrency>
            {{ value }}
          </ng-template>
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
  @Input() isCurrency: boolean = true;
  @Input() subtitle?: string;
}
