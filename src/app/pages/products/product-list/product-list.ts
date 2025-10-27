import { Component, signal, inject, OnInit } from '@angular/core';
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
import { ProductsService, Product } from '../../../services/products.service';
import { ConfirmDialog } from './confirm-dialog.component';
import { EditProductDialog } from './edit-product-dialog.component';


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
export class ProductList implements OnInit {
  pageTitle = 'pageProductListTitle';
  backRoute = '/dashboard';

  // Estados para la funcionalidad de carga
  showUploadSection = signal(false);
  uploadedFiles = signal<UploadedFile[]>([]);
  isUploading = signal(false);
  showSuccessMessage = signal(false);
  showErrorMessage = signal(false);
  errorMessage = signal('');
  isLoading = signal(false);

  private readonly allowedTypes = ['.csv', '.xlsx'];
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB

  // Propiedades para paginación
  pageSize = 10;
  pageIndex = 0;
  totalProducts = signal(0);

  // Productos desde el servicio real
  products = signal<Product[]>([]);

  displayedColumns: string[] = [
    'sku',
    'name',
    'value',
    'category_name',
    'total_quantity',
    'actions'
  ];

  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private fileValidationService = inject(FileValidationService);
  private productsService = inject(ProductsService);
  private dialog = inject(MatDialog);

  // Categorías disponibles para los productos
  availableCategories = ['Categoría A', 'Categoría B', 'Categoría C', 'Medicamentos', 'Equipos', 'Suministros'];
  
  // Unidades de medida disponibles
  availableUnits = ['unidad', 'kg', 'litro', 'ml', 'mg', 'g', 'caja', 'paquete'];

  // Computed signal para productos paginados
  paginatedProducts = signal<Product[]>([]);

  constructor() {
    // Los productos se cargarán en ngOnInit
  }

  ngOnInit(): void {
    // Limpiar cualquier dato residual
    this.products.set([]);
    this.totalProducts.set(0);
    this.updatePaginatedProducts();
    
    // Cargar productos del backend
    this.loadProducts();
  }

