import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-viewer-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="isOpen" (click)="close()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <button class="close-button" (click)="close()" title="Fermer">
          <span>×</span>
        </button>
        <div class="image-container">
          <img [src]="imageUrl" [alt]="altText" />
        </div>
        <p class="image-caption" *ngIf="altText">{{ altText }}</p>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 2rem;
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .modal-content {
      position: relative;
      max-width: 90vw;
      max-height: 90vh;
      background: white;
      border-radius: 12px;
      padding: 1rem;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
      display: flex;
      flex-direction: column;
      animation: scaleIn 0.3s ease;
    }

    @keyframes scaleIn {
      from {
        transform: scale(0.9);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }

    .close-button {
      position: absolute;
      top: -1rem;
      right: -1rem;
      width: 3rem;
      height: 3rem;
      border-radius: 50%;
      background: #ef4444;
      color: white;
      border: 3px solid white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      line-height: 1;
      transition: all 0.2s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      z-index: 1;

      &:hover {
        background: #dc2626;
        transform: scale(1.1);
      }

      &:active {
        transform: scale(0.95);
      }

      span {
        margin-top: -0.2rem;
      }
    }

    .image-container {
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: auto;
      flex: 1;

      img {
        max-width: 100%;
        max-height: calc(90vh - 5rem);
        object-fit: contain;
        border-radius: 8px;
      }
    }

    .image-caption {
      text-align: center;
      margin: 1rem 0 0 0;
      color: #374151;
      font-weight: 600;
      font-size: 1rem;
    }

    @media (max-width: 768px) {
      .modal-overlay {
        padding: 1rem;
      }

      .modal-content {
        max-width: 95vw;
        max-height: 95vh;
      }

      .close-button {
        width: 2.5rem;
        height: 2.5rem;
        font-size: 1.75rem;
      }

      .image-container img {
        max-height: calc(95vh - 4rem);
      }
    }
  `]
})
export class ImageViewerModalComponent {
  @Input() isOpen = false;
  @Input() imageUrl = '';
  @Input() altText = '';
  @Output() closed = new EventEmitter<void>();

  close(): void {
    this.closed.emit();
  }
}
