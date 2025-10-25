import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  isDestructive?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ],
  template: `
    <div class="confirm-dialog">
      <h2 mat-dialog-title>{{ data.title }}</h2>
      
      <mat-dialog-content>
        <p>{{ data.message }}</p>
      </mat-dialog-content>
      
      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">
          {{ data.cancelText }}
        </button>
        <button 
          mat-flat-button 
          [color]="data.isDestructive ? 'warn' : 'primary'"
          (click)="onConfirm()">
          {{ data.confirmText }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirm-dialog {
      padding: 0;
    }
    
    h2[mat-dialog-title] {
      margin: 0 0 16px 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #333;
    }
    
    mat-dialog-content {
      margin: 0 0 24px 0;
      padding: 0;
    }
    
    mat-dialog-content p {
      margin: 0;
      color: #666;
      line-height: 1.5;
    }
    
    mat-dialog-actions {
      margin: 0;
      padding: 0;
      gap: 8px;
    }
    
    button[mat-button] {
      color: #666;
    }
    
    button[mat-flat-button] {
      font-weight: 500;
    }
  `]
})
export class ConfirmDialog {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialog>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
