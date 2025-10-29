import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { RegisterRequest } from '../../core/models/auth.model';

/**
 * Composant d'inscription
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1>✨ Dija Boutique</h1>
          <h2>Créer un compte</h2>
          <p>Inscrivez-vous pour gérer votre activité</p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <div class="form-group">
              <label>Prénom *</label>
              <input type="text" formControlName="prenom" placeholder="Votre prénom" />
              <div class="error" *ngIf="registerForm.get('prenom')?.invalid && registerForm.get('prenom')?.touched">
                Le prénom est requis
              </div>
            </div>

            <div class="form-group">
              <label>Nom *</label>
              <input type="text" formControlName="nom" placeholder="Votre nom" />
              <div class="error" *ngIf="registerForm.get('nom')?.invalid && registerForm.get('nom')?.touched">
                Le nom est requis
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Email *</label>
            <input type="email" formControlName="email" placeholder="votre@email.com" />
            <div class="error" *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">
              <span *ngIf="registerForm.get('email')?.errors?.['required']">L'email est requis</span>
              <span *ngIf="registerForm.get('email')?.errors?.['email']">Email invalide</span>
            </div>
          </div>

          <div class="form-group">
            <label>Nom de l'entreprise *</label>
            <input type="text" formControlName="nomEntreprise" placeholder="Ex: Boutique Dija" />
            <div class="error" *ngIf="registerForm.get('nomEntreprise')?.invalid && registerForm.get('nomEntreprise')?.touched">
              Le nom de l'entreprise est requis
            </div>
          </div>

          <div class="form-group">
            <label>Numéro de téléphone *</label>
            <div class="phone-input-group">
              <select formControlName="indicatifPays" class="country-code-select">
                <option *ngFor="let country of countries" [value]="country.code">
                  {{ country.flag }} {{ country.dialCode }}
                </option>
              </select>
              <input
                type="tel"
                formControlName="numeroTelephone"
                placeholder="77 123 45 67"
                class="phone-number-input"
              />
            </div>
            <div class="error" *ngIf="registerForm.get('numeroTelephone')?.invalid && registerForm.get('numeroTelephone')?.touched">
              Le numéro de téléphone est requis
            </div>
          </div>

          <div class="form-group">
            <label>Mot de passe *</label>
            <input type="password" formControlName="password" placeholder="Minimum 6 caractères" />
            <div class="error" *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
              <span *ngIf="registerForm.get('password')?.errors?.['required']">Le mot de passe est requis</span>
              <span *ngIf="registerForm.get('password')?.errors?.['minlength']">Minimum 6 caractères</span>
            </div>
          </div>

          <div class="form-group">
            <label>Confirmer le mot de passe *</label>
            <input type="password" formControlName="confirmPassword" placeholder="Répétez le mot de passe" />
            <div class="error" *ngIf="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched">
              Les mots de passe ne correspondent pas
            </div>
            <div class="error" *ngIf="registerForm.errors?.['passwordMismatch'] && registerForm.get('confirmPassword')?.touched">
              Les mots de passe ne correspondent pas
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-full" [disabled]="registerForm.invalid || isSubmitting">
            {{ isSubmitting ? 'Inscription en cours...' : "S'inscrire" }}
          </button>

          <div class="auth-footer">
            <p>Vous avez déjà un compte ? <a routerLink="/login">Se connecter</a></p>
          </div>
        </form>
      </div>
    </div>
  `,
  styleUrls: ['./auth.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  isSubmitting = false;

  // Liste des pays avec indicatifs téléphoniques
  countries = [
    { code: 'SN', name: 'Sénégal', dialCode: '+221', flag: '🇸🇳' },
    { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
    { code: 'ML', name: 'Mali', dialCode: '+223', flag: '🇲🇱' },
    { code: 'CI', name: 'Côte d\'Ivoire', dialCode: '+225', flag: '🇨🇮' },
    { code: 'BF', name: 'Burkina Faso', dialCode: '+226', flag: '🇧🇫' },
    { code: 'NE', name: 'Niger', dialCode: '+227', flag: '🇳🇪' },
    { code: 'TG', name: 'Togo', dialCode: '+228', flag: '🇹🇬' },
    { code: 'BJ', name: 'Bénin', dialCode: '+229', flag: '🇧🇯' },
    { code: 'MR', name: 'Mauritanie', dialCode: '+222', flag: '🇲🇷' },
    { code: 'GN', name: 'Guinée', dialCode: '+224', flag: '🇬🇳' },
    { code: 'CM', name: 'Cameroun', dialCode: '+237', flag: '🇨🇲' },
    { code: 'GA', name: 'Gabon', dialCode: '+241', flag: '🇬🇦' },
    { code: 'CD', name: 'RD Congo', dialCode: '+243', flag: '🇨🇩' },
    { code: 'CG', name: 'Congo', dialCode: '+242', flag: '🇨🇬' },
    { code: 'MA', name: 'Maroc', dialCode: '+212', flag: '🇲🇦' },
    { code: 'DZ', name: 'Algérie', dialCode: '+213', flag: '🇩🇿' },
    { code: 'TN', name: 'Tunisie', dialCode: '+216', flag: '🇹🇳' },
    { code: 'US', name: 'États-Unis', dialCode: '+1', flag: '🇺🇸' },
    { code: 'GB', name: 'Royaume-Uni', dialCode: '+44', flag: '🇬🇧' },
    { code: 'DE', name: 'Allemagne', dialCode: '+49', flag: '🇩🇪' },
    { code: 'ES', name: 'Espagne', dialCode: '+34', flag: '🇪🇸' },
    { code: 'IT', name: 'Italie', dialCode: '+39', flag: '🇮🇹' },
    { code: 'BE', name: 'Belgique', dialCode: '+32', flag: '🇧🇪' },
    { code: 'CH', name: 'Suisse', dialCode: '+41', flag: '🇨🇭' },
    { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      nomEntreprise: ['', Validators.required],
      indicatifPays: ['SN', Validators.required],
      numeroTelephone: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  /**
   * Validateur personnalisé pour vérifier que les mots de passe correspondent
   */
  passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    const { confirmPassword, password, indicatifPays, numeroTelephone, ...registerData } = this.registerForm.value;

    // Trouver l'indicatif téléphonique du pays sélectionné
    const selectedCountry = this.countries.find(c => c.code === indicatifPays);
    const dialCode = selectedCountry?.dialCode || '+221';

    // Combiner l'indicatif avec le numéro
    const fullPhoneNumber = `${dialCode} ${numeroTelephone}`;

    // Convertir 'password' en 'motDePasse' pour le backend
    const dataToSend: RegisterRequest = {
      ...registerData,
      motDePasse: password,
      numeroTelephone: fullPhoneNumber
    };

    this.authService.register(dataToSend).subscribe({
      next: (response) => {
        this.notificationService.success(`Bienvenue ${response.user.prenom} ! Inscription réussie.`);
        this.router.navigate(['/dashboard']);
        this.isSubmitting = false;
      },
      error: (error) => {
        this.notificationService.error(error.message || 'Erreur lors de l\'inscription');
        this.isSubmitting = false;
      }
    });
  }
}
