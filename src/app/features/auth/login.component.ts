import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { LoginRequest } from '../../core/models/auth.model';

/**
 * Composant de connexion
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1>✨ Dija Boutique</h1>
          <h2>Connexion</h2>
          <p>Connectez-vous à votre compte</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Email *</label>
            <input type="email" formControlName="email" placeholder="votre@email.com" autofocus />
            <div class="error" *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
              <span *ngIf="loginForm.get('email')?.errors?.['required']">L'email est requis</span>
              <span *ngIf="loginForm.get('email')?.errors?.['email']">Email invalide</span>
            </div>
          </div>

          <div class="form-group">
            <label>Mot de passe *</label>
            <input type="password" formControlName="password" placeholder="Votre mot de passe" />
            <div class="error" *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
              Le mot de passe est requis
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-full" [disabled]="loginForm.invalid || isSubmitting">
            {{ isSubmitting ? 'Connexion...' : 'Se connecter' }}
          </button>

          <div class="auth-footer">
            <p>Vous n'avez pas de compte ? <a routerLink="/register">S'inscrire</a></p>
          </div>
        </form>
      </div>
    </div>
  `,
  styleUrls: ['./auth.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    const { email, password } = this.loginForm.value;

    // Convertir 'password' en 'motDePasse' pour le backend
    const credentials: LoginRequest = {
      email,
      motDePasse: password
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.notificationService.success(`Bienvenue ${response.user.prenom} !`);
        this.router.navigate(['/dashboard']);
        this.isSubmitting = false;
      },
      error: (error) => {
        this.notificationService.error(error.message || 'Email ou mot de passe incorrect');
        this.isSubmitting = false;
      }
    });
  }
}
