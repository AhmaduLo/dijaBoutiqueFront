import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
}

export interface ConfirmDialogResult {
  isVisible: boolean;
  data?: ConfirmDialogData;
  resolver?: (value: boolean) => void;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmService {
  private dialogSubject = new BehaviorSubject<ConfirmDialogResult>({
    isVisible: false
  });
  public dialog$ = this.dialogSubject.asObservable();

  constructor() {}

  /**
   * Affiche un modal de confirmation et retourne une promesse
   */
  confirm(data: ConfirmDialogData): Promise<boolean> {
    return new Promise((resolve) => {
      this.dialogSubject.next({
        isVisible: true,
        data: {
          ...data,
          confirmText: data.confirmText || 'Confirmer',
          cancelText: data.cancelText || 'Annuler',
          type: data.type || 'warning'
        },
        resolver: resolve
      });
    });
  }

  /**
   * Confirme l'action (appelé par le composant modal)
   */
  confirmAction(): void {
    const current = this.dialogSubject.value;
    if (current.resolver) {
      current.resolver(true);
    }
    this.close();
  }

  /**
   * Annule l'action (appelé par le composant modal)
   */
  cancelAction(): void {
    const current = this.dialogSubject.value;
    if (current.resolver) {
      current.resolver(false);
    }
    this.close();
  }

  /**
   * Ferme le modal
   */
  close(): void {
    this.dialogSubject.next({
      isVisible: false
    });
  }
}
