import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rapports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rapports">
      <div class="page-header">
        <h1>📈 Rapports et Bilans</h1>
      </div>

      <div class="card">
        <div class="coming-soon">
          <div class="icon">🚧</div>
          <h2>Fonctionnalité en cours de développement</h2>
          <p>
            Cette page permettra de générer des rapports détaillés et des bilans mensuels
            avec des graphiques d'évolution et des statistiques avancées.
          </p>
          <p>
            Pour le moment, utilisez le <strong>Dashboard</strong> pour consulter vos métriques.
          </p>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./rapports.component.scss']
})
export class RapportsComponent {}
