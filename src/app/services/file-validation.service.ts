import { Injectable } from '@angular/core';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  data?: any[];
}

export interface ProductTemplate {
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  stock_minimo: number;
  unidad_medida: string;
}

@Injectable({
  providedIn: 'root'
})
export class FileValidationService {
  private readonly requiredFields = [
    'nombre',
    'descripcion', 
    'precio',
    'categoria',
    'stock_minimo',
    'unidad_medida'
  ];

  private readonly fieldTypes = {
    nombre: 'string',
    descripcion: 'string',
    precio: 'number',
    categoria: 'string',
    stock_minimo: 'number',
    unidad_medida: 'string'
  };

  async validateCSVFile(file: File): Promise<ValidationResult> {
    try {
      const text = await this.readFileAsText(file);
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        return {
          isValid: false,
          errors: ['El archivo debe contener al menos una fila de datos'],
          warnings: []
        };
      }

      const headers = this.parseCSVLine(lines[0]);
      
      // Debug: Log los headers encontrados
      console.log('Headers encontrados:', headers);
      console.log('Headers normalizados:', headers.map(h => 
        h.toLowerCase()
          .trim()
          .replace(/[^a-z0-9_]/g, '_')
          .replace(/_+/g, '_')
          .replace(/^_|_$/g, '')
      ));
      
      const validationResult = this.validateHeaders(headers);
      
      if (!validationResult.isValid) {
        return validationResult;
      }

      const data: ProductTemplate[] = [];
      const errors: string[] = [];
      const warnings: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const rowData = this.parseCSVLine(lines[i]);
        const rowValidation = this.validateRow(rowData, i + 1);
        
        if (rowValidation.isValid) {
          data.push(this.mapRowToProduct(rowData, headers));
        } else {
          errors.push(...rowValidation.errors);
        }
      }

