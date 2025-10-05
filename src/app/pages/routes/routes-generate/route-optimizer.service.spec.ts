import { TestBed } from '@angular/core/testing';
import { RouteOptimizerService } from './route-optimizer.service';
import { ClientStop, LatLng, Vehicle } from '../../../shared/types/route-types';

describe('RouteOptimizerService', () => {
  let service: RouteOptimizerService;

  const center: LatLng = { lat: 4.6725, lng: -74.0836 };

  const clientsLight: ClientStop[] = [
    { id: 'C1', name: 'C1', address: 'D1', lat: 4.68, lng: -74.08, demand: 1 },
    { id: 'C2', name: 'C2', address: 'D2', lat: 4.679, lng: -74.081, demand: 1 },
    { id: 'C3', name: 'C3', address: 'D3', lat: 4.678, lng: -74.082, demand: 1 },
    { id: 'C4', name: 'C4', address: 'D4', lat: 4.677, lng: -74.083, demand: 1 },
  ];

  const clientsHeavy: ClientStop[] = [
    { id: 'C1', name: 'C1', address: 'D1', lat: 4.68, lng: -74.08, demand: 4 },
    { id: 'C2', name: 'C2', address: 'D2', lat: 4.679, lng: -74.081, demand: 4 },
    { id: 'C3', name: 'C3', address: 'D3', lat: 4.678, lng: -74.082, demand: 4 },
  ];

  const vehicles: Vehicle[] = [
    { id: 'V-01', capacity: 8, color: '#3f51b5', label: 'Vehículo 1' },
    { id: 'V-02', capacity: 8, color: '#e91e63', label: 'Vehículo 2' },
    { id: 'V-03', capacity: 8, color: '#009688', label: 'Vehículo 3' },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [RouteOptimizerService] });
    service = TestBed.inject(RouteOptimizerService);
  });

  it('usa solo los vehículos necesarios aunque el usuario seleccione más', () => {
    const result = service.optimize({
      center,
      clients: clientsLight, // demanda total = 4
      availableVehicles: vehicles,
      requestedVehicles: 3,  // usuario pide 3
    });

    // Capacidad por vehículo = 8, por lo tanto sólo 1 vehículo basta
    expect(result.usedVehicles.length).toBe(1);
    expect(result.usedRoutes.length).toBe(1);
    expect(result.usedRoutes[0].stops.length).toBeGreaterThan(0);
  });

  it('marca no asignados cuando la capacidad total no alcanza', () => {
    const result = service.optimize({
      center,
      clients: clientsHeavy, // demanda total = 12
      availableVehicles: [vehicles[0]], // capacidad total = 8 < 12
      requestedVehicles: 1,
    });

    expect(result.usedVehicles.length).toBe(1);
    expect(result.unassigned && result.unassigned.length).toBeGreaterThan(0);
  });

  it('cada ruta inicia y termina en el centro', () => {
    const result = service.optimize({
      center,
      clients: clientsLight,
      availableVehicles: vehicles,
      requestedVehicles: 2,
    });

    for (const r of result.usedRoutes) {
      expect(r.path[0]).toEqual(center);
      expect(r.path[r.path.length - 1]).toEqual(center);
    }
  });

  it('lanza error si requestedVehicles es inválido (<1 o >3)', () => {
    expect(() =>
      service.optimize({
        center,
        clients: clientsLight,
        availableVehicles: vehicles,
        requestedVehicles: 0,
      }),
    ).toThrowError('invalid-requested-vehicles');

    expect(() =>
      service.optimize({
        center,
        clients: clientsLight,
        availableVehicles: vehicles,
        requestedVehicles: 4,
      }),
    ).toThrowError('invalid-requested-vehicles');
  });

  it('lanza error si no hay vehículos disponibles', () => {
    expect(() =>
      service.optimize({
        center,
        clients: clientsLight,
        availableVehicles: [],
        requestedVehicles: 1,
      }),
    ).toThrowError('no-vehicles');
  });
});


