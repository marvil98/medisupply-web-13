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
import { RoutesDataService } from '../../../services/routes-data.service';
import { environment } from '../../../../environments/environment';
import { DISTRIBUTION_CENTER } from './mock-data';

console.log('📁 RoutesGenerate: Módulo cargado');

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
  clients = [] as any[];
  availableVehicles = [] as any[]; // mock via service
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

  constructor(private optimizer: RouteOptimizerService, private data: RoutesDataService) {
    console.log('🏗️ RoutesGenerate: Constructor ejecutado');
    console.log('🏗️ RoutesGenerate: Servicios inyectados:', { optimizer: !!this.optimizer, data: !!this.data });
  }

  ngOnInit() {
    console.log('🚀 RoutesGenerate: ngOnInit EJECUTÁNDOSE');
    console.log('🚀 RoutesGenerate: Inicializando componente');
    console.log('🌐 RoutesGenerate: URL del backend:', environment.baseUrl);
    console.log('🔧 RoutesGenerate: Servicio data disponible:', !!this.data);
    this.tryGeolocation();
    
    // Cargar datos SOLO desde el backend real
    console.log('📡 RoutesGenerate: Cargando datos desde backend real...');
    
    // Cargar clientes desde backend
    console.log('📡 RoutesGenerate: Cargando clientes desde backend...');
    this.data.getClients().subscribe({
      next: (c: any) => {
        console.log('✅ RoutesGenerate: Clientes cargados desde backend:', c);
        console.log('📊 RoutesGenerate: Cantidad de clientes del backend:', c?.length || 0);
        
        if (c && c.length > 0) {
          // Mapear los datos del backend al formato esperado
          this.clients = c.map((client: any) => ({
            id: client.id,
            name: client.nombre,
            address: client.direccion,
            lat: client.latitud,
            lng: client.longitud,
            demand: client.demanda
          }));
          console.log('🔄 RoutesGenerate: Clientes mapeados del backend:', this.clients);
        } else {
          console.log('⚠️ RoutesGenerate: Backend devolvió datos vacíos');
          this.setMessage('error', 'noDataAvailable');
        }
      },
      error: (error) => {
        console.error('❌ RoutesGenerate: Error cargando clientes desde backend:', error);
        console.error('❌ RoutesGenerate: Detalles del error:', error.status, error.statusText, error.url);
        this.setMessage('error', 'backendConnectionError');
      }
    });
    
    // Cargar vehículos desde backend
    console.log('🚗 RoutesGenerate: Cargando vehículos desde backend...');
    this.data.getVehicles().subscribe({
      next: (v: any) => {
        console.log('✅ RoutesGenerate: Vehículos cargados desde backend:', v);
        console.log('📊 RoutesGenerate: Cantidad de vehículos del backend:', v?.length || 0);
        
        if (v && v.length > 0) {
          // Mapear los datos del backend al formato esperado
          this.availableVehicles = v.map((vehicle: any) => ({
            id: vehicle.id,
            capacity: vehicle.capacidad,
            color: vehicle.color,
            label: vehicle.etiqueta
          }));
          console.log('🔄 RoutesGenerate: Vehículos mapeados del backend:', this.availableVehicles);
        } else {
          console.log('⚠️ RoutesGenerate: Backend devolvió datos vacíos');
          this.setMessage('error', 'noDataAvailable');
        }
      },
      error: (error) => {
        console.error('❌ RoutesGenerate: Error cargando vehículos desde backend:', error);
        console.error('❌ RoutesGenerate: Detalles del error:', error.status, error.statusText, error.url);
        this.setMessage('error', 'backendConnectionError');
      }
    });
  }


  private tryGeolocation() {
    if (!('geolocation' in navigator)) {
      this.userLocationAllowed.set(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => {
        this.userLocationAllowed.set(true);
      },
      () => {
        this.userLocationAllowed.set(false);
        // No mostrar error - las rutas se generan desde el centro de distribución
      },
      { enableHighAccuracy: true, timeout: 3000 }
    );
  }

  private setMessage(type: 'success' | 'error', key: string) {
    this.message = { type, key };
    const duration = type === 'success' ? 3000 : 5000;
    window.setTimeout(() => {
      // Evitar borrar si cambió a otro mensaje
      if (this.message && this.message.key === key && this.message.type === type) {
        this.message = null;
      }
    }, duration);
  }

  get isGenerateDisabled() {
    // Deshabilitar hasta que el usuario seleccione 1–3 vehículos
    return !this.selectedVehicles() || this.generating();
  }

  generate() {
    console.log('🚀 RoutesGenerate: Iniciando generación de rutas');
    console.log('📊 RoutesGenerate: Datos actuales:');
    console.log('  - Clientes:', this.clients.length, this.clients);
    console.log('  - Vehículos disponibles:', this.availableVehicles.length, this.availableVehicles);
    console.log('  - Vehículos seleccionados:', this.selectedVehicles());
    
    if (this.isGenerateDisabled) {
      console.log('❌ RoutesGenerate: Generación deshabilitada');
      return;
    }
    
    this.generating.set(true);
    this.message = null;

    const start = performance.now();
    try {
      // Validaciones de disponibilidad
      const req = Number(this.selectedVehicles());
      console.log('🔢 RoutesGenerate: Vehículos solicitados:', req);
      
      if (req > this.availableVehicles.length) {
        console.log('❌ RoutesGenerate: No hay suficientes vehículos disponibles');
        this.setMessage('error', 'notEnoughForSelected');
        this.generating.set(false);
        this.routes.set(null);
        return;
      }

      const totalDemand = this.clients.reduce((a, c) => a + c.demand, 0);
      const perVehicleCap = this.availableVehicles[0].capacity;
      const minByDemand = Math.ceil(totalDemand / perVehicleCap);
      
      console.log('📊 RoutesGenerate: Análisis de capacidad:');
      console.log('  - Demanda total:', totalDemand);
      console.log('  - Capacidad por vehículo:', perVehicleCap);
      console.log('  - Mínimo vehículos necesarios:', minByDemand);
      
      if (minByDemand > this.availableVehicles.length) {
        console.log('❌ RoutesGenerate: No hay suficientes vehículos para toda la demanda');
        this.setMessage('error', 'notEnoughForAll');
        this.generating.set(false);
        this.routes.set(null);
        return;
      }

      console.log('🔧 RoutesGenerate: Ejecutando optimización...');
      const result = this.optimizer.optimize({
        center: this.center,
        clients: this.clients,
        availableVehicles: this.availableVehicles,
        requestedVehicles: req,
      });

      console.log('✅ RoutesGenerate: Optimización completada:', result);

      // Si hay no asignados por capacidad, continúa y muestra rutas igualmente (sin error).

      const duration = performance.now() - start;
      console.log('⏱️ RoutesGenerate: Tiempo de optimización:', duration, 'ms');
      
      // Forzar el cumplimiento <= 5s (nuestro cálculo es inmediato, sólo verificamos)
      if (duration > 5000) {
        console.log('⏰ RoutesGenerate: Optimización tardó demasiado tiempo');
        this.setMessage('error', 'genericGenerationError');
        this.generating.set(false);
        this.routes.set(null);
        return;
      }

      console.log('🎯 RoutesGenerate: Estableciendo rutas generadas:', result.usedRoutes);
      this.routes.set(result.usedRoutes);
      if (!this.message) {
        this.setMessage('success', 'routesSuccess');
      }
    } catch (e) {
      console.error(e);
      this.setMessage('error', 'genericGenerationError');
      this.routes.set(null);
    } finally {
      this.generating.set(false);
    }
  }

  trackStopById(_: number, s: ClientStop) { return s.id; }
}
