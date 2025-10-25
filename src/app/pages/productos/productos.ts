import { Component } from '@angular/core';
import { PageHeader } from '../../shared/page-header/page-header';
import { ActionCard } from '../../shared/action-card/action-card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, PageHeader, ActionCard],
  templateUrl: './productos.html',
  styleUrls: ['./productos.css'],
})
export class Productos {
  pageTitle = 'pageProductosTitle';

  cards = [
    {
      titleKey: 'cardProductsUploadTitle',
      subtitleKey: 'cardProductsUploadSubtitle',
      icon: 'upload',
      ariaLabelKey: 'cardProductsUploadAria',
      path: '/productos/cargar',
    },
    {
      titleKey: 'cardProductLocationTitle',
      subtitleKey: 'cardProductLocationSubtitle',
      icon: 'location_on',
      ariaLabelKey: 'cardProductLocationAria',
      path: '/productos/ubicacion',
    },
  ];
}