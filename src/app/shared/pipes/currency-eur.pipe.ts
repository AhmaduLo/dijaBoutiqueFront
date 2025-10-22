import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe pour formater les montants en euros
 * Usage: {{ montant | currencyEur }}
 * Résultat: 1 234,56 €
 */
@Pipe({
  name: 'currencyEur',
  standalone: true
})
export class CurrencyEurPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return '0,00 €';
    }

    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  }
}
