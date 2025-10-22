import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../shared/page-header/page-header';
import { StatusMessage } from '../../../shared/status-message/status-message';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { Router } from '@angular/router';
import { FileValidationService, ValidationResult } from '../../../services/file-validation.service';
import { ConfirmDialog } from './confirm-dialog.component';
import { EditProductDialog } from './edit-product-dialog.component';

export interface Product {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  stock_minimo: number;
  unidad_medida: string;
  estado: 'activo' | 'inactivo';
  fecha_creacion: Date;
}

interface UploadedFile {
  id: string;
  file: File;
  isValid: boolean;
  errorMessage?: string;
  progress: number;
  validationResult?: ValidationResult;
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatCardModule,
    MatChipsModule,
    MatMenuModule,
    MatDividerModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatPaginatorModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    PageHeader,
    StatusMessage,
    TranslatePipe
  ],
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.css']
})
export class ProductList {
  pageTitle = 'pageProductListTitle';
  backRoute = '/dashboard';

  // Estados para la funcionalidad de carga
  showUploadSection = signal(false);
  uploadedFiles = signal<UploadedFile[]>([]);
  isUploading = signal(false);
  showSuccessMessage = signal(false);
  showErrorMessage = signal(false);
  errorMessage = signal('');

  private readonly allowedTypes = ['.csv', '.xlsx'];
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB

  // Propiedades para paginación
  pageSize = 10;
  pageIndex = 0;
  totalProducts = signal(0);

  // Datos mock de productos (simulando los productos cargados)
  products = signal<Product[]>([
    {
      id: '1',
      nombre: 'Producto Ejemplo 1',
      descripcion: 'Descripción del producto 1',
      precio: 10000,
      categoria: 'Categoría A',
      stock_minimo: 10,
      unidad_medida: 'unidad',
      estado: 'activo',
      fecha_creacion: new Date('2024-01-15')
    },
    {
      id: '2',
      nombre: 'Producto Ejemplo 2',
      descripcion: 'Descripción del producto 2',
      precio: 15000,
      categoria: 'Categoría B',
      stock_minimo: 5,
      unidad_medida: 'kg',
      estado: 'activo',
      fecha_creacion: new Date('2024-01-15')
    },
    {
      id: '3',
      nombre: 'Producto Ejemplo 3',
      descripcion: 'Descripción del producto 3',
      precio: 20000,
      categoria: 'Categoría A',
      stock_minimo: 15,
      unidad_medida: 'litro',
      estado: 'activo',
      fecha_creacion: new Date('2024-01-15')
    },
    {
      id: '4',
      nombre: 'Producto Ejemplo 4',
      descripcion: 'Descripción del producto 4',
      precio: 25000,
      categoria: 'Categoría C',
      stock_minimo: 8,
      unidad_medida: 'unidad',
      estado: 'activo',
      fecha_creacion: new Date('2024-01-15')
    }
  ]);

  displayedColumns: string[] = [
    'nombre',
    'descripcion', 
    'precio',
    'categoria',
    'stock_minimo',
    'unidad_medida',
    'estado',
    'acciones'
  ];

  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private fileValidationService = inject(FileValidationService);
  private dialog = inject(MatDialog);

  // Categorías disponibles para los productos
  availableCategories = ['Categoría A', 'Categoría B', 'Categoría C', 'Medicamentos', 'Equipos', 'Suministros'];
  
  // Unidades de medida disponibles
  availableUnits = ['unidad', 'kg', 'litro', 'ml', 'mg', 'g', 'caja', 'paquete'];

  // Computed signal para productos paginados
  paginatedProducts = signal<Product[]>([]);

  constructor() {
    // Inicializar productos paginados
    this.updatePaginatedProducts();
  }

  toggleUploadSection(): void {
    this.showUploadSection.set(!this.showUploadSection());
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      Array.from(input.files).forEach(file => this.processFile(file));
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files) {
      Array.from(files).forEach(file => this.processFile(file));
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  private processFile(file: File): void {
    // Validar tipo de archivo
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!this.allowedTypes.includes(fileExtension)) {
      this.showError('uploadInvalidFormat');
      return;
    }

    // Validar tamaño
    if (file.size > this.maxFileSize) {
      this.showError('uploadFileTooLarge');
      return;
    }

    // Crear objeto de archivo
    const uploadedFile: UploadedFile = {
      id: this.generateId(),
      file,
      isValid: true,
      progress: 0
    };

    // Simular validación del archivo
    this.validateFileContent(uploadedFile);

    // Agregar a la lista
    this.uploadedFiles.update(files => [...files, uploadedFile]);
  }

