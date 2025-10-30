import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ConfirmService, ConfirmDialogData } from '../../../core/services/confirm.service';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss']
})
export class ConfirmModalComponent implements OnInit, OnDestroy {
  isVisible = false;
  data?: ConfirmDialogData;

  private subscription?: Subscription;

  constructor(private confirmService: ConfirmService) {}

  ngOnInit(): void {
    this.subscription = this.confirmService.dialog$.subscribe(dialog => {
      this.isVisible = dialog.isVisible;
      this.data = dialog.data;
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  onConfirm(): void {
    this.confirmService.confirmAction();
  }

  onCancel(): void {
    this.confirmService.cancelAction();
  }

  onOverlayClick(): void {
    this.confirmService.cancelAction();
  }

  getIconByType(): string {
    switch (this.data?.type) {
      case 'danger':
        return '⚠️';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'success':
        return '✓';
      default:
        return '?';
    }
  }

  getColorByType(): string {
    switch (this.data?.type) {
      case 'danger':
        return '#dc3545';
      case 'warning':
        return '#ffc107';
      case 'info':
        return '#0dcaf0';
      case 'success':
        return '#198754';
      default:
        return '#6c757d';
    }
  }
}
