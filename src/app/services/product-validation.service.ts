import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ExistingProduct {
  product_id: number;
  sku: string;
  name: string;
  value: number;
  category_id: number;
  unit_id: number;
  status: string;
}

export interface SkuValidationResult {
  isValid: boolean;
  existingProduct?: ExistingProduct;
  errorMessage?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductValidationService {
  private readonly apiUrl = '/api/products'; // Ajusta según tu endpoint

  constructor(private http: HttpClient) {}

  /**
   * Valida si un SKU ya existe en la base de datos
   */
  validateSkuExists(sku: string): Observable<SkuValidationResult> {
    return this.http.get<SkuValidationResult>(`${this.apiUrl}/validate-sku/${sku}`);
  }

  /**
   * Valida múltiples SKUs contra la base de datos
   */
  validateMultipleSkus(skus: string[]): Observable<SkuValidationResult[]> {
    return this.http.post<SkuValidationResult[]>(`${this.apiUrl}/validate-skus`, { skus });
  }

  /**
   * Obtiene todos los productos existentes para validación local
   */
  getAllProducts(): Observable<ExistingProduct[]> {
    return this.http.get<ExistingProduct[]>(`${this.apiUrl}/all`);
  }

  /**
   * Valida SKUs localmente contra una lista de productos existentes
   */
  validateSkusLocally(skus: string[], existingProducts: ExistingProduct[]): SkuValidationResult[] {
    return skus.map(sku => {
      const existingProduct = existingProducts.find(p => 
        p.sku.toLowerCase().trim() === sku.toLowerCase().trim()
      );
      
      if (existingProduct) {
        return {
          isValid: false,
          existingProduct,
          errorMessage: `SKU '${sku}' ya existe en el sistema (Producto: ${existingProduct.name})`
        };
      }
      
      return {
        isValid: true
      };
    });
  }

  /**
   * Valida duplicados de SKU en el archivo cargado
   */
  validateSkuDuplicatesInFile(products: any[]): { sku: string, rowNumbers: number[] }[] {
    const skuMap = new Map<string, number[]>();
    
    products.forEach((product, index) => {
      const sku = product.sku?.toLowerCase().trim();
      if (sku) {
        if (!skuMap.has(sku)) {
          skuMap.set(sku, []);
        }
        skuMap.get(sku)!.push(index + 1); // +1 porque las filas empiezan en 1
      }
    });
    
    // Retornar solo los SKUs que tienen duplicados
    return Array.from(skuMap.entries())
      .filter(([_, rowNumbers]) => rowNumbers.length > 1)
      .map(([sku, rowNumbers]) => ({ sku, rowNumbers }));
  }

  /**
   * Valida duplicados de nombre en el archivo cargado
   */
  validateNameDuplicatesInFile(products: any[]): { nombre: string, rowNumbers: number[] }[] {
    const nameMap = new Map<string, number[]>();
    
    products.forEach((product, index) => {
      const nombre = product.nombre?.toLowerCase().trim();
      if (nombre) {
        if (!nameMap.has(nombre)) {
          nameMap.set(nombre, []);
        }
        nameMap.get(nombre)!.push(index + 1); // +1 porque las filas empiezan en 1
      }
    });
    
    // Retornar solo los nombres que tienen duplicados
    return Array.from(nameMap.entries())
      .filter(([_, rowNumbers]) => rowNumbers.length > 1)
      .map(([nombre, rowNumbers]) => ({ nombre, rowNumbers }));
  }
}
