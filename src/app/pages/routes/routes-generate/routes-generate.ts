import { Component, computed, signal } from '@angular/core';
import { PageHeader } from '../../../shared/page-header/page-header';
import { CustomSelect } from '../../../shared/custom-select/custom-select';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { StatusMessage } from '../../../shared/status-message/status-message';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { ClientStop, VehicleRoute } from '../../../shared/types/route-types';
import { RouteMap } from './route-map';
import { RouteOptimizerService } from './route-optimizer.service';
import { DISTRIBUTION_CENTER, MOCK_CLIENTS, VEHICLES_POOL } from './mock-data';

@Component({
  selector: 'app-routes-generate',
  standalone: true,
  imports: [CommonModule, PageHeader, CustomSelect, MatButtonModule, StatusMessage, TranslatePipe, RouteMap],
  templateUrl: './routes-generate.html',
  styleUrls: ['./routes-generate.css'],
})
export class RoutesGenerate {
  pageTitle = 'pageRoutesTitle';
  center = DISTRIBUTION_CENTER;
  clients = MOCK_CLIENTS;
  availableVehicles = VEHICLES_POOL; // mock
  userLocationAllowed = signal(true);

  vehicleOptions = [
    { value: '1', labelKey: 'vehiclesOption1' },
    { value: '2', labelKey: 'vehiclesOption2' },
    { value: '3', labelKey: 'vehiclesOption3' },
  ];
  selectedVehicles = signal<string>('');

  generating = signal(false);
  message: { type: 'success' | 'error'; key: string } | null = null;

  routes = signal<VehicleRoute[] | null>(null);
  usedVehiclesCount = computed(() => this.routes()?.length ?? 0);

  constructor(private optimizer: RouteOptimizerService) {}

  ngOnInit() {
    this.tryGeolocation();
    // Selección por defecto: 1 vehículo para evitar estado vacío
    if (!this.selectedVehicles()) {
      this.selectedVehicles.set('1');
    }
  }

  private tryGeolocation() {
    if (!('geolocation' in navigator)) {
      this.userLocationAllowed.set(false);
      this.message = { type: 'error', key: 'geoDeniedMessage' };
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => {
        this.userLocationAllowed.set(true);
      },
      () => {
        this.userLocationAllowed.set(false);
        this.message = { type: 'error', key: 'geoDeniedMessage' };
      },
      { enableHighAccuracy: true, timeout: 3000 }
    );
  }

  get isGenerateDisabled() {
    // Permitimos generar aunque no haya permiso de geolocalización; se usará el centro por defecto
    return !this.selectedVehicles() || this.generating();
  }

  generate() {
    if (this.isGenerateDisabled) return;
    this.generating.set(true);
    this.message = null;

    const start = performance.now();
    try {
      // Validaciones de disponibilidad
      const req = Number(this.selectedVehicles());
      if (req > this.availableVehicles.length) {
        this.message = { type: 'error', key: 'notEnoughForSelected' };
        this.generating.set(false);
        this.routes.set(null);
        return;
      }

      const totalDemand = this.clients.reduce((a, c) => a + c.demand, 0);
      const perVehicleCap = this.availableVehicles[0].capacity;
      const minByDemand = Math.ceil(totalDemand / perVehicleCap);
      if (minByDemand > this.availableVehicles.length) {
        this.message = { type: 'error', key: 'notEnoughForAll' };
        this.generating.set(false);
        this.routes.set(null);
        return;
      }

      const result = this.optimizer.optimize({
        center: this.center,
        clients: this.clients,
        availableVehicles: this.availableVehicles,
        requestedVehicles: req,
      });

      // Si hay no asignados por capacidad, continúa y muestra rutas igualmente (sin error).

      const duration = performance.now() - start;
      // Forzar el cumplimiento <= 5s (nuestro cálculo es inmediato, sólo verificamos)
      if (duration > 5000) {
        this.message = { type: 'error', key: 'genericGenerationError' };
        this.generating.set(false);
        this.routes.set(null);
        return;
      }

      this.routes.set(result.usedRoutes);
      if (!this.message) {
        this.message = { type: 'success', key: 'routesSuccess' };
      }
    } catch (e) {
      console.error(e);
      this.message = { type: 'error', key: 'genericGenerationError' };
      this.routes.set(null);
    } finally {
      this.generating.set(false);
    }
  }

  trackStopById(_: number, s: ClientStop) { return s.id; }
}
