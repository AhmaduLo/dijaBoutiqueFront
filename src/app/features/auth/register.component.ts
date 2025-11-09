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
          <h1>✨ HeasyStock</h1>
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
            <label>Adresse de l'entreprise *</label>
            <input type="text" formControlName="adresseEntreprise" placeholder="Ex: Dakar, Sénégal" />
            <div class="error" *ngIf="registerForm.get('adresseEntreprise')?.invalid && registerForm.get('adresseEntreprise')?.touched">
              L'adresse de l'entreprise est requise
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
            <label>NINEA / SIRET (optionnel)</label>
            <input type="text" formControlName="nineaSiret" placeholder="Ex: 123456789" />
            <small style="color: #666; display: block; margin-top: 0.25rem;">
              Numéro d'identification de votre entreprise (NINEA pour le Sénégal, SIRET pour la France)
            </small>
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

          <div class="terms-section">
            <div class="form-group-checkbox">
              <label class="checkbox-label">
                <input type="checkbox" formControlName="acceptationCGU" />
                <span>J'accepte les <a href="#" (click)="openCGUModal($event)">Conditions Générales d'Utilisation (CGU)</a> *</span>
              </label>
              <div class="error" *ngIf="registerForm.get('acceptationCGU')?.invalid && registerForm.get('acceptationCGU')?.touched">
                Vous devez accepter les CGU pour continuer
              </div>
            </div>

            <div class="form-group-checkbox">
              <label class="checkbox-label">
                <input type="checkbox" formControlName="acceptationPolitiqueConfidentialite" />
                <span>J'accepte la <a href="#" (click)="openPolitiqueModal($event)">Politique de Confidentialité</a> *</span>
              </label>
              <div class="error" *ngIf="registerForm.get('acceptationPolitiqueConfidentialite')?.invalid && registerForm.get('acceptationPolitiqueConfidentialite')?.touched">
                Vous devez accepter la Politique de Confidentialité pour continuer
              </div>
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

      <!-- Modal CGU -->
      <div class="modal-overlay" *ngIf="showCGUModal" (click)="closeCGUModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Conditions Générales d'Utilisation (CGU)</h2>
            <button class="modal-close" (click)="closeCGUModal()">&times;</button>
          </div>
          <div class="modal-body">
            <h3>1. Objet</h3>
            <p>Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme HeasyStock, une application de gestion de stock et de comptabilité destinée aux commerçants.</p>

            <h3>2. Acceptation des CGU</h3>
            <p>L'accès et l'utilisation de HeasyStock impliquent l'acceptation pleine et entière des présentes CGU. En créant un compte, vous acceptez sans réserve ces conditions.</p>

            <h3>3. Inscription et Compte Utilisateur</h3>
            <p>Pour utiliser HeasyStock, vous devez créer un compte en fournissant des informations exactes et complètes. Vous êtes responsable de la confidentialité de vos identifiants de connexion.</p>

            <h3>4. Services Proposés</h3>
            <p>HeasyStock offre les services suivants :</p>
            <ul>
              <li>Gestion des stocks et inventaire</li>
              <li>Suivi des ventes et achats</li>
              <li>Gestion des clients et fournisseurs</li>
              <li>Génération de rapports financiers</li>
              <li>Gestion multi-devises</li>
            </ul>

            <h3>5. Obligations de l'Utilisateur</h3>
            <p>Vous vous engagez à :</p>
            <ul>
              <li>Utiliser la plateforme de manière légale et conforme</li>
              <li>Ne pas tenter de pirater ou perturber le service</li>
              <li>Maintenir la confidentialité de vos identifiants</li>
              <li>Fournir des informations exactes et à jour</li>
            </ul>

            <h3>6. Propriété Intellectuelle</h3>
            <p>Tous les contenus présents sur HeasyStock (textes, graphiques, logos, etc.) sont la propriété exclusive de HeasyStock et sont protégés par les lois sur la propriété intellectuelle.</p>

            <h3>7. Limitation de Responsabilité</h3>
            <p>HeasyStock ne saurait être tenu responsable des dommages directs ou indirects résultant de l'utilisation ou de l'impossibilité d'utiliser la plateforme.</p>

            <h3>8. Modification des CGU</h3>
            <p>HeasyStock se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés des modifications par notification sur la plateforme.</p>

            <h3>9. Résiliation</h3>
            <p>Vous pouvez résilier votre compte à tout moment. HeasyStock se réserve le droit de suspendre ou résilier votre compte en cas de violation des CGU.</p>

            <h3>10. Loi Applicable</h3>
            <p>Les présentes CGU sont régies par le droit sénégalais. Tout litige sera soumis aux tribunaux compétents de Dakar.</p>

            <p class="update-date"><strong>Dernière mise à jour :</strong> {{getCurrentDate()}}</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary" (click)="closeCGUModal()">J'ai compris</button>
          </div>
        </div>
      </div>

      <!-- Modal Politique de Confidentialité -->
      <div class="modal-overlay" *ngIf="showPolitiqueModal" (click)="closePolitiqueModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Politique de Confidentialité</h2>
            <button class="modal-close" (click)="closePolitiqueModal()">&times;</button>
          </div>
          <div class="modal-body">
            <h3>1. Introduction</h3>
            <p>HeasyStock s'engage à protéger la confidentialité de vos données personnelles. Cette politique décrit comment nous collectons, utilisons et protégeons vos informations.</p>

            <h3>2. Données Collectées</h3>
            <p>Nous collectons les données suivantes :</p>
            <ul>
              <li><strong>Données d'identification :</strong> nom, prénom, email, numéro de téléphone</li>
              <li><strong>Données d'entreprise :</strong> nom de l'entreprise, adresse, secteur d'activité</li>
              <li><strong>Données d'utilisation :</strong> logs de connexion, actions effectuées sur la plateforme</li>
              <li><strong>Données commerciales :</strong> produits, clients, fournisseurs, transactions</li>
            </ul>

            <h3>3. Utilisation des Données</h3>
            <p>Vos données sont utilisées pour :</p>
            <ul>
              <li>Fournir et améliorer nos services</li>
              <li>Gérer votre compte utilisateur</li>
              <li>Générer des rapports et statistiques</li>
              <li>Vous contacter concernant votre compte</li>
              <li>Assurer la sécurité de la plateforme</li>
            </ul>

            <h3>4. Protection des Données</h3>
            <p>Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données :</p>
            <ul>
              <li>Chiffrement des données sensibles</li>
              <li>Authentification sécurisée (cookies HttpOnly)</li>
              <li>Accès limité aux données personnelles</li>
              <li>Sauvegardes régulières</li>
              <li>Surveillance continue de la sécurité</li>
            </ul>

            <h3>5. Partage des Données</h3>
            <p>Vos données ne sont jamais vendues à des tiers. Elles peuvent être partagées uniquement dans les cas suivants :</p>
            <ul>
              <li>Avec votre consentement explicite</li>
              <li>Pour respecter une obligation légale</li>
              <li>Pour protéger nos droits et notre sécurité</li>
            </ul>

            <h3>6. Conservation des Données</h3>
            <p>Nous conservons vos données aussi longtemps que votre compte est actif ou selon les exigences légales applicables.</p>

            <h3>7. Vos Droits</h3>
            <p>Conformément au RGPD et aux lois applicables, vous disposez des droits suivants :</p>
            <ul>
              <li><strong>Droit d'accès :</strong> consulter vos données personnelles</li>
              <li><strong>Droit de rectification :</strong> corriger vos données inexactes</li>
              <li><strong>Droit à l'effacement :</strong> supprimer votre compte et vos données</li>
              <li><strong>Droit à la portabilité :</strong> exporter vos données</li>
              <li><strong>Droit d'opposition :</strong> refuser certains traitements</li>
            </ul>

            <h3>8. Cookies</h3>
            <p>Nous utilisons des cookies pour améliorer votre expérience et sécuriser votre connexion. Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur.</p>

            <h3>9. Modifications de la Politique</h3>
            <p>Nous pouvons modifier cette politique de confidentialité. Les changements significatifs vous seront notifiés par email ou via la plateforme.</p>

            <h3>10. Contact</h3>
            <p>Pour toute question concernant cette politique ou vos données personnelles, contactez-nous à : <strong>privacy@heasystock.com</strong></p>

            <p class="update-date"><strong>Dernière mise à jour :</strong> {{getCurrentDate()}}</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary" (click)="closePolitiqueModal()">J'ai compris</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./auth.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  isSubmitting = false;
  showCGUModal = false;
  showPolitiqueModal = false;

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
      adresseEntreprise: ['', Validators.required],
      indicatifPays: ['SN', Validators.required],
      numeroTelephone: ['', Validators.required],
      nineaSiret: [''], // Optionnel
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      acceptationCGU: [false, Validators.requiredTrue],
      acceptationPolitiqueConfidentialite: [false, Validators.requiredTrue]
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
    const { confirmPassword, password, indicatifPays, numeroTelephone, acceptationCGU, acceptationPolitiqueConfidentialite, ...registerData } = this.registerForm.value;

    // Trouver l'indicatif téléphonique du pays sélectionné
    const selectedCountry = this.countries.find(c => c.code === indicatifPays);
    const dialCode = selectedCountry?.dialCode || '+221';

    // Combiner l'indicatif avec le numéro
    const fullPhoneNumber = `${dialCode} ${numeroTelephone}`;

    // Convertir 'password' en 'motDePasse' pour le backend
    const dataToSend: RegisterRequest = {
      ...registerData,
      motDePasse: password,
      numeroTelephone: fullPhoneNumber,
      acceptationCGU: acceptationCGU,
      acceptationPolitiqueConfidentialite: acceptationPolitiqueConfidentialite
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

  /**
   * Ouvrir le modal des CGU
   */
  openCGUModal(event: Event): void {
    event.preventDefault();
    this.showCGUModal = true;
  }

  /**
   * Fermer le modal des CGU
   */
  closeCGUModal(): void {
    this.showCGUModal = false;
  }

  /**
   * Ouvrir le modal de la Politique de Confidentialité
   */
  openPolitiqueModal(event: Event): void {
    event.preventDefault();
    this.showPolitiqueModal = true;
  }

  /**
   * Fermer le modal de la Politique de Confidentialité
   */
  closePolitiqueModal(): void {
    this.showPolitiqueModal = false;
  }

  /**
   * Obtenir la date actuelle formatée
   */
  getCurrentDate(): string {
    return new Date().toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }
}
