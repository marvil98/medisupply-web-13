import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  ApplicationRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PageHeader } from '../../shared/page-header/page-header';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { currentLangSignal, loadTranslations } from '../../shared/lang/lang-store';
import { Router } from '@angular/router';

interface Product {
  id: string;
  name: string;
  maxUnits: number;
  selectedUnits: number;
}

interface SalesPlanForm {
  product: string;
  region: string;
  quarter: string;
  totalGoal: number;
  products: Product[];
}

@Component({
  selector: 'app-sales-plan',
  standalone: true,
  imports: [
    PageHeader,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatInputModule,
    MatExpansionModule,
    MatCheckboxModule,
    TranslatePipe,
  ],
  templateUrl: './sales-plan.html',
  styleUrls: ['./sales-plan.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesPlan {
  private readonly appRef = inject(ApplicationRef);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  
  public readonly currentLangSignal = currentLangSignal;
  pageTitle = 'pageSalesPlanTitle';
  backRoute = '/dashboard';

  // Formulario reactivo
  salesPlanForm: FormGroup;

  // Opciones para los selectores
  regionOptions = [
    { value: 'norte', labelKey: 'region_norte' },
    { value: 'centro', labelKey: 'region_centro' },
    { value: 'sur', labelKey: 'region_sur' },
    { value: 'caribe', labelKey: 'region_caribe' },
    { value: 'pacifico', labelKey: 'region_pacifico' },
  ];

  quarterOptions = [
    { value: 'Q1', labelKey: 'quarter_q1' },
    { value: 'Q2', labelKey: 'quarter_q2' },
    { value: 'Q3', labelKey: 'quarter_q3' },
    { value: 'Q4', labelKey: 'quarter_q4' },
  ];

  // Productos de ejemplo (en un caso real vendrían de un servicio)
  products: Product[] = [
    { id: '1', name: 'Producto A', maxUnits: 1000, selectedUnits: 0 },
    { id: '2', name: 'Producto B', maxUnits: 500, selectedUnits: 0 },
    { id: '3', name: 'Producto C', maxUnits: 800, selectedUnits: 0 },
    { id: '4', name: 'Producto D', maxUnits: 1200, selectedUnits: 0 },
  ];

  // Estados del formulario
  saveStatus = signal<'idle' | 'saving' | 'success' | 'error'>('idle');
  formErrors = signal<Record<string, string>>({});

  // Computed para validar si el formulario está completo
  isFormValid = computed(() => {
    const form = this.salesPlanForm;
    return form.valid && this.products.some(p => p.selectedUnits > 0);
  });

  // Computed para calcular la meta total
  totalGoal = computed(() => {
    return this.products.reduce((sum, product) => sum + product.selectedUnits, 0);
  });

  constructor() {
    this.salesPlanForm = this.fb.group({
      product: ['', Validators.required],
      region: ['', Validators.required],
      quarter: ['', Validators.required],
      totalGoal: [0, [Validators.required, Validators.min(1)]],
    });

    // Actualizar la meta total cuando cambien los productos
    this.salesPlanForm.get('totalGoal')?.setValue(this.totalGoal());
  }

  onProductUnitsChange(productId: string, units: number) {
    const product = this.products.find(p => p.id === productId);
    if (product) {
      if (units > product.maxUnits) {
        this.formErrors.set({
          ...this.formErrors(),
          [`product_${productId}`]: 'La cantidad no puede exceder el tope máximo'
        });
        return;
      }
      
      product.selectedUnits = units;
      this.salesPlanForm.get('totalGoal')?.setValue(this.totalGoal());
      this.clearError(`product_${productId}`);
    }
  }

  onTotalGoalChange(totalGoal: number) {
    this.salesPlanForm.get('totalGoal')?.setValue(totalGoal);
  }

  clearError(field: string) {
    const errors = { ...this.formErrors() };
    delete errors[field];
    this.formErrors.set(errors);
  }

  validateField(fieldName: string) {
    const field = this.salesPlanForm.get(fieldName);
    if (field && field.invalid && field.touched) {
      this.formErrors.set({
        ...this.formErrors(),
        [fieldName]: 'Campo obligatorio'
      });
    } else {
      this.clearError(fieldName);
    }
  }

  createSalesPlan() {
    if (this.isFormValid()) {
      this.saveStatus.set('saving');
      
      // Simular llamada al servicio
      setTimeout(() => {
        this.saveStatus.set('success');
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      }, 1000);
    }
  }

  getErrorMessage(fieldName: string): string {
    return this.formErrors()[fieldName] || '';
  }
}
