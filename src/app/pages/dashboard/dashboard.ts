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
  pageTitle = $localize`:@@page.dashboard.title:Dashboard`;

  cards = [
    {
      titleKey: $localize`:@@card.products.title:Carga de productos`,
      subtitleKey: $localize`:@@card.products.subtitle:Subir plantilla`,
      icon: 'upload',
      ariaLabelKey: $localize`:@@card.products.aria:Card de carga de productos`,
      path: '/productos/cargar', 
    },
    {
      titleKey: $localize`:@@card.routes.title:Generar rutas`,
      subtitleKey: $localize`:@@card.routes.subtitle:Generar ahora`,
      icon: 'map',
      ariaLabelKey: $localize`:@@card.routes.aria:Card de rutas`,
      path: '/rutas/generar', 
    },
    {
      titleKey: $localize`:@@card.sales.title:Crear plan de venta`,
      subtitleKey: $localize`:@@card.sales.subtitle:Crear ahora`,
      icon: 'list',
      ariaLabelKey: $localize`:@@card.sales.aria:Card de ventas`,
      path: '/ventas/crear-plan', 
    },
    {
      titleKey: $localize`:@@card.users.title:Registro de usuarios`,
      subtitleKey: $localize`:@@card.users.subtitle:Importar CSV`,
      icon: 'users',
      ariaLabelKey: $localize`:@@card.users.aria:Card de usuarios`,
      path: '/usuarios/registro'
    },
    {
      titleKey: $localize`:@@card.reports.title:Reportes`,
      subtitleKey: $localize`:@@card.reports.subtitle:Listar y generar métricas`,
      icon: 'reports',
      ariaLabelKey: $localize`:@@card.reports.aria:Card de reportes`,
      path: '/reportes'
    },
  ];
}
