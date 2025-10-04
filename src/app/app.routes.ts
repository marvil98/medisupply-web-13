import { Routes } from '@angular/router';
import { Component } from '@angular/core';
import { Dashboard } from './pages/dashboard/dashboard';

@Component({
  standalone: true,
  template: `<h2>Página en construcción</h2>`,
})
class EmptyComponent {}

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },
  { path: 'productos', component: EmptyComponent },
  { path: 'usuarios', component: EmptyComponent },
  { path: 'reportes', component: EmptyComponent },
  { path: 'ventas', component: EmptyComponent },
  { path: 'rutas', component: EmptyComponent },
  { path: 'settings/region', component: EmptyComponent },
];
