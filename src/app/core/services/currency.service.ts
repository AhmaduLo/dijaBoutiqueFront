import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Currency, CreateCurrencyDto, UpdateCurrencyDto } from '../models/currency.model';

/**
 * Service de gestion des devises
 */
@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private readonly API_URL = 'http://localhost:8080/api/devises';

  // Observable pour la devise par défaut
  private defaultCurrencySubject = new BehaviorSubject<Currency | null>(null);
  public defaultCurrency$ = this.defaultCurrencySubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadDefaultCurrency();
  }

  /**
   * Récupère toutes les devises
   */
  getAllCurrencies(): Observable<Currency[]> {
    return this.http.get<Currency[]>(this.API_URL);
  }

  /**
   * Récupère une devise par son ID
   */
  getCurrencyById(id: number): Observable<Currency> {
    return this.http.get<Currency>(`${this.API_URL}/${id}`);
  }

  /**
   * Récupère la devise par défaut du système
   */
  getDefaultCurrency(): Observable<Currency> {
    return this.http.get<Currency>(`${this.API_URL}/default`).pipe(
      tap(currency => this.defaultCurrencySubject.next(currency))
    );
  }

  /**
   * Crée une nouvelle devise
   */
  createCurrency(data: CreateCurrencyDto): Observable<Currency> {
    return this.http.post<Currency>(this.API_URL, data).pipe(
      tap(currency => {
        if (currency.isDefault) {
          this.defaultCurrencySubject.next(currency);
        }
      })
    );
  }

  /**
   * Met à jour une devise
   */
  updateCurrency(id: number, data: UpdateCurrencyDto): Observable<Currency> {
    return this.http.put<Currency>(`${this.API_URL}/${id}`, data).pipe(
      tap(currency => {
        if (currency.isDefault) {
          this.defaultCurrencySubject.next(currency);
        }
      })
    );
  }

  /**
   * Supprime une devise
   */
  deleteCurrency(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  /**
   * Définit une devise comme devise par défaut
   */
  setDefaultCurrency(id: number): Observable<Currency> {
    return this.http.put<Currency>(`${this.API_URL}/${id}/set-default`, {}).pipe(
      tap(currency => this.defaultCurrencySubject.next(currency))
    );
  }

  /**
   * Charge la devise par défaut au démarrage
   */
  private loadDefaultCurrency(): void {
    this.getDefaultCurrency().subscribe({
      next: (currency) => {
        // Devise chargée
      },
      error: () => {
        // En cas d'erreur, utiliser une devise par défaut
        this.defaultCurrencySubject.next({
          code: 'XOF',
          nom: 'Franc CFA',
          symbole: 'CFA',
          pays: 'Sénégal',
          isDefault: true
        });
      }
    });
  }

  /**
   * Formate un montant avec la devise
   */
  formatAmount(amount: number, currency?: Currency): string {
    const curr = currency || this.defaultCurrencySubject.value;
    if (!curr) {
      return amount.toLocaleString('fr-FR');
    }

    return `${amount.toLocaleString('fr-FR')} ${curr.symbole}`;
  }

  /**
   * Convertit un montant d'une devise à une autre
   */
  convertAmount(amount: number, fromCurrency: Currency, toCurrency: Currency): number {
    if (!fromCurrency.tauxChange || !toCurrency.tauxChange) {
      return amount;
    }

    // Conversion via la devise de référence
    const amountInReference = amount / fromCurrency.tauxChange;
    return amountInReference * toCurrency.tauxChange;
  }
}
