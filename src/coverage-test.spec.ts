import { TestBed } from '@angular/core/testing';
import { RouteOptimizerService } from './app/pages/routes/routes-generate/route-optimizer.service';
import { ClientStop, LatLng, Vehicle } from './app/shared/types/route-types';

describe('CI Coverage: Route optimization smoke test', () => {
  let service: RouteOptimizerService;

  const center: LatLng = { lat: 4.6725, lng: -74.0836 };
  const clients: ClientStop[] = [
    { id: 'C1', name: 'C1', address: 'D1', lat: 4.68, lng: -74.08, demand: 1 },
    { id: 'C2', name: 'C2', address: 'D2', lat: 4.679, lng: -74.081, demand: 1 },
    { id: 'C3', name: 'C3', address: 'D3', lat: 4.678, lng: -74.082, demand: 2 },
  ];
  const vehicles: Vehicle[] = [
    { id: 'V-01', capacity: 8, color: '#3f51b5', label: 'Vehículo 1' },
    { id: 'V-02', capacity: 8, color: '#e91e63', label: 'Vehículo 2' },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [RouteOptimizerService] });
    service = TestBed.inject(RouteOptimizerService);
  });

  it('genera rutas válidas y respeta inicio/fin en el centro', () => {
    const res = service.optimize({
      center,
      clients,
      availableVehicles: vehicles,
      requestedVehicles: 2,
    });
    expect(res.usedRoutes.length).toBeGreaterThan(0);
    for (const r of res.usedRoutes) {
      expect(r.path[0]).toEqual(center);
      expect(r.path[r.path.length - 1]).toEqual(center);
    }
  });
});


