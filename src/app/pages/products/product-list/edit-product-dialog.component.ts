import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Product } from './product-list';

export interface EditProductDialogData {
  product: Product;
  categories: string[];
  units: string[];
}

@Component({
  selector: 'app-edit-product-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  template: `
    <div class="edit-dialog">
      <h2 mat-dialog-title>Editar Producto</h2>
      
      <mat-dialog-content>
        <form #productForm="ngForm" class="product-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nombre *</mat-label>
            <input 
              matInput 
              [(ngModel)]="editedProduct.nombre" 
              name="nombre"
              required
              placeholder="Ingrese el nombre del producto"
              #nombreInput="ngModel">
            <mat-error *ngIf="nombreInput.invalid && nombreInput.touched">
              El nombre es requerido
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Descripción *</mat-label>
            <textarea 
              matInput 
              [(ngModel)]="editedProduct.descripcion" 
              name="descripcion"
              rows="3"
              required
              placeholder="Ingrese la descripción del producto"
              #descripcionInput="ngModel">
            </textarea>
            <mat-error *ngIf="descripcionInput.invalid && descripcionInput.touched">
              La descripción es requerida
            </mat-error>
          </mat-form-field>

          <div class="form-row">
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Precio *</mat-label>
              <input 
                matInput 
                type="number" 
                [(ngModel)]="editedProduct.precio" 
                name="precio"
                min="0"
                step="0.01"
                required
                placeholder="0.00"
                #precioInput="ngModel">
              <span matPrefix>$&nbsp;</span>
              <mat-error *ngIf="precioInput.invalid && precioInput.touched">
                El precio debe ser mayor a 0
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Stock Mínimo *</mat-label>
              <input 
                matInput 
                type="number" 
                [(ngModel)]="editedProduct.stock_minimo" 
                name="stock_minimo"
                min="0"
                required
                placeholder="0"
                #stockInput="ngModel">
              <mat-error *ngIf="stockInput.invalid && stockInput.touched">
                El stock mínimo debe ser mayor o igual a 0
              </mat-error>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Categoría *</mat-label>
              <mat-select 
                [(ngModel)]="editedProduct.categoria" 
                name="categoria"
                required
                placeholder="Seleccione una categoría"
                #categoriaInput="ngModel">
                <mat-option *ngFor="let category of data.categories" [value]="category">
                  {{ category }}
                </mat-option>
              </mat-select>
              <mat-error *ngIf="categoriaInput.invalid && categoriaInput.touched">
                La categoría es requerida
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Unidad de Medida *</mat-label>
              <mat-select 
                [(ngModel)]="editedProduct.unidad_medida" 
                name="unidad_medida"
                required
                placeholder="Seleccione una unidad"
                #unidadInput="ngModel">
                <mat-option *ngFor="let unit of data.units" [value]="unit">
                  {{ unit }}
                </mat-option>
              </mat-select>
              <mat-error *ngIf="unidadInput.invalid && unidadInput.touched">
                La unidad de medida es requerida
              </mat-error>
            </mat-form-field>
          </div>
        </form>
      </mat-dialog-content>
      
      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">
          Cancelar
        </button>
        <button 
          mat-flat-button 
          color="primary"
          [disabled]="!productForm.form.valid"
          (click)="onSave()">
          Guardar Cambios
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .edit-dialog {
      padding: 0;
      min-width: 500px;
    }
    
    h2[mat-dialog-title] {
      margin: 0 0 24px 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #333;
      padding: 0 24px;
    }
    
    mat-dialog-content {
      margin: 0 0 24px 0;
      padding: 0 24px;
      max-height: 60vh;
      overflow-y: auto;
    }
    
    .product-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    
    .full-width {
      width: 100%;
    }
    
    .form-row {
      display: flex;
      gap: 16px;
    }
    
    .half-width {
      flex: 1;
    }
    
    mat-form-field {
      margin: 0;
      width: 100%;
    }
    
    mat-label {
      font-weight: 500;
      color: #333;
    }
    
    mat-dialog-actions {
      margin: 0;
      padding: 16px 24px;
      gap: 8px;
      border-top: 1px solid #e0e0e0;
    }
    
    button[mat-button] {
      color: #666;
      font-weight: 500;
    }
    
    button[mat-flat-button] {
      font-weight: 500;
      min-width: 120px;
    }
    
    textarea {
      resize: vertical;
      min-height: 80px;
    }
    
    input, textarea {
      font-size: 14px;
    }
    
    mat-select {
      font-size: 14px;
    }
    
    .mat-mdc-form-field-error {
      font-size: 12px;
    }
    
    @media (max-width: 600px) {
      .edit-dialog {
        min-width: 100%;
        max-width: 100%;
      }
      
      mat-dialog-content {
        padding: 0 16px;
      }
      
      h2[mat-dialog-title] {
        padding: 0 16px;
      }
      
      mat-dialog-actions {
        padding: 16px;
      }
      
      .form-row {
        flex-direction: column;
        gap: 0;
      }
      
      .half-width {
        width: 100%;
      }
    }
  `]
})
export class EditProductDialog {
  editedProduct: Product;

  constructor(
    public dialogRef: MatDialogRef<EditProductDialog>,
    @Inject(MAT_DIALOG_DATA) public data: EditProductDialogData
  ) {
    // Crear una copia del producto para editar
    this.editedProduct = { ...data.product };
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.editedProduct.nombre && this.editedProduct.descripcion && 
        this.editedProduct.precio > 0 && this.editedProduct.stock_minimo >= 0 &&
        this.editedProduct.categoria && this.editedProduct.unidad_medida) {
      this.dialogRef.close(this.editedProduct);
    }
  }
}
