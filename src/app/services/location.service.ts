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
  image_url: string | null;
  total_quantity: number;
  totalAvailable?: number;
  hasAvailability?: boolean;
  warehouse?: number;
  city?: number;
  locations?: ProductLocation[];
  category_name?: string;
  value?: number;
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
  total: number;
}

export interface WarehousesResponse {
  city_id: number | null;
  total: number;
  warehouses: Warehouse[];
}

export interface WarehouseProductsResponse {
  products: Product[];
  summary: {
    categories: string[];
    countries: string[];
    total_lotes: number;
  };
  total_products: number;
  total_quantity: number;
  warehouse_id: number;
  hasAvailability: boolean;
  totalAvailable: number;
  warehouse: number;
  locations: Array<{
    id: number;
    name: string;
    address: string;
    city: string;
    country: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private baseUrl = environment.baseUrl || 'http://localhost:8081';

  constructor(private http: HttpClient) { }

  // Obtener todas las ciudades
  getCities(): Observable<CitiesResponse> {
    return this.http.get<CitiesResponse>(`${this.baseUrl}/products/location/cities`);
  }

  // Obtener bodegas por ciudad
  getWarehouses(cityId?: number): Observable<WarehousesResponse> {
    const url = cityId 
      ? `${this.baseUrl}/products/location/warehouses?city_id=${cityId}`
      : `${this.baseUrl}/products/location/warehouses`;
    return this.http.get<WarehousesResponse>(url);
  }

  // Obtener todos los productos con ubicaciones
  getProductsLocation(): Observable<LocationResponse> {
    return this.http.get<LocationResponse>(`${this.baseUrl}/products/location`);
  }

  // Obtener productos por bodega
  getProductsByWarehouse(warehouseId: number): Observable<WarehouseProductsResponse> {
    return this.http.get<WarehouseProductsResponse>(`${this.baseUrl}/products/warehouse/${warehouseId}`);
  }
}