      // Validar duplicados (siempre ejecutar, independientemente de otros errores)
      const duplicates = this.findDuplicates(data);
      if (duplicates.length > 0) {
        errors.push(`Se encontraron productos duplicados: ${duplicates.join(', ')}`);
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        data: errors.length === 0 ? data : undefined
      };

    } catch (error) {
      return {
        isValid: false,
        errors: ['Error al leer el archivo CSV'],
        warnings: []
      };
    }
  }

  async validateXLSXFile(file: File): Promise<ValidationResult> {
    // Para archivos XLSX necesitaríamos una librería como xlsx
    // Por ahora simulamos la validación
    return {
      isValid: false,
      errors: ['La validación de archivos XLSX aún no está implementada. Usa archivos CSV.'],
      warnings: []
    };
  }

  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file, 'UTF-8');
    });
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  private validateHeaders(headers: string[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Normalizar headers (minúsculas, sin espacios, sin caracteres especiales)
    const normalizedHeaders = headers.map(h => 
      h.toLowerCase()
        .trim()
        .replace(/[^a-z0-9_]/g, '_') // Reemplazar caracteres especiales con _
        .replace(/_+/g, '_') // Reemplazar múltiples _ con uno solo
        .replace(/^_|_$/g, '') // Quitar _ del inicio y final
    );

    // Mapeo de variaciones de nombres de campos
    const fieldVariations: { [key: string]: string[] } = {
      'nombre': ['nombre', 'name', 'producto', 'product', 'item'],
      'descripcion': ['descripcion', 'description', 'desc', 'detalle', 'detail'],
      'precio': ['precio', 'price', 'costo', 'cost', 'valor'],
      'categoria': ['categoria', 'category', 'categ', 'tipo', 'type'],
      'stock_minimo': ['stock_minimo', 'stock_min', 'minimo', 'minimum', 'min_stock'],
      'unidad_medida': ['unidad_medida', 'unidad', 'unit', 'medida', 'measure', 'uom']
    };

    // Verificar campos obligatorios con variaciones
    const missingFields: string[] = [];
    const foundFields: string[] = [];
    
    for (const field of this.requiredFields) {
      let found = false;
      
      // Buscar el campo exacto
      if (normalizedHeaders.includes(field)) {
        found = true;
        foundFields.push(field);
      } else {
        // Buscar variaciones
        const variations = fieldVariations[field] || [];
        for (const variation of variations) {
          if (normalizedHeaders.includes(variation)) {
            found = true;
            foundFields.push(field);
            break;
          }
        }
      }
      
      if (!found) {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      errors.push(`Campos obligatorios faltantes: ${missingFields.join(', ')}`);
      errors.push(`Headers encontrados: ${normalizedHeaders.join(', ')}`);
    }

    // Verificar campos adicionales (solo si no hay campos faltantes)
    if (missingFields.length === 0) {
      const additionalFields = normalizedHeaders.filter(h => !foundFields.includes(h));
      if (additionalFields.length > 0) {
        warnings.push(`Campos adicionales encontrados: ${additionalFields.join(', ')}`);
      }
    }

    // Verificar headers duplicados
    const duplicateHeaders = this.findDuplicateHeaders(normalizedHeaders);
    if (duplicateHeaders.length > 0) {
      errors.push(`Headers duplicados encontrados: ${duplicateHeaders.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private validateRow(rowData: string[], rowNumber: number): ValidationResult {
    const errors: string[] = [];

    // Verificar que no esté vacía
    if (rowData.every(cell => !cell.trim())) {
      errors.push(`Fila ${rowNumber}: Fila vacía`);
      return { isValid: false, errors, warnings: [] };
    }

    // Validar campos obligatorios (asumiendo orden estándar)
    const fieldNames = this.requiredFields;
    
    for (let i = 0; i < fieldNames.length && i < rowData.length; i++) {
      const fieldName = fieldNames[i];
      const value = rowData[i]?.trim();
      
      if (!value) {
        errors.push(`Fila ${rowNumber}: Campo '${fieldName}' es obligatorio`);
        continue;
      }

      // Validar tipo de dato
      const expectedType = this.fieldTypes[fieldName as keyof typeof this.fieldTypes];
      if (expectedType === 'number') {
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue < 0) {
          errors.push(`Fila ${rowNumber}: Campo '${fieldName}' debe ser un número válido mayor o igual a 0`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: []
    };
  }

  private mapRowToProduct(rowData: string[], headers: string[]): ProductTemplate {
    // Normalizar headers para hacer el mapeo
    const normalizedHeaders = headers.map(h => 
      h.toLowerCase()
        .trim()
        .replace(/[^a-z0-9_]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')
    );

    // Crear un mapa de headers normalizados a índices
    const headerMap: { [key: string]: number } = {};
    normalizedHeaders.forEach((header, index) => {
      headerMap[header] = index;
    });

    return {
      nombre: rowData[headerMap['nombre']]?.trim() || '',
      descripcion: rowData[headerMap['descripcion']]?.trim() || '',
      precio: parseFloat(rowData[headerMap['precio']]?.trim() || '0'),
      categoria: rowData[headerMap['categoria']]?.trim() || '',
      stock_minimo: parseInt(rowData[headerMap['stock_minimo']]?.trim() || '0'),
      unidad_medida: rowData[headerMap['unidad_medida']]?.trim() || ''
    };
  }

  private findDuplicateHeaders(headers: string[]): string[] {
    const seen = new Set<string>();
    const duplicates: string[] = [];
    
    for (const header of headers) {
      if (seen.has(header)) {
        duplicates.push(header);
      } else {
        seen.add(header);
      }
    }
    
    return duplicates;
  }

  private findDuplicates(data: ProductTemplate[]): string[] {
    const seen = new Set<string>();
    const duplicates: string[] = [];
    
    for (const product of data) {
      // Crear una clave única basada en nombre y código (si existe)
      const key = `${product.nombre.toLowerCase().trim()}`;
      
      if (seen.has(key)) {
        duplicates.push(product.nombre);
      } else {
        seen.add(key);
      }
    }
    
    return duplicates;
  }

  generateTemplateCSV(): string {
    const headers = this.requiredFields.join(',');
    const sampleData = [
      'Producto Ejemplo 1,Descripción del producto 1,10000,Categoría A,10,unidad',
      'Producto Ejemplo 2,Descripción del producto 2,15000,Categoría B,5,kg',
      'Producto Ejemplo 3,Descripción del producto 3,20000,Categoría A,15,litro'
    ].join('\n');
    
    return `${headers}\n${sampleData}`;
  }
}

