import { ClientStop, LatLng, Vehicle } from '../../../shared/types/route-types';

export const DISTRIBUTION_CENTER: LatLng = {
  lat: 4.6725,
  lng: -74.0836, // Bogotá aprox (Zona occidente)
};

// Clientes de ejemplo (cerca a Av 68 para coincidir con el mockup)
export const MOCK_CLIENTS: ClientStop[] = [
  { id: 'ORD-001', name: 'Éxito Calle 80', address: 'Cl. 80 #69', lat: 4.6818, lng: -74.0792, demand: 3 },
  { id: 'ORD-002', name: 'Alkosto Av. 68', address: 'Av 68 #68', lat: 4.6764, lng: -74.0785, demand: 2 },
  { id: 'ORD-003', name: 'Sport Olímpica', address: 'Av 68 #66', lat: 4.6678, lng: -74.0889, demand: 4 },
  { id: 'ORD-004', name: 'Tienda Los Andes', address: 'Cra 70 #64', lat: 4.6711, lng: -74.0745, demand: 1 },
  { id: 'ORD-005', name: 'D1 Boyacá Real', address: 'Cl 73 #72', lat: 4.6901, lng: -74.0897, demand: 2 },
  { id: 'ORD-006', name: 'Surtimax Av 68', address: 'Av 68 #72', lat: 4.6872, lng: -74.0735, demand: 1 },
  { id: 'ORD-007', name: 'Farmacia Central', address: 'Cl 68 #70', lat: 4.674, lng: -74.0998, demand: 3 },
  { id: 'ORD-008', name: 'La Bodega 24', address: 'Cl 64 #72', lat: 4.6662, lng: -74.0805, demand: 2 },
  { id: 'ORD-009', name: 'Droguería Mi Salud', address: 'Cl 72 #68', lat: 4.686, lng: -74.0849, demand: 1 },
  { id: 'ORD-010', name: 'Ultramarinos 7', address: 'Cra 68 #63', lat: 4.6686, lng: -74.0934, demand: 1 },
];

// Tres vehículos disponibles con capacidades homogéneas (mock)
export const VEHICLES_POOL: Vehicle[] = [
  { id: 'V-01', capacity: 8, color: '#3f51b5', label: 'Vehículo 1' },
  { id: 'V-02', capacity: 8, color: '#e91e63', label: 'Vehículo 2' },
  { id: 'V-03', capacity: 8, color: '#009688', label: 'Vehículo 3' },
];
