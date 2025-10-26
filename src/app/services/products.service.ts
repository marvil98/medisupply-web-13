import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Product {
  product_id: number;
  sku: string;
  name: string;
  value: number;
  category_name: string;
  total_quantity: number;
  image_url?: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  success: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private readonly api = environment.baseUrl;

  constructor(private http: HttpClient) {
    console.log('🏗️ ProductsService: Servicio instanciado');
    console.log('🌐 ProductsService: URL base configurada:', this.api);
  }

  /**
   * Obtiene todos los productos disponibles
   */
  getAvailableProducts(): Observable<ProductsResponse> {
    const url = `${this.api}products/available`;
    
    console.log('🔍 ProductsService: ===== INICIANDO PETICIÓN AL BACKEND =====');
    console.log('🌐 ProductsService: URL completa:', url);
    console.log('🌐 ProductsService: API base:', this.api);
    console.log('📊 ProductsService: Método HTTP: GET');
    console.log('⏱️ ProductsService: Timestamp:', new Date().toISOString());
    
    return this.http.get<any>(url).pipe(
      tap(data => {
        console.log('📡 ProductsService: ===== RESPUESTA RECIBIDA =====');
        console.log('📡 ProductsService: Respuesta completa:', data);
        console.log('📊 ProductsService: Tipo de respuesta:', typeof data);
        console.log('📋 ProductsService: Es array?', Array.isArray(data));
        
        // El backend devuelve un array directo, no un objeto con products
        if (Array.isArray(data)) {
          console.log('📦 ProductsService: Backend devuelve array directo con', data.length, 'productos');
          console.log('📦 ProductsService: Primeros 3 productos:', data.slice(0, 3));
        } else {
          console.log('📦 ProductsService: Backend devuelve objeto:', Object.keys(data || {}));
        }
      }),
      // Transformar la respuesta del backend al formato esperado por el frontend
      map(data => {
        if (Array.isArray(data)) {
          // El backend devuelve un array directo
          return {
            products: data,
            total: data.length,
            success: true,
            message: 'Productos cargados exitosamente'
          };
        } else {
          // Si el backend devuelve un objeto (formato esperado)
          return {
            products: data.products || [],
            total: data.total || 0,
            success: data.success || true,
            message: data.message || 'Productos cargados exitosamente'
          };
        }
      }),
      catchError(error => {
        console.error('❌ ProductsService: ===== ERROR EN PETICIÓN =====');
        console.error('❌ ProductsService: Error completo:', error);
        console.error('❌ ProductsService: Error message:', error.message);
        console.error('❌ ProductsService: Error status:', error.status);
        console.error('❌ ProductsService: Error statusText:', error.statusText);
        console.error('❌ ProductsService: Error url:', error.url);
        console.error('❌ ProductsService: Error stack:', error.stack);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene un producto por ID
   */
  getProductById(id: string): Observable<Product> {
    const url = `${this.api}products/${id}`;
    
    console.log('🔍 ProductsService: Solicitando producto por ID:', id, 'desde:', url);
    
    return this.http.get<Product>(url).pipe(
      tap(data => console.log('📡 ProductsService: Producto recibido:', data)),
      catchError(error => {
        console.error('❌ ProductsService: Error al obtener producto:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Crea un nuevo producto
   */
  createProduct(product: Omit<Product, 'id' | 'fecha_creacion'>): Observable<Product> {
    const url = `${this.api}products`;
    
    console.log('🔍 ProductsService: Creando producto:', product);
    console.log('🌐 ProductsService: URL:', url);
    
    return this.http.post<Product>(url, product).pipe(
      tap(data => console.log('📡 ProductsService: Producto creado:', data)),
      catchError(error => {
        console.error('❌ ProductsService: Error al crear producto:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Actualiza un producto existente
   */
  updateProduct(id: string, product: Partial<Product>): Observable<Product> {
    const url = `${this.api}products/${id}`;
    
    console.log('🔍 ProductsService: Actualizando producto ID:', id, 'con datos:', product);
    console.log('🌐 ProductsService: URL:', url);
    
    return this.http.put<Product>(url, product).pipe(
      tap(data => console.log('📡 ProductsService: Producto actualizado:', data)),
      catchError(error => {
        console.error('❌ ProductsService: Error al actualizar producto:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Elimina un producto
   */
  deleteProduct(id: string): Observable<{ success: boolean; message: string }> {
    const url = `${this.api}products/${id}`;
    
    console.log('🔍 ProductsService: Eliminando producto ID:', id);
    console.log('🌐 ProductsService: URL:', url);
    
    return this.http.delete<{ success: boolean; message: string }>(url).pipe(
      tap(data => console.log('📡 ProductsService: Producto eliminado:', data)),
      catchError(error => {
        console.error('❌ ProductsService: Error al eliminar producto:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Cambia el estado de un producto (activar/desactivar)
   */
  toggleProductStatus(id: string, status: 'activo' | 'inactivo'): Observable<Product> {
    const url = `${this.api}products/${id}/status`;
    
    console.log('🔍 ProductsService: Cambiando estado del producto ID:', id, 'a:', status);
    console.log('🌐 ProductsService: URL:', url);
    
    return this.http.patch<Product>(url, { estado: status }).pipe(
      tap(data => console.log('📡 ProductsService: Estado del producto actualizado:', data)),
      catchError(error => {
        console.error('❌ ProductsService: Error al cambiar estado del producto:', error);
        return throwError(() => error);
      })
    );
  }
}
