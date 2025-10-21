import { Component } from '@angular/core';
import { PageHeader } from '../../shared/page-header/page-header';
import { MatButtonModule } from '@angular/material/button';
import { ActionCard } from '../../shared/action-card/action-card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, PageHeader, MatButtonModule, ActionCard],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class Dashboard {
  pageTitle = 'pageDashboardTitle';

  cards = [
    {
      titleKey: 'cardProductsTitle',
      subtitleKey: 'cardProductsSubtitle',
      icon: 'upload',
      ariaLabelKey: 'cardProductsAria',
      path: '/productos',
    },
    {
      titleKey: 'cardRoutesTitle',
      subtitleKey: 'cardRoutesSubtitle',
      icon: 'map',
      ariaLabelKey: 'cardRoutesAria',
      path: '/rutas/generar',
    },
    {
      titleKey: 'cardSalesTitle',
      subtitleKey: 'cardSalesSubtitle',
      icon: 'list',
      ariaLabelKey: 'cardSalesAria',
      path: '/ventas/crear-plan',
    },
    {
      titleKey: 'cardUsersTitle',
      subtitleKey: 'cardUsersSubtitle',
      icon: 'users',
      ariaLabelKey: 'cardUsersAria',
      path: '/usuarios/registro',
    },
    {
      titleKey: 'cardReportsTitle',
      subtitleKey: 'cardReportsSubtitle',
      icon: 'reports',
      ariaLabelKey: 'cardReportsAria',
      path: '/reportes',
    },
  ];
}
