import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { IconService } from './icon.service';
import { inject } from '@angular/core';
import { filter } from 'rxjs';
import { TranslatePipe } from './shared/pipes/translate.pipe';
interface MenuItem {
  path: string;
  icon: string;
  labelKey: string;
  ariaKey: string;
  exact: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatListModule,
    MatIconModule,
    TranslatePipe,
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {
  protected readonly title = signal('medisupply');
  private readonly iconService = inject(IconService);
  private readonly router = inject(Router);

  currentUrl = signal(this.router.url);

  menuItems = signal<MenuItem[]>([
    {
      path: '/dashboard',
      icon: 'home',
      labelKey: 'menu_dashboard_label',
      ariaKey: 'menu_dashboard_aria',
      exact: true,
    },
    {
      path: '/productos',
      icon: 'box',
      labelKey: 'menu_productos_label',
      ariaKey: 'menu_productos_aria',
      exact: false,
    },
    {
      path: '/usuarios',
      icon: 'users',
      labelKey: 'menu_usuarios_label',
      ariaKey: 'menu_usuarios_aria',
      exact: false,
    },
    {
      path: '/reportes',
      icon: 'bar-chart',
      labelKey: 'menu_reportes_label',
      ariaKey: 'menu_reportes_aria',
      exact: false,
    },
    {
      path: '/ventas',
      icon: 'dollar',
      labelKey: 'menu_ventas_label',
      ariaKey: 'menu_ventas_aria',
      exact: false,
    },
    {
      path: '/rutas',
      icon: 'map',
      labelKey: 'menu_rutas_label',
      ariaKey: 'menu_rutas_aria',
      exact: false,
    },
  ]);

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.currentUrl.set(e.urlAfterRedirects);
      });
  }

  isActive(route: string): boolean {
    const url = this.currentUrl();
    return route === '/dashboard'
      ? url === '/' || url.startsWith('/dashboard')
      : url.startsWith(route);
  }
}
