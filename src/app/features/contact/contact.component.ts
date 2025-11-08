import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContactService, ContactRequest } from '../../core/services/contact.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/auth.model';

/**
 * Composant de contact pour envoyer des messages au support
 */
@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="contact-page">
      <div class="contact-container">
        <div class="contact-header">
          <h1>📧 Contactez-nous</h1>
          <p>Vous avez une question ou besoin d'assistance ? Envoyez-nous un message et nous vous répondrons dans les plus brefs délais.</p>
        </div>

        <div class="contact-content">
          <!-- Informations de contact -->
          <div class="contact-info">
            <h2>Informations de contact</h2>

            <div class="info-item">
              <div class="info-icon">📧</div>
              <div class="info-details">
                <h3>Email</h3>
                <p>support@heasystock.com</p>
              </div>
            </div>

            <div class="info-item">
              <div class="info-icon">⏰</div>
              <div class="info-details">
                <h3>Temps de réponse</h3>
                <p>24-48 heures (jours ouvrables)</p>
              </div>
            </div>

            <div class="info-item">
              <div class="info-icon">💬</div>
              <div class="info-details">
                <h3>Support</h3>
                <p>Assistance technique et commerciale</p>
              </div>
            </div>

            <div class="tips-section">
              <h3>💡 Conseils pour un meilleur support</h3>
              <ul>
                <li>Soyez précis dans votre description</li>
                <li>Incluez les étapes pour reproduire le problème</li>
                <li>Mentionnez votre navigateur et système d'exploitation</li>
                <li>Joignez des captures d'écran si nécessaire</li>
              </ul>
            </div>
          </div>

          <!-- Formulaire de contact -->
          <div class="contact-form-container">
            <h2>Envoyez-nous un message</h2>

            <form [formGroup]="contactForm" (ngSubmit)="onSubmit()">
              <div class="form-group">
                <label for="nom">Nom complet *</label>
                <input
                  type="text"
                  id="nom"
                  formControlName="nom"
                  placeholder="Votre nom complet"
                  [class.error-input]="contactForm.get('nom')?.invalid && contactForm.get('nom')?.touched"
                />
                <div class="error-message" *ngIf="contactForm.get('nom')?.invalid && contactForm.get('nom')?.touched">
                  <span *ngIf="contactForm.get('nom')?.errors?.['required']">Le nom est requis</span>
                  <span *ngIf="contactForm.get('nom')?.errors?.['maxlength']">Maximum 100 caractères</span>
                </div>
              </div>

              <div class="form-group">
                <label for="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  formControlName="email"
                  placeholder="votre@email.com"
                  [class.error-input]="contactForm.get('email')?.invalid && contactForm.get('email')?.touched"
                />
                <div class="error-message" *ngIf="contactForm.get('email')?.invalid && contactForm.get('email')?.touched">
                  <span *ngIf="contactForm.get('email')?.errors?.['required']">L'email est requis</span>
                  <span *ngIf="contactForm.get('email')?.errors?.['email']">Email invalide</span>
                </div>
              </div>

              <div class="form-group">
                <label for="entreprise">Entreprise *</label>
                <input
                  type="text"
                  id="entreprise"
                  formControlName="entreprise"
                  placeholder="Nom de votre entreprise"
                  [class.error-input]="contactForm.get('entreprise')?.invalid && contactForm.get('entreprise')?.touched"
                />
                <div class="error-message" *ngIf="contactForm.get('entreprise')?.invalid && contactForm.get('entreprise')?.touched">
                  <span *ngIf="contactForm.get('entreprise')?.errors?.['required']">L'entreprise est requise</span>
                  <span *ngIf="contactForm.get('entreprise')?.errors?.['maxlength']">Maximum 100 caractères</span>
                </div>
              </div>

              <div class="form-group">
                <label for="sujet">Sujet *</label>
                <input
                  type="text"
                  id="sujet"
                  formControlName="sujet"
                  placeholder="Résumé de votre demande"
                  [class.error-input]="contactForm.get('sujet')?.invalid && contactForm.get('sujet')?.touched"
                />
                <div class="error-message" *ngIf="contactForm.get('sujet')?.invalid && contactForm.get('sujet')?.touched">
                  <span *ngIf="contactForm.get('sujet')?.errors?.['required']">Le sujet est requis</span>
                  <span *ngIf="contactForm.get('sujet')?.errors?.['maxlength']">Maximum 200 caractères</span>
                </div>
              </div>

              <div class="form-group">
                <label for="message">Message *</label>
                <textarea
                  id="message"
                  formControlName="message"
                  rows="6"
                  placeholder="Décrivez votre demande en détail..."
                  [class.error-input]="contactForm.get('message')?.invalid && contactForm.get('message')?.touched"
                ></textarea>
                <div class="char-counter">
                  {{ contactForm.get('message')?.value?.length || 0 }} / 2000 caractères
                </div>
                <div class="error-message" *ngIf="contactForm.get('message')?.invalid && contactForm.get('message')?.touched">
                  <span *ngIf="contactForm.get('message')?.errors?.['required']">Le message est requis</span>
                  <span *ngIf="contactForm.get('message')?.errors?.['minlength']">Minimum 10 caractères</span>
                  <span *ngIf="contactForm.get('message')?.errors?.['maxlength']">Maximum 2000 caractères</span>
                </div>
              </div>

              <div class="form-actions">
                <button
                  type="submit"
                  class="btn btn-primary btn-large"
                  [disabled]="contactForm.invalid || isSubmitting"
                >
                  {{ isSubmitting ? '📤 Envoi en cours...' : '📧 Envoyer le message' }}
                </button>
              </div>
            </form>

            <div class="success-message" *ngIf="showSuccessMessage">
              ✅ Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .contact-page {
      padding: 2rem;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      min-height: calc(100vh - 80px);
    }

    .contact-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .contact-header {
      text-align: center;
      margin-bottom: 3rem;
      color: #1e40af;

      h1 {
        font-size: 2.5rem;
        margin-bottom: 1rem;
        font-weight: 700;
      }

      p {
        font-size: 1.1rem;
        color: #666;
        max-width: 600px;
        margin: 0 auto;
        line-height: 1.6;
      }
    }

    .contact-content {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 2rem;

      @media (max-width: 968px) {
        grid-template-columns: 1fr;
      }
    }

    .contact-info {
      background: white;
      padding: 2rem;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      height: fit-content;

      h2 {
        font-size: 1.5rem;
        color: #1e40af;
        margin-bottom: 1.5rem;
        font-weight: 600;
      }
    }

    .info-item {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: #f8fafc;
      border-radius: 12px;
      transition: transform 0.2s ease;

      &:hover {
        transform: translateX(5px);
      }

      .info-icon {
        font-size: 2rem;
        flex-shrink: 0;
      }

      .info-details {
        h3 {
          font-size: 1rem;
          color: #333;
          margin-bottom: 0.25rem;
          font-weight: 600;
        }

        p {
          color: #666;
          font-size: 0.9rem;
          margin: 0;
        }
      }
    }

    .tips-section {
      margin-top: 2rem;
      padding: 1.5rem;
      background: #e0f2fe;
      border-radius: 12px;
      border-left: 4px solid #1e40af;

      h3 {
        font-size: 1rem;
        color: #1e40af;
        margin-bottom: 1rem;
        font-weight: 600;
      }

      ul {
        margin: 0;
        padding-left: 1.5rem;

        li {
          color: #555;
          font-size: 0.9rem;
          line-height: 1.8;
          margin-bottom: 0.5rem;
        }
      }
    }

    .contact-form-container {
      background: white;
      padding: 2rem;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

      h2 {
        font-size: 1.5rem;
        color: #1e40af;
        margin-bottom: 1.5rem;
        font-weight: 600;
      }
    }

    .form-group {
      margin-bottom: 1.5rem;

      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #333;
        font-size: 0.95rem;
      }

      input,
      textarea {
        width: 100%;
        padding: 0.875rem 1rem;
        border: 2px solid #e0e0e0;
        border-radius: 10px;
        font-size: 1rem;
        transition: all 0.2s ease;
        font-family: inherit;

        &:focus {
          outline: none;
          border-color: #1e40af;
          box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1);
        }

        &::placeholder {
          color: #999;
        }

        &.error-input {
          border-color: #c62828;
        }
      }

      textarea {
        resize: vertical;
        min-height: 120px;
      }
    }

    .char-counter {
      text-align: right;
      font-size: 0.85rem;
      color: #666;
      margin-top: 0.25rem;
    }

    .error-message {
      color: #c62828;
      font-size: 0.85rem;
      margin-top: 0.25rem;
      display: block;
    }

    .form-actions {
      margin-top: 2rem;

      .btn-large {
        width: 100%;
        padding: 1rem;
        font-size: 1.05rem;
        font-weight: 600;
      }
    }

    .success-message {
      margin-top: 1.5rem;
      padding: 1rem 1.5rem;
      background: #d1fae5;
      border-left: 4px solid #10b981;
      border-radius: 8px;
      color: #065f46;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .contact-page {
        padding: 1rem;
      }

      .contact-header h1 {
        font-size: 2rem;
      }

      .contact-info,
      .contact-form-container {
        padding: 1.5rem;
      }
    }
  `]
})
export class ContactComponent implements OnInit {
  contactForm: FormGroup;
  isSubmitting = false;
  showSuccessMessage = false;
  currentUser: User | null = null;

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {
    this.contactForm = this.fb.group({
      nom: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      entreprise: ['', [Validators.required, Validators.maxLength(100)]],
      sujet: ['', [Validators.required, Validators.maxLength(200)]],
      message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]]
    });
  }

  ngOnInit(): void {
    // Pré-remplir le formulaire avec les informations de l'utilisateur connecté
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.contactForm.patchValue({
        nom: `${this.currentUser.prenom} ${this.currentUser.nom}`,
        email: this.currentUser.email,
        entreprise: this.currentUser.nomEntreprise || ''
      });
    }
  }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      Object.keys(this.contactForm.controls).forEach(key => {
        this.contactForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.showSuccessMessage = false;

    const contactData: ContactRequest = this.contactForm.value;

    this.contactService.sendContactMessage(contactData).subscribe({
      next: (response) => {
        this.notificationService.success(response.message);
        this.showSuccessMessage = true;

        // Réinitialiser le formulaire sauf les infos personnelles
        this.contactForm.patchValue({
          sujet: '',
          message: ''
        });
        this.contactForm.markAsUntouched();

        this.isSubmitting = false;

        // Masquer le message de succès après 5 secondes
        setTimeout(() => {
          this.showSuccessMessage = false;
        }, 5000);
      },
      error: (error) => {
        this.notificationService.error(error.message || 'Une erreur est survenue lors de l\'envoi du message');
        this.isSubmitting = false;
      }
    });
  }
}
