import { Component } from '@angular/core';
import { PageHeader } from '../../shared/page-header/page-header';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-dashboard',
  imports: [PageHeader, MatButtonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  pageTitle = $localize`:Título de la página Dashboard@@page.dashboard.title:Dashboard`;
}
