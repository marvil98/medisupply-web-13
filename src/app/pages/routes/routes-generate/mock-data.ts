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

// Dataset grande para pruebas de rendimiento (50 clientes aprox)
export const MOCK_CLIENTS_LARGE: ClientStop[] = [
  // 11..20 (cerca al CD)
  { id: 'ORD-011', name: 'Cliente 11', address: 'Dir 11', lat: 4.6732, lng: -74.0811, demand: 2 },
  { id: 'ORD-012', name: 'Cliente 12', address: 'Dir 12', lat: 4.6754, lng: -74.0843, demand: 1 },
  { id: 'ORD-013', name: 'Cliente 13', address: 'Dir 13', lat: 4.6761, lng: -74.0789, demand: 3 },
  { id: 'ORD-014', name: 'Cliente 14', address: 'Dir 14', lat: 4.6778, lng: -74.0872, demand: 2 },
  { id: 'ORD-015', name: 'Cliente 15', address: 'Dir 15', lat: 4.6795, lng: -74.0824, demand: 1 },
  { id: 'ORD-016', name: 'Cliente 16', address: 'Dir 16', lat: 4.6802, lng: -74.0768, demand: 4 },
  { id: 'ORD-017', name: 'Cliente 17', address: 'Dir 17', lat: 4.6819, lng: -74.0854, demand: 2 },
  { id: 'ORD-018', name: 'Cliente 18', address: 'Dir 18', lat: 4.6831, lng: -74.0896, demand: 1 },
  { id: 'ORD-019', name: 'Cliente 19', address: 'Dir 19', lat: 4.6854, lng: -74.0817, demand: 2 },
  { id: 'ORD-020', name: 'Cliente 20', address: 'Dir 20', lat: 4.6876, lng: -74.0749, demand: 3 },
  // 21..30 (norte/occidente)
  { id: 'ORD-021', name: 'Cliente 21', address: 'Dir 21', lat: 4.6902, lng: -74.0821, demand: 2 },
  { id: 'ORD-022', name: 'Cliente 22', address: 'Dir 22', lat: 4.6924, lng: -74.0873, demand: 1 },
  { id: 'ORD-023', name: 'Cliente 23', address: 'Dir 23', lat: 4.6947, lng: -74.0795, demand: 2 },
  { id: 'ORD-024', name: 'Cliente 24', address: 'Dir 24', lat: 4.6969, lng: -74.0901, demand: 3 },
  { id: 'ORD-025', name: 'Cliente 25', address: 'Dir 25', lat: 4.6991, lng: -74.0847, demand: 2 },
  { id: 'ORD-026', name: 'Cliente 26', address: 'Dir 26', lat: 4.7013, lng: -74.0779, demand: 1 },
  { id: 'ORD-027', name: 'Cliente 27', address: 'Dir 27', lat: 4.7035, lng: -74.0918, demand: 2 },
  { id: 'ORD-028', name: 'Cliente 28', address: 'Dir 28', lat: 4.7057, lng: -74.0862, demand: 3 },
  { id: 'ORD-029', name: 'Cliente 29', address: 'Dir 29', lat: 4.7079, lng: -74.0796, demand: 1 },
  { id: 'ORD-030', name: 'Cliente 30', address: 'Dir 30', lat: 4.7101, lng: -74.0738, demand: 2 },
  // 31..40 (sur/occidente)
  { id: 'ORD-031', name: 'Cliente 31', address: 'Dir 31', lat: 4.6705, lng: -74.0962, demand: 2 },
  { id: 'ORD-032', name: 'Cliente 32', address: 'Dir 32', lat: 4.6684, lng: -74.0895, demand: 3 },
  { id: 'ORD-033', name: 'Cliente 33', address: 'Dir 33', lat: 4.6668, lng: -74.0837, demand: 1 },
  { id: 'ORD-034', name: 'Cliente 34', address: 'Dir 34', lat: 4.6652, lng: -74.0774, demand: 2 },
  { id: 'ORD-035', name: 'Cliente 35', address: 'Dir 35', lat: 4.6637, lng: -74.0911, demand: 4 },
  { id: 'ORD-036', name: 'Cliente 36', address: 'Dir 36', lat: 4.6621, lng: -74.0853, demand: 2 },
  { id: 'ORD-037', name: 'Cliente 37', address: 'Dir 37', lat: 4.6606, lng: -74.0792, demand: 1 },
  { id: 'ORD-038', name: 'Cliente 38', address: 'Dir 38', lat: 4.6591, lng: -74.0736, demand: 3 },
  { id: 'ORD-039', name: 'Cliente 39', address: 'Dir 39', lat: 4.6576, lng: -74.0875, demand: 2 },
  { id: 'ORD-040', name: 'Cliente 40', address: 'Dir 40', lat: 4.6560, lng: -74.0817, demand: 1 },
  // 41..50 (mixto)
  { id: 'ORD-041', name: 'Cliente 41', address: 'Dir 41', lat: 4.6890, lng: -74.0950, demand: 2 },
  { id: 'ORD-042', name: 'Cliente 42', address: 'Dir 42', lat: 4.6845, lng: -74.0705, demand: 3 },
  { id: 'ORD-043', name: 'Cliente 43', address: 'Dir 43', lat: 4.6768, lng: -74.0932, demand: 2 },
  { id: 'ORD-044', name: 'Cliente 44', address: 'Dir 44', lat: 4.6719, lng: -74.0667, demand: 1 },
  { id: 'ORD-045', name: 'Cliente 45', address: 'Dir 45', lat: 4.6952, lng: -74.0723, demand: 2 },
  { id: 'ORD-046', name: 'Cliente 46', address: 'Dir 46', lat: 4.7003, lng: -74.0937, demand: 4 },
  { id: 'ORD-047', name: 'Cliente 47', address: 'Dir 47', lat: 4.7061, lng: -74.0689, demand: 2 },
  { id: 'ORD-048', name: 'Cliente 48', address: 'Dir 48', lat: 4.6649, lng: -74.0707, demand: 1 },
  { id: 'ORD-049', name: 'Cliente 49', address: 'Dir 49', lat: 4.6727, lng: -74.0991, demand: 3 },
  { id: 'ORD-050', name: 'Cliente 50', address: 'Dir 50', lat: 4.6863, lng: -74.0983, demand: 2 },
];

// Pool extendido de vehículos para pruebas (5 vehículos)
export const VEHICLES_POOL_LARGE: Vehicle[] = [
  { id: 'V-01', capacity: 8, color: '#3f51b5', label: 'Vehículo 1' },
  { id: 'V-02', capacity: 8, color: '#e91e63', label: 'Vehículo 2' },
  { id: 'V-03', capacity: 8, color: '#009688', label: 'Vehículo 3' },
  { id: 'V-04', capacity: 8, color: '#ff9800', label: 'Vehículo 4' },
  { id: 'V-05', capacity: 8, color: '#9c27b0', label: 'Vehículo 5' },
];
