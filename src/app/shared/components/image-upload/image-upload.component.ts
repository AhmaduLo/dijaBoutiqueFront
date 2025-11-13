import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FileService } from '../../../core/services/file.service';
import { NotificationService } from '../../../core/services/notification.service';

/**
 * Composant réutilisable pour l'upload d'images
 * Peut être utilisé avec ngModel ou FormControl
 */
@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ImageUploadComponent),
      multi: true
    }
  ],
  template: `
    <div class="image-upload-container">
      <!-- Zone de prévisualisation -->
      <div class="preview-zone" [class.has-image]="previewUrl || value">
        <img
          [src]="previewUrl || fileService.getPhotoUrl(value)"
          [alt]="altText"
          class="preview-image"
        />

        <!-- Boutons d'action sur l'image -->
        <div class="image-actions" *ngIf="previewUrl || value">
          <button
            type="button"
            class="btn-remove"
            (click)="removeImage()"
            title="Supprimer l'image"
          >
            🗑️
          </button>
        </div>
      </div>

      <!-- Zone d'upload -->
      <div class="upload-zone" *ngIf="!previewUrl && !value">
        <input
          #fileInput
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          (change)="onFileSelected($event)"
          class="file-input"
          [disabled]="disabled"
        />
        <button
          type="button"
          class="btn-upload"
          (click)="fileInput.click()"
          [disabled]="disabled"
        >
          📷 Ajouter une photo
        </button>
        <p class="upload-hint">JPG, PNG ou WEBP (max 5 MB)</p>
      </div>

      <!-- Bouton pour changer l'image -->
      <button
        *ngIf="(previewUrl || value) && !disabled"
        type="button"
        class="btn-change"
        (click)="fileInput.click()"
      >
        ↻ Changer la photo
      </button>

      <!-- Input file caché -->
      <input
        #fileInput
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        (change)="onFileSelected($event)"
        class="file-input"
        [disabled]="disabled"
        style="display: none;"
      />

      <!-- Indicateur de chargement -->
      <div class="loading-indicator" *ngIf="isUploading">
        <div class="spinner"></div>
        <p>Upload en cours...</p>
      </div>
    </div>
  `,
  styles: [`
    .image-upload-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .preview-zone {
      position: relative;
      width: 200px;
      height: 200px;
      border: 2px dashed #cbd5e1;
      border-radius: 8px;
      overflow: hidden;
      background: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .preview-zone.has-image {
      border-style: solid;
      border-color: #3b82f6;
    }

    .preview-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .image-actions {
      position: absolute;
      top: 8px;
      right: 8px;
      display: flex;
      gap: 4px;
    }

    .btn-remove {
      background: rgba(239, 68, 68, 0.9);
      border: none;
      border-radius: 4px;
      padding: 6px 10px;
      cursor: pointer;
      font-size: 16px;
      transition: background 0.2s;
    }

    .btn-remove:hover {
      background: rgba(220, 38, 38, 1);
    }

    .upload-zone {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .file-input {
      display: none;
    }

    .btn-upload {
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 10px 20px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-upload:hover:not(:disabled) {
      background: #2563eb;
    }

    .btn-upload:disabled {
      background: #cbd5e1;
      cursor: not-allowed;
    }

    .btn-change {
      background: #10b981;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
      align-self: flex-start;
    }

    .btn-change:hover {
      background: #059669;
    }

    .upload-hint {
      font-size: 12px;
      color: #64748b;
      margin: 0;
    }

    .loading-indicator {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 16px;
      background: rgba(59, 130, 246, 0.1);
      border-radius: 8px;
    }

    .spinner {
      width: 24px;
      height: 24px;
      border: 3px solid #e2e8f0;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .loading-indicator p {
      margin: 0;
      font-size: 13px;
      color: #3b82f6;
      font-weight: 500;
    }
  `]
})
export class ImageUploadComponent implements ControlValueAccessor {
  @Input() altText = 'Photo du produit';
  @Input() uploadType: 'achat' | 'vente' = 'achat';
  @Output() photoUploaded = new EventEmitter<string | null>();
  @Output() photoRemoved = new EventEmitter<void>();

  value: string | null = null;
  previewUrl: string | null = null;
  isUploading = false;
  disabled = false;

  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(
    public fileService: FileService,
    private notificationService: NotificationService
  ) {}

  /**
   * Gère la sélection d'un fichier
   */
  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    // Validation du fichier
    const error = this.fileService.validateImageFile(file);
    if (error) {
      this.notificationService.error(error);
      input.value = '';
      return;
    }

    // Créer la prévisualisation
    try {
      this.previewUrl = await this.fileService.createPreviewUrl(file);
    } catch (err) {
      this.notificationService.error('Erreur lors de la prévisualisation');
      return;
    }

    // Upload du fichier
    this.isUploading = true;
    this.fileService.uploadPhoto(file, this.uploadType).subscribe({
      next: (response: any) => {
        // Le backend peut retourner 'url' ou 'photoUrl'
        this.value = response.photoUrl || response.url;
        this.onChange(this.value);
        this.onTouched();
        if (this.value) {
          this.photoUploaded.emit(this.value);
        }
        this.notificationService.success('Photo uploadée avec succès !');
        this.isUploading = false;
      },
      error: (err) => {
        this.previewUrl = null;
        this.notificationService.error(err.error?.message || 'Erreur lors de l\'upload');
        this.isUploading = false;
        input.value = '';
      }
    });
  }

  /**
   * Supprime l'image
   */
  removeImage(): void {
    this.previewUrl = null;
    this.value = null;
    this.onChange(null);
    this.onTouched();
    this.photoRemoved.emit();
  }

  // Implémentation de ControlValueAccessor
  writeValue(value: string | null): void {
    this.value = value;
    this.previewUrl = null;
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
