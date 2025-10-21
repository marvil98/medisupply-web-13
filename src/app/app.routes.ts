import { Routes } from '@angular/router';
import { Component } from '@angular/core';
import { Dashboard } from './pages/dashboard/dashboard';
import { RegionalSettings } from './pages/regional-settings/regional-settings';
import { Components } from './pages/components/components';
import { Reports } from './pages/reports/reports';
import { SalesReport } from './pages/reports/sales-report';
import { RoutesGenerate } from './pages/routes/routes-generate/routes-generate';
import { ProductList } from './pages/products/product-list/product-list';

@Component({
  standalone: true,
  template: `<h2>Página en construcción</h2>`,
})
class EmptyComponent {}

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },
  { path: 'productos', component: ProductList },
  { path: 'usuarios', component: EmptyComponent },
  { path: 'reportes', component: Reports },
  { path: 'reportes/generar-venta', component: SalesReport },
  { path: 'ventas', component: EmptyComponent },
  { path: 'rutas', redirectTo: 'rutas/generar', pathMatch: 'full' },
  { path: 'settings/region', component: RegionalSettings },
  { path: 'rutas/generar', component: RoutesGenerate },
  { path: 'ventas/crear-plan', component: EmptyComponent },
  { path: 'usuarios/registro', component: EmptyComponent },
  { path: 'reportes', component: EmptyComponent },
  { path: 'componentes', component: Components },
];
