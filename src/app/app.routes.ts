import { Routes } from '@angular/router';
import { Component } from '@angular/core';
import { Dashboard } from './pages/dashboard/dashboard';
import { RegionalSettings } from './pages/regional-settings/regional-settings';
import { Components } from './pages/components/components';

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
  { path: 'settings/region', component: RegionalSettings },
  { path: 'productos/cargar', component: EmptyComponent },
  { path: 'rutas/generar', component: EmptyComponent },
  { path: 'ventas/crear-plan', component: EmptyComponent },
  { path: 'usuarios/registro', component: EmptyComponent },
  { path: 'reportes', component: EmptyComponent },
  // El path de componentes muestra la guía de componentes para la web
  { path: 'componentes', component: Components },
];
