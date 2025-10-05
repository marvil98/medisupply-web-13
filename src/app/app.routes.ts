import { Routes } from '@angular/router';
import { Component } from '@angular/core';
import { Dashboard } from './pages/dashboard/dashboard';
import { RegionalSettings } from './pages/regional-settings/regional-settings';
import { Components } from './pages/components/components';
import { RoutesGenerate } from './pages/routes/routes-generate/routes-generate';

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
  // Redireccionamos /rutas al generador de rutas de HU10
  { path: 'rutas', redirectTo: 'rutas/generar', pathMatch: 'full' },
  // Alias en inglés o enlaces antiguos: /routes -> /rutas/generar
  { path: 'routes', redirectTo: 'rutas/generar', pathMatch: 'full' },
  { path: 'settings/region', component: RegionalSettings },
  { path: 'productos/cargar', component: EmptyComponent },
  { path: 'rutas/generar', component: RoutesGenerate },
  { path: 'ventas/crear-plan', component: EmptyComponent },
  { path: 'usuarios/registro', component: EmptyComponent },
  { path: 'reportes', component: EmptyComponent },
  // Guía de componentes
  { path: 'componentes', component: Components },
];
