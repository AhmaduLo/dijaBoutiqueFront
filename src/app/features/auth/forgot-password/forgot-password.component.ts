import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ForgotPasswordRequest } from '../../../core/models/password-reset.model';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email = '';
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    // Réinitialiser les messages
    this.errorMessage = '';
    this.successMessage = '';

    // Validation de base
    if (!this.email || !this.email.trim()) {
      this.errorMessage = 'Veuillez saisir votre adresse email';
      return;
    }

    // Validation format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Veuillez saisir une adresse email valide';
      return;
    }

    this.isLoading = true;

    const request: ForgotPasswordRequest = {
      email: this.email.trim()
    };

    this.authService.forgotPassword(request).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = response.message || 'Un email de réinitialisation a été envoyé à votre adresse.';
        this.email = ''; // Réinitialiser le champ
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status === 404) {
          this.errorMessage = 'Aucun compte n\'existe avec cette adresse email';
        } else if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
        }
      }
    });
  }

  retourConnexion(): void {
    this.router.navigate(['/login']);
  }
}
