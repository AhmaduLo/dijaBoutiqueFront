import { Injectable } from '@angular/core';

/**
 * Service pour générer des numéros de facture séquentiels
 */
@Injectable({
  providedIn: 'root'
})
export class FactureNumeroService {
  private readonly STORAGE_KEY = 'dernierNumeroFacture';
  private readonly PREFIX = 'FAC';

  constructor() {}

  /**
   * Génère le prochain numéro de facture au format FAC-XXX
   * @returns Numéro de facture (ex: FAC-001, FAC-002, etc.)
   */
  genererNumeroFacture(): string {
    // Récupérer le dernier numéro utilisé
    const dernierNumero = this.getDernierNumero();

    // Incrémenter
    const nouveauNumero = dernierNumero + 1;

    // Sauvegarder
    this.saveDernierNumero(nouveauNumero);

    // Formater avec padding (FAC-001, FAC-002, etc.)
    return `${this.PREFIX}-${nouveauNumero.toString().padStart(3, '0')}`;
  }

  /**
   * Récupère le dernier numéro de facture utilisé
   */
  private getDernierNumero(): number {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? parseInt(stored, 10) : 0;
  }

  /**
   * Sauvegarde le dernier numéro de facture utilisé
   */
  private saveDernierNumero(numero: number): void {
    localStorage.setItem(this.STORAGE_KEY, numero.toString());
  }

  /**
   * Réinitialise le compteur (uniquement pour l'administration)
   */
  reinitialiserCompteur(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Récupère le prochain numéro sans l'incrémenter (aperçu)
   */
  getProchainNumero(): string {
    const prochain = this.getDernierNumero() + 1;
    return `${this.PREFIX}-${prochain.toString().padStart(3, '0')}`;
  }
}