  private async validateFileContent(file: UploadedFile): Promise<void> {
    try {
      file.progress = 50;
      
      let validationResult: ValidationResult;
      
      if (file.file.name.toLowerCase().endsWith('.csv')) {
        validationResult = await this.fileValidationService.validateCSVFile(file.file);
      } else if (file.file.name.toLowerCase().endsWith('.xlsx')) {
        validationResult = await this.fileValidationService.validateXLSXFile(file.file);
      } else {
        validationResult = {
          isValid: false,
          errors: ['Formato de archivo no soportado'],
          warnings: []
        };
      }
      
      file.validationResult = validationResult;
      file.isValid = validationResult.isValid;
      file.progress = 100;
      
      if (!validationResult.isValid) {
        file.errorMessage = validationResult.errors.join('; ');
      }
      
    } catch (error) {
      file.isValid = false;
      file.errorMessage = 'Error al validar el archivo';
      file.progress = 100;
    }
  }

  removeFile(fileId: string): void {
    this.uploadedFiles.update(files => 
      files.filter(file => file.id !== fileId)
    );
  }

  downloadTemplate(): void {
    const csvContent = this.fileValidationService.generateTemplateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'plantilla_productos.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  uploadProducts(): void {
    const validFiles = this.uploadedFiles().filter(file => file.isValid);
    
    if (validFiles.length === 0) {
      this.showError('uploadNoValidFiles');
      return;
    }

    this.isUploading.set(true);
    this.showSuccessMessage.set(false);
    this.showErrorMessage.set(false);

    // Simular proceso de carga
    setTimeout(() => {
      this.isUploading.set(false);
      this.showSuccessMessage.set(true);
      
      // Simular agregar productos al listado
      this.addProductsFromFiles(validFiles);
      
      // Limpiar archivos cargados
      this.uploadedFiles.set([]);
      this.showUploadSection.set(false);
      
      // Mostrar mensaje de éxito
      setTimeout(() => {
        this.showSuccessMessage.set(false);
      }, 3000);
    }, 3000);
  }

  private addProductsFromFiles(files: UploadedFile[]): void {
    const newProducts: Product[] = [];
    
    files.forEach(file => {
      if (file.validationResult?.data) {
        // Usar los datos reales del archivo CSV
        const csvProducts = file.validationResult.data.map((productData, index) => ({
          id: (this.products().length + newProducts.length + index + 1).toString(),
          nombre: productData.nombre,
          descripcion: productData.descripcion,
          precio: productData.precio,
          categoria: productData.categoria,
          stock_minimo: productData.stock_minimo,
          unidad_medida: productData.unidad_medida,
          estado: 'activo' as const,
          fecha_creacion: new Date()
        }));
        
        newProducts.push(...csvProducts);
      }
    });

    this.products.update(current => [...current, ...newProducts]);
    
    // Actualizar paginación después de agregar productos
    this.updatePaginatedProducts();
  }

  private showError(messageKey: string): void {
    this.errorMessage.set(messageKey);
    this.showErrorMessage.set(true);
    setTimeout(() => this.showErrorMessage.set(false), 5000);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  get hasValidFiles(): boolean {
    return this.uploadedFiles().some(file => file.isValid);
  }

  get validFilesCount(): number {
    return this.uploadedFiles().filter(file => file.isValid).length;
  }

  // Métodos para paginación
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedProducts();
  }

  private updatePaginatedProducts(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    const paginated = this.products().slice(startIndex, endIndex);
    this.paginatedProducts.set(paginated);
    this.totalProducts.set(this.products().length);
  }

  editProduct(product: Product): void {
    const dialogRef = this.dialog.open(EditProductDialog, {
      width: '500px',
      data: { 
        product: { ...product },
        categories: this.availableCategories,
        units: this.availableUnits
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Actualizar el producto en la lista
        this.products.update(products => 
          products.map(p => p.id === product.id ? { ...result, id: product.id, fecha_creacion: product.fecha_creacion } : p)
        );
        this.updatePaginatedProducts();
        
        this.snackBar.open('Producto actualizado exitosamente', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      }
    });
  }

  deleteProduct(product: Product): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: {
        title: 'Confirmar eliminación',
        message: `¿Estás seguro de que deseas eliminar el producto "${product.nombre}"? Esta acción no se puede deshacer.`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        isDestructive: true
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        // Eliminar el producto de la lista
        this.products.update(products => 
          products.filter(p => p.id !== product.id)
        );
        this.updatePaginatedProducts();
        
        this.snackBar.open('Producto eliminado exitosamente', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      }
    });
  }

  toggleProductStatus(product: Product): void {
    const newStatus = product.estado === 'activo' ? 'inactivo' : 'activo';
    const actionText = newStatus === 'activo' ? 'activar' : 'desactivar';
    
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: {
        title: `Confirmar ${actionText}`,
        message: `¿Estás seguro de que deseas ${actionText} el producto "${product.nombre}"?`,
        confirmText: actionText.charAt(0).toUpperCase() + actionText.slice(1),
        cancelText: 'Cancelar',
        isDestructive: false
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        // Cambiar el estado del producto
        this.products.update(products => 
          products.map(p => p.id === product.id ? { ...p, estado: newStatus } : p)
        );
        this.updatePaginatedProducts();
        
        this.snackBar.open(`Producto ${actionText}do exitosamente`, 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      }
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }
}
