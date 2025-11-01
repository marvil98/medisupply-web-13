import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface City {
  city_id: number;
  name: string;
  country: string;
  country_name: string;
}

export interface Warehouse {
  warehouse_id: number;
  name: string;
  description: string;
  city_name?: string;
  country?: string;
}

export interface ProductLocation {
  section: string;
  aisle: string;
  shelf: string;
  level: string;
  lot: string;
  expires: string;
  available: number;
  reserved: number;
}

export interface Product {
  product_id: number;
  name: string;
  sku: string;
  image_url?: string | null;
  total_quantity?: number;
  quantity?: number;
  totalAvailable?: number;
  hasAvailability?: boolean;
  warehouse?: number;
  city?: number;
  locations?: ProductLocation[];
  category_name?: string;
  value?: number;
  city_name?: string;
  country?: string;
  lote?: string;
  status?: string;
  warehouse_name?: string;
}

export interface LocationResponse {
  cities: City[];
  products: Product[];
  warehouses: Warehouse[];
  summary: {
    countries: string[];
    total_cities: number;
    total_products: number;
    total_warehouses: number;
  };
}

export interface CitiesResponse {
  cities: City[];
  success: boolean;
}

export interface WarehousesResponse {
  city_id?: number;
  success: boolean;
  warehouses: Warehouse[];
}

export interface WarehouseProductsResponse {
  products: Product[];
  success: boolean;
  warehouse_id: number;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private baseUrl = environment.baseUrl || 'http://localhost:8081';

  constructor(private http: HttpClient) { }

  // Obtener todas las ciudades
  getCities(): Observable<CitiesResponse> {
    return this.http.get<CitiesResponse>(`${this.baseUrl}products/location/cities`);
  }

  // Obtener bodegas por ciudad
  getWarehouses(cityId?: number): Observable<WarehousesResponse> {
    const url = cityId 
      ? `${this.baseUrl}warehouses/by-city/${cityId}`
      : `${this.baseUrl}warehouses`;
    return this.http.get<WarehousesResponse>(url);
  }

  // Obtener todos los productos con ubicaciones
  getProductsLocation(): Observable<LocationResponse> {
    return this.http.get<LocationResponse>(`${this.baseUrl}products/location`);
  }

  // Obtener productos por bodega
  // includeZero: si es true, incluye productos con stock = 0
  // includeLocations: si es true, incluye datos de ubicación física (sección, pasillo, mueble, nivel, lotes)
  getProductsByWarehouse(warehouseId: number, includeZero: boolean = false, includeLocations: boolean = true): Observable<WarehouseProductsResponse> {
    const params = new URLSearchParams();
    if (includeZero) {
      params.append('include_zero', 'true');
    }
    if (includeLocations) {
      params.append('include_locations', 'true');
    }
    const queryString = params.toString();
    const url = queryString 
      ? `${this.baseUrl}products/by-warehouse/${warehouseId}?${queryString}`
      : `${this.baseUrl}products/by-warehouse/${warehouseId}`;
    return this.http.get<WarehouseProductsResponse>(url);
  }
}
