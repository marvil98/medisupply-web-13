import { TestBed } from '@angular/core/testing';
import { RouteOptimizerService } from './route-optimizer.service';
import { ClientStop, Vehicle, LatLng } from '../../../shared/types/route-types';

describe('RouteOptimizerService', () => {
  let service: RouteOptimizerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RouteOptimizerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  const center: LatLng = { lat: 4.68, lng: -74.08 };
  const vehicles: Vehicle[] = [
    { id: 'V-01', capacity: 8, color: '#3f51b5', label: 'Vehículo 1' },
    { id: 'V-02', capacity: 8, color: '#4caf50', label: 'Vehículo 2' },
    { id: 'V-03', capacity: 8, color: '#ff9800', label: 'Vehículo 3' },
  ];

  const clientsLight: ClientStop[] = [
    { id: 'C1', name: 'C1', address: 'D1', lat: 4.68, lng: -74.08, demand: 1 },
    { id: 'C2', name: 'C2', address: 'D2', lat: 4.679, lng: -74.081, demand: 1 },
    { id: 'C3', name: 'C3', address: 'D3', lat: 4.678, lng: -74.082, demand: 1 },
  ];

  describe('optimize', () => {
    it('should optimize routes correctly', () => {
      const result = service.optimize({
        center,
        clients: clientsLight,
        availableVehicles: vehicles,
        requestedVehicles: 1,
      });

      expect(result.usedVehicles.length).toBe(1);
      expect(result.usedRoutes.length).toBe(1);
      expect(result.usedRoutes[0].stops.length).toBe(3);
    });

    it('should handle empty clients array', () => {
      const result = service.optimize({
        center,
        clients: [],
        availableVehicles: vehicles,
        requestedVehicles: 1,
      });

      expect(result.usedVehicles.length).toBe(1);
      expect(result.usedRoutes.length).toBe(1);
      expect(result.usedRoutes[0].stops.length).toBe(0);
    });

    it('should use multiple vehicles when demand requires it', () => {
      const heavyClients: ClientStop[] = [
        { id: 'C1', name: 'C1', address: 'D1', lat: 4.68, lng: -74.08, demand: 5 },
        { id: 'C2', name: 'C2', address: 'D2', lat: 4.679, lng: -74.081, demand: 5 },
        { id: 'C3', name: 'C3', address: 'D3', lat: 4.678, lng: -74.082, demand: 4 },
      ];

      const result = service.optimize({
        center,
        clients: heavyClients,
        availableVehicles: vehicles,
        requestedVehicles: 2,
      });

      expect(result.usedVehicles.length).toBe(2);
      expect(result.usedRoutes.length).toBe(2);
    });

    it('should respect maximum requested vehicles limit', () => {
      const manyClients: ClientStop[] = Array.from({ length: 20 }, (_, i) => ({
        id: `C${i + 1}`,
        name: `Cliente ${i + 1}`,
        address: `Dirección ${i + 1}`,
        lat: 4.68 + (i * 0.001),
        lng: -74.08 + (i * 0.001),
        demand: 1,
      }));

      const result = service.optimize({
        center,
        clients: manyClients,
        availableVehicles: vehicles,
        requestedVehicles: 2,
      });

      expect(result.usedVehicles.length).toBeLessThanOrEqual(2);
    });

    it('should handle single vehicle correctly', () => {
      const singleVehicle: Vehicle[] = [
        { id: 'V-01', capacity: 8, color: '#3f51b5', label: 'Vehículo 1' },
      ];

      const result = service.optimize({
        center,
        clients: clientsLight,
        availableVehicles: singleVehicle,
        requestedVehicles: 1,
      });

      expect(result.usedVehicles.length).toBe(1);
      expect(result.usedRoutes.length).toBe(1);
      expect(result.usedVehicles[0].id).toBe('V-01');
    });

    it('should throw error for invalid requested vehicles', () => {
      expect(() => {
        service.optimize({
          center,
          clients: clientsLight,
          availableVehicles: vehicles,
          requestedVehicles: 0,
        });
      }).toThrowError('invalid-requested-vehicles');

      expect(() => {
        service.optimize({
          center,
          clients: clientsLight,
          availableVehicles: vehicles,
          requestedVehicles: 4,
        });
      }).toThrowError('invalid-requested-vehicles');
    });

    it('should throw error when no vehicles available', () => {
      expect(() => {
        service.optimize({
          center,
          clients: clientsLight,
          availableVehicles: [],
          requestedVehicles: 1,
        });
      }).toThrowError('no-vehicles');
    });

    it('should handle capacity overflow correctly', () => {
      const highDemandClients: ClientStop[] = Array.from({ length: 10 }, (_, i) => ({
        id: `C${i + 1}`,
        name: `Cliente ${i + 1}`,
        address: `Dirección ${i + 1}`,
        lat: 4.68 + (i * 0.001),
        lng: -74.08 + (i * 0.001),
        demand: 10, // Demanda muy alta
      }));

      const result = service.optimize({
        center,
        clients: highDemandClients,
        availableVehicles: vehicles,
        requestedVehicles: 2,
      });

      // Debería marcar clientes como no asignados
      expect(result.unassigned).toBeDefined();
      expect(result.unassigned!.length).toBeGreaterThan(0);
    });

    it('should create proper route structure', () => {
      const result = service.optimize({
        center,
        clients: clientsLight,
        availableVehicles: vehicles,
        requestedVehicles: 1,
      });

      const route = result.usedRoutes[0];
      expect(route.vehicle).toBeDefined();
      expect(route.stops).toBeDefined();
      expect(route.path).toBeDefined();
      expect(route.path.length).toBe(5); // center + 3 stops + center
      expect(route.path[0]).toEqual(center); // starts from center
      expect(route.path[route.path.length - 1]).toEqual(center); // ends at center
    });
  });
});