  /**
   * Carga los productos desde el servicio
   */
  loadProducts(): void {
    this.isLoading.set(true);
    this.showErrorMessage.set(false);
    
    console.log('🔄 ProductList: Iniciando carga de productos desde el backend...');
    
    this.productsService.getAvailableProducts().subscribe({
      next: (response) => {
        console.log('✅ ProductList: Productos cargados exitosamente:', response);
        console.log('📊 ProductList: Cantidad de productos recibidos:', response?.products?.length || 0);
        console.log('🔍 ProductList: Estructura completa de la respuesta:', JSON.stringify(response, null, 2));
        
        const products = response.products || [];
        console.log('📦 ProductList: Productos individuales:', products);
        
        // Verificar si hay datos del backend real
        const hasRealData = products.some(p => 
          p.sku === 'MED-001' || 
          p.sku === 'MED-002' || 
          p.sku === 'SURG-001' || 
          p.sku === 'EQUIP-001'
        );
        
        if (hasRealData) {
          console.log('✅ ProductList: ¡DATOS REALES DEL BACKEND DETECTADOS!');
          console.log('✅ ProductList: Los datos vienen del backend correctamente');
        }
        
        this.products.set(products);
        this.totalProducts.set(response.total || products.length);
        this.updatePaginatedProducts();
        this.isLoading.set(false);
        
        if (products.length === 0) {
          console.log('⚠️ ProductList: No hay productos en el backend');
          this.snackBar.open('No hay productos disponibles en el sistema', 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
        } else {
          console.log('✅ ProductList: Mostrando', products.length, 'productos del backend');
        }
      },
      error: (error) => {
        console.error('❌ ProductList: Error al cargar productos:', error);
        this.isLoading.set(false);
        this.showErrorMessage.set(true);
        this.errorMessage.set('Error al cargar los productos. Por favor, intenta de nuevo.');
        this.snackBar.open('Error al cargar los productos', 'Cerrar', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      }
    });
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
      file.progress = 25;
      
      let validationResult: ValidationResult;
      
      // Primera validación: estructura del archivo
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
      
      file.progress = 50;
      
      // Segunda validación: contra productos existentes (solo si la primera pasó)
      if (validationResult.isValid && validationResult.data) {
        const dbValidationResult = await this.fileValidationService.validateAgainstExistingProducts(validationResult.data, file.file);
        
        // Combinar resultados
        validationResult.errors = [...validationResult.errors, ...dbValidationResult.errors];
        validationResult.warnings = [...validationResult.warnings, ...dbValidationResult.warnings];
        validationResult.isValid = validationResult.errors.length === 0;
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
    // Usar el método que obtiene datos reales del backend
    this.fileValidationService.generateTemplateCSVWithRealData().then(csvContent => {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'plantilla_productos.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      this.snackBar.open('Plantilla descargada con datos reales', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
    }).catch(error => {
      console.error('Error al generar plantilla:', error);
      // Fallback al método síncrono en caso de error
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
    });
  }

  async uploadProducts(): Promise<void> {
    const validFiles = this.uploadedFiles().filter(file => file.isValid);
    
    if (validFiles.length === 0) {
      this.showError('uploadNoValidFiles');
      return;
    }

    this.isUploading.set(true);
    this.showSuccessMessage.set(false);
    this.showErrorMessage.set(false);

    try {
      console.log(`🔄 ProductList: Procesando ${validFiles.length} archivos válidos...`);
      
      // Procesar cada archivo válido enviando datos al backend
      for (const file of validFiles) {
        if (file.validationResult?.data) {
          console.log(`📤 ProductList: Enviando archivo ${file.file.name} al backend...`);
          
          try {
            // Enviar datos al backend - este método realmente hace el POST
            console.log(`📊 ProductList: Datos a enviar para ${file.file.name}:`, file.validationResult.data.length, 'productos');
            const result = await this.fileValidationService.validateAgainstExistingProducts(file.validationResult.data, file.file);
            console.log(`✅ ProductList: Archivo ${file.file.name} enviado exitosamente`);
            console.log(`📋 ProductList: Resultado del backend:`, result);
          } catch (error) {
            console.error(`❌ ProductList: Error enviando archivo ${file.file.name}:`, error);
            // Continuar con otros archivos aunque uno falle
          }
        }
      }
      
      // Esperar un momento para que el backend procese los datos
      console.log('⏳ ProductList: Esperando que el backend procese los datos...');
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 segundo de espera
      
      // Actualizar la tabla después de enviar todos los archivos
      console.log('🔄 ProductList: Actualizando tabla después de enviar archivos...');
      this.loadProducts();
      
      this.isUploading.set(false);
      this.showSuccessMessage.set(true);
      
      // Mostrar mensaje de éxito
      this.addProductsFromFiles(validFiles);
      
      // Limpiar archivos cargados
      this.uploadedFiles.set([]);
      this.showUploadSection.set(false);
      
      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        this.showSuccessMessage.set(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error al procesar archivos:', error);
      this.isUploading.set(false);
      this.showError('uploadSystemError');
    }
  }

  private addProductsFromFiles(files: UploadedFile[]): void {
    // Mostrar mensaje de confirmación de carga exitosa
    this.snackBar.open(`✅ ${files.length} archivo(s) procesado(s) exitosamente. Tabla actualizada.`, 'Cerrar', {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
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
    // Por ahora, mostrar mensaje de que la edición no está implementada
    this.snackBar.open('La edición de productos no está implementada aún', 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  deleteProduct(product: Product): void {
    // Por ahora, mostrar mensaje de que la eliminación no está implementada
    this.snackBar.open('La eliminación de productos no está implementada aún', 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  toggleProductStatus(product: Product): void {
    // Por ahora, mostrar mensaje de que el cambio de estado no está implementado
    this.snackBar.open('El cambio de estado de productos no está implementado aún', 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
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
