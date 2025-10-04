import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-action-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './action-card.html',
  styleUrls: ['./action-card.css'],
})
export class ActionCard {
  @Input() titleKey!: string;
  @Input() subtitleKey!: string;
  @Input() icon!: string;
  @Input() ariaLabelKey!: string;
  @Input() routerPath!: string;
  private readonly router = inject(Router);

  navigateTo() {
    this.router.navigate([this.routerPath]);
  }
}
