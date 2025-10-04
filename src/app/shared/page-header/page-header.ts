import { Component, inject, Input } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '../pipes/translate.pipe';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    RouterLink,
    TranslatePipe,
  ],
  templateUrl: './page-header.html',
  styleUrls: ['./page-header.css'],
})
export class PageHeader {
  @Input() pageTitle = '';
  @Input() userName = 'John Doe';
  @Input() userRole = 'Administrador';
  menuVisible = false;
  @Input() backRoute: string | null = null;
  private readonly router = inject(Router);

  toggleMenu(): void {
    this.menuVisible = !this.menuVisible;
  }

  logout(): void {
    // lógica de cierre de sesión
  }

  goBack() {
    if (this.backRoute) {
      this.router.navigate([this.backRoute]);
    }
  }
}
