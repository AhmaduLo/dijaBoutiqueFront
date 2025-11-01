import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ResetPasswordRequest } from '../../../core/models/password-reset.model';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  token = '';
  nouveauMotDePasse = '';
  confirmationMotDePasse = '';
  errorMessage = '';
  successMessage = '';
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Récupérer le token depuis l'URL
    this.token = this.route.snapshot.params['token'] || '';

    if (!this.token) {
      this.errorMessage = 'Token de réinitialisation manquant ou invalide';
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    // Réinitialiser les messages
    this.errorMessage = '';
    this.successMessage = '';

    // Validation de base
    if (!this.nouveauMotDePasse || !this.confirmationMotDePasse) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    // Vérifier la longueur minimale
    if (this.nouveauMotDePasse.length < 6) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
      return;
    }

    // Vérifier que les mots de passe correspondent
    if (this.nouveauMotDePasse !== this.confirmationMotDePasse) {
      this.errorMessage = 'Les mots de passe ne correspondent pas';
      return;
    }

    // Vérifier le token
    if (!this.token) {
      this.errorMessage = 'Token de réinitialisation manquant';
      return;
    }

    this.isLoading = true;

    const request: ResetPasswordRequest = {
      token: this.token,
      nouveauMotDePasse: this.nouveauMotDePasse,
      confirmationMotDePasse: this.confirmationMotDePasse
    };

    this.authService.resetPassword(request).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = response.message || 'Votre mot de passe a été réinitialisé avec succès.';

        // Réinitialiser les champs
        this.nouveauMotDePasse = '';
        this.confirmationMotDePasse = '';

        // Rediriger vers la page de connexion après 3 secondes
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status === 400) {
          this.errorMessage = error.error?.message || 'Token invalide ou expiré';
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
