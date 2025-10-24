import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { CurrencyService } from '../../core/services/currency.service';
import { User } from '../../core/models/auth.model';
import {
  Utilisateur,
  CreateUtilisateurDto,
  StatistiquesAdmin,
  UserRole
} from '../../core/models/admin.model';
import { Currency, CreateCurrencyDto, DEVISES_COMMUNES } from '../../core/models/currency.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  // Onglets
  activeTab: 'users' | 'currencies' = 'users';

  // Utilisateurs
  utilisateurs: Utilisateur[] = [];
  filteredUtilisateurs: Utilisateur[] = [];
  statistiques?: StatistiquesAdmin;
  userForm: FormGroup;
  showForm = false;
  isEditing = false;
  isLoading = true;
  isSubmitting = false;
  searchTerm = '';
  selectedRole = '';
  currentUserId?: number;
  currentUser?: User;
  userRoles = UserRole;
  showPassword = false;

  // Devises
  currencies: Currency[] = [];
  filteredCurrencies: Currency[] = [];
  currencyForm: FormGroup;
  showCurrencyForm = false;
  isEditingCurrency = false;
  currentCurrencyId?: number;
  searchCurrency = '';
  devisesCommunes = DEVISES_COMMUNES;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private authService: AuthService,
    private currencyService: CurrencyService,
    private notificationService: NotificationService
  ) {
    this.currentUser = this.authService.getCurrentUser() || undefined;

    this.userForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required, Validators.minLength(6)]],
      role: [UserRole.USER, Validators.required]
    });

    this.currencyForm = this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(10)]],
      nom: ['', Validators.required],
      symbole: ['', [Validators.required, Validators.maxLength(10)]],
      pays: ['', Validators.required],
      tauxChange: [1, [Validators.required, Validators.min(0.001)]],
      isDefault: [false]
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    Promise.all([
      this.adminService.getAllUtilisateurs().toPromise(),
      this.adminService.getStatistiques().toPromise()
    ]).then(([utilisateurs, statistiques]) => {
      this.utilisateurs = utilisateurs || [];
      this.statistiques = statistiques;
      this.filteredUtilisateurs = [...this.utilisateurs];
      this.isLoading = false;
    }).catch(error => {
      console.error('Erreur lors du chargement:', error);
      this.notificationService.error('Erreur lors du chargement des données');
      this.isLoading = false;
    });
  }

  filterUtilisateurs(): void {
    let result = [...this.utilisateurs];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(u =>
        u.nom.toLowerCase().includes(term) ||
        u.prenom.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
      );
    }

    if (this.selectedRole) {
      result = result.filter(u => u.role === this.selectedRole);
    }

    this.filteredUtilisateurs = result;
  }

  openForm(): void {
    this.showForm = true;
    this.isEditing = false;
    this.userForm.reset({ role: UserRole.USER });
    this.userForm.get('motDePasse')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('motDePasse')?.updateValueAndValidity();
  }

  closeForm(): void {
    this.showForm = false;
    this.isEditing = false;
    this.currentUserId = undefined;
    this.userForm.reset();
  }

  generatePassword(): void {
    const password = this.adminService.generateTemporaryPassword();
    this.userForm.patchValue({ motDePasse: password });
    this.notificationService.info(`Mot de passe généré: ${password}`);
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      Object.keys(this.userForm.controls).forEach(key => {
        this.userForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    const formValue = this.userForm.getRawValue();

    if (this.isEditing && this.currentUserId) {
      // Mise à jour
      const updateData = { ...formValue };
      if (!updateData.motDePasse) {
        delete updateData.motDePasse;
      }

      this.adminService.updateUtilisateur(this.currentUserId, updateData).subscribe({
        next: () => {
          this.notificationService.success('Utilisateur modifié avec succès');
          this.closeForm();
          this.loadData();
          this.isSubmitting = false;
        },
        error: (error) => {
          this.notificationService.error(error.error?.message || 'Erreur lors de la modification');
          this.isSubmitting = false;
        }
      });
    } else {
      // Création
      const createData: CreateUtilisateurDto = formValue;

      this.adminService.createUtilisateur(createData).subscribe({
        next: (response) => {
          this.notificationService.success('Utilisateur créé avec succès');
          this.notificationService.info(`Email: ${response.email} | Mot de passe: ${formValue.motDePasse}`);
          this.closeForm();
          this.loadData();
          this.isSubmitting = false;
        },
        error: (error) => {
          this.notificationService.error(error.error?.message || 'Erreur lors de la création');
          this.isSubmitting = false;
        }
      });
    }
  }

  editUser(user: Utilisateur): void {
    if (!user.id) return;
    this.isEditing = true;
    this.currentUserId = user.id;
    this.showForm = true;
    this.userForm.patchValue({
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role
    });
    this.userForm.get('motDePasse')?.clearValidators();
    this.userForm.get('motDePasse')?.updateValueAndValidity();
  }

  deleteUser(user: Utilisateur): void {
    if (!user.id) return;

    if (user.id === this.currentUser?.id) {
      this.notificationService.error('Vous ne pouvez pas supprimer votre propre compte');
      return;
    }

    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${user.prenom} ${user.nom} ?`)) {
      return;
    }

    this.adminService.deleteUtilisateur(user.id).subscribe({
      next: () => {
        this.notificationService.success('Utilisateur supprimé avec succès');
        this.loadData();
      },
      error: (error) => {
        this.notificationService.error(error.error?.message || 'Erreur lors de la suppression');
      }
    });
  }

  changeRole(user: Utilisateur): void {
    if (!user.id) return;

    const newRole = user.role === UserRole.ADMIN ? UserRole.USER : UserRole.ADMIN;
    const confirmMessage = `Changer le rôle de ${user.prenom} ${user.nom} en ${this.getRoleLabel(newRole)} ?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    this.adminService.changeRole(user.id, newRole).subscribe({
      next: () => {
        this.notificationService.success('Rôle modifié avec succès');
        this.loadData();
      },
      error: (error) => {
        this.notificationService.error(error.error?.message || 'Erreur lors du changement de rôle');
      }
    });
  }

  getRoleLabel(role: UserRole): string {
    return this.adminService.getRoleLabel(role);
  }

  getRoleColor(role: UserRole): string {
    return this.adminService.getRoleColor(role);
  }

  getRoleIcon(role: UserRole): string {
    return this.adminService.getRoleIcon(role);
  }

  // ==================== GESTION DES DEVISES ====================

  switchTab(tab: 'users' | 'currencies'): void {
    this.activeTab = tab;
    if (tab === 'currencies' && this.currencies.length === 0) {
      this.loadCurrencies();
    }
  }

  loadCurrencies(): void {
    this.isLoading = true;
    this.currencyService.getAllCurrencies().subscribe({
      next: (currencies) => {
        this.currencies = currencies;
        this.filteredCurrencies = [...currencies];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des devises:', error);
        this.notificationService.error('Erreur lors du chargement des devises');
        this.isLoading = false;
      }
    });
  }

  filterCurrencies(): void {
    let result = [...this.currencies];

    if (this.searchCurrency.trim()) {
      const term = this.searchCurrency.toLowerCase();
      result = result.filter(c =>
        c.code.toLowerCase().includes(term) ||
        c.nom.toLowerCase().includes(term) ||
        c.pays.toLowerCase().includes(term) ||
        c.symbole.toLowerCase().includes(term)
      );
    }

    this.filteredCurrencies = result;
  }

  openCurrencyForm(): void {
    this.showCurrencyForm = true;
    this.isEditingCurrency = false;
    this.currencyForm.reset({ tauxChange: 1, isDefault: false });
  }

  closeCurrencyForm(): void {
    this.showCurrencyForm = false;
    this.isEditingCurrency = false;
    this.currentCurrencyId = undefined;
    this.currencyForm.reset();
  }

  addPredefinedCurrency(devise: Omit<Currency, 'id'>): void {
    this.currencyForm.patchValue(devise);
  }

  onSubmitCurrency(): void {
    if (this.currencyForm.invalid) {
      Object.keys(this.currencyForm.controls).forEach(key => {
        this.currencyForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    const formValue = this.currencyForm.getRawValue();

    if (this.isEditingCurrency && this.currentCurrencyId) {
      // Mise à jour
      this.currencyService.updateCurrency(this.currentCurrencyId, formValue).subscribe({
        next: () => {
          this.notificationService.success('Devise modifiée avec succès');
          this.closeCurrencyForm();
          this.loadCurrencies();
          this.isSubmitting = false;
        },
        error: (error) => {
          this.notificationService.error(error.error?.message || 'Erreur lors de la modification');
          this.isSubmitting = false;
        }
      });
    } else {
      // Création
      const createData: CreateCurrencyDto = formValue;

      this.currencyService.createCurrency(createData).subscribe({
        next: () => {
          this.notificationService.success('Devise créée avec succès');
          this.closeCurrencyForm();
          this.loadCurrencies();
          this.isSubmitting = false;
        },
        error: (error) => {
          this.notificationService.error(error.error?.message || 'Erreur lors de la création');
          this.isSubmitting = false;
        }
      });
    }
  }

  editCurrency(currency: Currency): void {
    if (!currency.id) return;
    this.isEditingCurrency = true;
    this.currentCurrencyId = currency.id;
    this.showCurrencyForm = true;
    this.currencyForm.patchValue({
      code: currency.code,
      nom: currency.nom,
      symbole: currency.symbole,
      pays: currency.pays,
      tauxChange: currency.tauxChange || 1,
      isDefault: currency.isDefault || false
    });
  }

  deleteCurrency(currency: Currency): void {
    if (!currency.id) return;

    if (currency.isDefault) {
      this.notificationService.error('Vous ne pouvez pas supprimer la devise par défaut');
      return;
    }

    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${currency.nom} (${currency.code}) ?`)) {
      return;
    }

    this.currencyService.deleteCurrency(currency.id).subscribe({
      next: () => {
        this.notificationService.success('Devise supprimée avec succès');
        this.loadCurrencies();
      },
      error: (error) => {
        this.notificationService.error(error.error?.message || 'Erreur lors de la suppression');
      }
    });
  }

  setDefaultCurrency(currency: Currency): void {
    if (!currency.id) return;

    if (currency.isDefault) {
      this.notificationService.info('Cette devise est déjà la devise par défaut');
      return;
    }

    const confirmMessage = `Définir ${currency.nom} (${currency.code}) comme devise par défaut ?`;
    if (!confirm(confirmMessage)) {
      return;
    }

    this.currencyService.setDefaultCurrency(currency.id).subscribe({
      next: () => {
        this.notificationService.success('Devise par défaut modifiée avec succès');
        this.loadCurrencies();
      },
      error: (error) => {
        this.notificationService.error(error.error?.message || 'Erreur lors du changement');
      }
    });
  }
}
