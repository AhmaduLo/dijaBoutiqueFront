import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { PlanService } from '../../../core/services/plan.service';
import { Plan, UserLimitError } from '../../../core/models/plan.model';

@Component({
  selector: 'app-upgrade-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upgrade-modal.component.html',
  styleUrls: ['./upgrade-modal.component.scss']
})
export class UpgradeModalComponent implements OnInit, OnDestroy {
  isVisible = false;
  userLimitError: UserLimitError | null = null;
  nextPlan: Plan | null = null;
  currentPlan: Plan | undefined;

  private subscription?: Subscription;

  constructor(private planService: PlanService) {}

  ngOnInit(): void {
    this.subscription = this.planService.userLimitError$.subscribe(error => {
      if (error) {
        this.userLimitError = error;
        this.currentPlan = this.planService.getPlanByName(error.planName);
        this.nextPlan = this.planService.getNextPlan(error.planName);
        this.isVisible = true;
      } else {
        this.isVisible = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  close(): void {
    this.isVisible = false;
    this.planService.clearUserLimitError();
  }

  onUpgrade(): void {
    // TODO: Implémenter la redirection vers la page de paiement
    console.log('Redirection vers la page de paiement pour le plan:', this.nextPlan?.name);
    this.close();
  }

  onViewPlans(): void {
    // TODO: Implémenter la navigation vers la page des plans
    console.log('Navigation vers la page des plans');
    this.close();
  }
}
