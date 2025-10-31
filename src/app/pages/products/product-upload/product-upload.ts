import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { PageHeader } from '../../../shared/page-header/page-header';
import { StatusMessage } from '../../../shared/status-message/status-message';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { Router } from '@angular/router';
import { FileValidationService, ValidationResult } from '../../../services/file-validation.service';

interface UploadedFile {
  id: string;
  file: File;
  isValid: boolean;
  errorMessage?: string;
  progress: number;
  validationResult?: ValidationResult;
}

@Component({
  selector: 'app-product-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressBarModule,
    MatSnackBarModule,
    PageHeader,
    StatusMessage,
    TranslatePipe
  ],
  templateUrl: './product-upload.html',
  styleUrls: ['./product-upload.css']
})
export class ProductUpload {
  pageTitle = 'pageProductUploadTitle';
  backRoute = '/dashboard';

  uploadedFiles = signal<UploadedFile[]>([]);
  isUploading = signal(false);
  showSuccessMessage = signal(false);
  showErrorMessage = signal(false);
  errorMessage = signal('');

  private readonly allowedTypes = ['.csv', '.xlsx'];
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB

  constructor(
    private snackBar: MatSnackBar,
    private router: Router,
    private fileValidationService: FileValidationService
  ) {}

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
    // Crear y descargar plantilla CSV usando el servicio
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
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        this.router.navigate(['/productos']);
        this.snackBar.open('¡Productos cargados exitosamente!', 'Cerrar', {
          duration: 3000
        });
      }, 2000);
    }, 3000);
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
}
