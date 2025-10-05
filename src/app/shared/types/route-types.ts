export interface LatLng {
  lat: number;
  lng: number;
}

export interface ClientStop {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  demand: number;
}

export interface Vehicle {
  id: string;
  capacity: number;
  color: string;
  label?: string;
}

export interface VehicleRoute {
  vehicle: Vehicle;
  stops: ClientStop[];
  path: LatLng[];
}


