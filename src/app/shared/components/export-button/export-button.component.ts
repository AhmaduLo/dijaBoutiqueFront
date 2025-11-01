import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ExportFilter {
  dateDebut?: string;
  dateFin?: string;
}

/**
 * Composant bouton d'export avec filtres de dates
 */
@Component({
  selector: 'app-export-button',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="export-container">
      <button class="btn btn-export" (click)="toggleMenu()">
        📥 Exporter
        <span class="arrow" [class.open]="showMenu">▼</span>
      </button>

      <div class="export-menu" *ngIf="showMenu" (click)="$event.stopPropagation()">
        <div class="menu-header">
          <h4>Exporter les données</h4>
          <button class="close-btn-small" (click)="closeMenu()">×</button>
        </div>

        <!-- Filtres de dates -->
        <div class="date-filters">
          <div class="filter-group">
            <label>Date de début</label>
            <input type="date" [(ngModel)]="dateDebut" [max]="today" />
          </div>
          <div class="filter-group">
            <label>Date de fin</label>
            <input type="date" [(ngModel)]="dateFin" [max]="today" [min]="dateDebut" />
          </div>
        </div>

        <!-- Boutons d'export -->
        <div class="export-buttons">
          <button class="export-btn excel" (click)="handleExport('excel')">
            📊 Excel
          </button>
          <button class="export-btn csv" (click)="handleExport('csv')">
            📄 CSV
          </button>
          <button class="export-btn pdf" (click)="handleExport('pdf')">
            📕 PDF
          </button>
        </div>

        <p class="hint">
          💡 Laissez vide pour exporter toutes les dates
        </p>
      </div>
    </div>

    <div class="overlay" *ngIf="showMenu" (click)="closeMenu()"></div>
  `,
  styles: [`
    .export-container {
      position: relative;
      display: inline-block;
    }

    .btn-export {
      background: #0891b2;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s ease;

      &:hover {
        background: #0e7490;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(8, 145, 178, 0.3);
      }

      .arrow {
        font-size: 0.7rem;
        transition: transform 0.3s ease;

        &.open {
          transform: rotate(180deg);
        }
      }
    }

    .export-menu {
      position: absolute;
      top: calc(100% + 0.5rem);
      right: 0;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      min-width: 320px;
      z-index: 1001;
      animation: slideDown 0.2s ease;
      padding: 1.5rem;

      .menu-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid #f0f0f0;

        h4 {
          margin: 0;
          font-size: 1.1rem;
          color: #333;
        }

        .close-btn-small {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #999;
          cursor: pointer;
          padding: 0;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s;

          &:hover {
            background: #f0f0f0;
            color: #333;
          }
        }
      }

      .date-filters {
        display: grid;
        gap: 1rem;
        margin-bottom: 1.5rem;

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;

          label {
            font-weight: 500;
            font-size: 0.9rem;
            color: #555;
          }

          input[type="date"] {
            padding: 0.6rem;
            border: 2px solid #e0e0e0;
            border-radius: 6px;
            font-size: 0.95rem;
            transition: border-color 0.2s;

            &:focus {
              outline: none;
              border-color: #0891b2;
            }
          }
        }
      }

      .export-buttons {
        display: grid;
        gap: 0.75rem;
        margin-bottom: 1rem;

        .export-btn {
          padding: 0.75rem 1rem;
          border: 2px solid;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;

          &.excel {
            background: #fff;
            color: #107c41;
            border-color: #107c41;

            &:hover {
              background: #107c41;
              color: white;
            }
          }

          &.csv {
            background: #fff;
            color: #0891b2;
            border-color: #0891b2;

            &:hover {
              background: #0891b2;
              color: white;
            }
          }

          &.pdf {
            background: #fff;
            color: #dc2626;
            border-color: #dc2626;

            &:hover {
              background: #dc2626;
              color: white;
            }
          }
        }
      }

      .hint {
        margin: 0;
        font-size: 0.85rem;
        color: #666;
        text-align: center;
        padding: 0.5rem;
        background: #f9fafb;
        border-radius: 6px;
      }
    }

    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 1000;
      background: rgba(0, 0, 0, 0.1);
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 768px) {
      .export-menu {
        right: auto;
        left: 50%;
        transform: translateX(-50%);
        min-width: 280px;
      }
    }
  `]
})
export class ExportButtonComponent {
  @Output() export = new EventEmitter<{ format: 'excel' | 'csv' | 'pdf'; filter: ExportFilter }>();

  showMenu = false;
  dateDebut?: string;
  dateFin?: string;
  today = new Date().toISOString().split('T')[0];

  toggleMenu(): void {
    this.showMenu = !this.showMenu;
  }

  closeMenu(): void {
    this.showMenu = false;
  }

  handleExport(format: 'excel' | 'csv' | 'pdf'): void {
    const filter: ExportFilter = {
      dateDebut: this.dateDebut,
      dateFin: this.dateFin
    };

    this.export.emit({ format, filter });
    this.closeMenu();
  }
}
