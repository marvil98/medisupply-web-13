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
  price: number;
  image?: string;
  goal?: number;
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
    { id: '1', name: 'Aspirina 500mg', price: 2.50 },
    { id: '2', name: 'Paracetamol 1g', price: 3.20, image: 'assets/images/products/acetaminofen.png' },
    { id: '3', name: 'Ibuprofeno 400mg', price: 4.80, image: 'assets/images/products/ibuprofeno.png' },
    { id: '4', name: 'Omeprazol 20mg', price: 5.60 },
    { id: '5', name: 'Loratadina 10mg', price: 3.90, image: 'assets/images/products/dolex.png' },
    { id: '6', name: 'Vitamina C 1000mg', price: 6.40 },
    { id: '7', name: 'Calcio + Vitamina D', price: 8.20 },
    { id: '8', name: 'Magnesio 400mg', price: 7.50 },
    { id: '9', name: 'Omega 3 1000mg', price: 12.80 },
    { id: '10', name: 'Probióticos', price: 15.60 },
    { id: '11', name: 'Melatonina 3mg', price: 9.40 },
    { id: '12', name: 'Jarabe para la Tos', price: 4.20 },
    { id: '13', name: 'Crema Hidratante', price: 6.80 },
    { id: '14', name: 'Protector Solar FPS 50', price: 8.90 },
    { id: '15', name: 'Shampoo Anticaspa', price: 5.30 },
  ];

  // Imagen por defecto
  defaultImage = 'assets/images/products/por-defecto.png';

  // Función para convertir valores según el país
  private convertValue(value: number): number {
    const country = localStorage.getItem('userCountry') || 'CO';
    const rates: Record<string, number> = { 'CO': 4100, 'PE': 3.7, 'EC': 1, 'MX': 17.5 };
    return Math.round(value * (rates[country] || 1));
  }

  // Computed signal para obtener el símbolo de moneda según el país
  currencySymbol = computed(() => {
    const country = localStorage.getItem('userCountry') || 'CO';
    const symbols: Record<string, string> = { 'CO': '$', 'PE': 'S/', 'EC': '$', 'MX': '$' };
    return symbols[country] || '$';
  });

  // Estados del selector de productos
  isProductSelectorOpen = false;
  selectedProducts: Product[] = [];
  productSearchFilter = signal('');
  sortBy = signal<'name' | 'price' | 'popularity'>('name');
  sortOrder = signal<'asc' | 'desc'>('asc');
  itemsPerPage = signal(20);
  currentPage = signal(1);
  
  // Estados del modal de meta
  showGoalModal = false;
  currentProduct: Product | null = null;
  goalValue = '';

  // Estados del formulario
  saveStatus = signal<'idle' | 'saving' | 'success' | 'error'>('idle');
  formErrors = signal<Record<string, string>>({});

  // Computed para validar si el formulario está completo
  isFormValid = computed(() => {
    return this.salesPlanForm.valid && this.selectedProducts.length > 0;
  });

  // Computed para filtrar, ordenar y paginar productos
  filteredProducts = computed(() => {
    const filter = this.productSearchFilter().trim();
    let filtered = this.products;
    
    // Aplicar filtro de búsqueda
    if (filter) {
      const filterLower = filter.toLowerCase();
      filtered = this.products.filter(product => 
        product.name.toLowerCase().includes(filterLower)
      );
    }
    
    // Aplicar ordenamiento
    const sortByValue = this.sortBy();
    const sortOrderValue = this.sortOrder();
    
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0;
      
      switch (sortByValue) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'popularity':
          // Simular popularidad basada en el ID (en un caso real vendría de datos)
          comparison = parseInt(a.id) - parseInt(b.id);
          break;
      }
      
      return sortOrderValue === 'desc' ? -comparison : comparison;
    });
    
    return filtered;
  });

  // Computed para productos paginados
  paginatedProducts = computed(() => {
    const allFiltered = this.filteredProducts();
    const page = this.currentPage();
    const perPage = this.itemsPerPage();
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    
    return allFiltered.slice(startIndex, endIndex);
  });

  // Computed para información de paginación
  paginationInfo = computed(() => {
    const total = this.filteredProducts().length;
    const perPage = this.itemsPerPage();
    const current = this.currentPage();
    const totalPages = Math.ceil(total / perPage);
    
    return {
      total,
      current,
      totalPages,
      startItem: (current - 1) * perPage + 1,
      endItem: Math.min(current * perPage, total)
    };
  });

  constructor() {
    this.salesPlanForm = this.fb.group({
      product: ['', Validators.required],
      region: ['', Validators.required],
      quarter: ['', Validators.required],
      totalGoal: ['', Validators.required],
    });
  }

  onTotalGoalChange(totalGoal: string) {
    this.salesPlanForm.get('totalGoal')?.setValue(totalGoal);
  }

  toggleProductSelector() {
    this.isProductSelectorOpen = !this.isProductSelectorOpen;
  }

  selectProduct(product: Product) {
    const index = this.selectedProducts.findIndex(p => p.id === product.id);
    if (index > -1) {
      // Si ya está seleccionado, lo removemos
      this.selectedProducts.splice(index, 1);
    } else {
      // Si no está seleccionado, lo agregamos
      this.selectedProducts.push(product);
    }
  }

  isProductSelected(product: Product): boolean {
    return this.selectedProducts.some(p => p.id === product.id);
  }

  getSelectedProductsText(): string {
    if (this.selectedProducts.length === 0) {
      return 'select_products';
    } else if (this.selectedProducts.length === 1) {
      return this.selectedProducts[0].name;
    } else {
      return `${this.selectedProducts.length} products_selected`;
    }
  }

  setProductGoal(product: Product, event: Event) {
    event.stopPropagation();
    this.currentProduct = product;
    this.goalValue = product.goal ? product.goal.toString() : '';
    this.showGoalModal = true;
  }

  saveGoal() {
    if (this.currentProduct && this.goalValue && !isNaN(Number(this.goalValue)) && Number(this.goalValue) > 0) {
      this.currentProduct.goal = Number(this.goalValue);
      this.closeGoalModal();
    }
  }

  closeGoalModal() {
    this.showGoalModal = false;
    this.currentProduct = null;
    this.goalValue = '';
  }

  clearProductFilter() {
    this.productSearchFilter.set('');
  }

  onSearchChange(value: string) {
    this.productSearchFilter.set(value);
    this.currentPage.set(1); // Reset a la primera página al buscar
  }

  // Métodos para ordenamiento
  setSortBy(sortBy: 'name' | 'price' | 'popularity') {
    this.sortBy.set(sortBy);
  }

  toggleSortOrder() {
    this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
  }

  // Métodos para paginación
  setItemsPerPage(items: number) {
    this.itemsPerPage.set(items);
    this.currentPage.set(1); // Reset a la primera página
  }

  goToPage(page: number) {
    const totalPages = this.paginationInfo().totalPages;
    if (page >= 1 && page <= totalPages) {
      this.currentPage.set(page);
    }
  }

  nextPage() {
    const totalPages = this.paginationInfo().totalPages;
    if (this.currentPage() < totalPages) {
      this.currentPage.set(this.currentPage() + 1);
    }
  }

  previousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
    }
  }

  getProductImage(product: Product): string {
    if (product.image) {
      return product.image;
    }
    return this.defaultImage;
  }

  onImageError(event: any, product: Product) {
    // Si la imagen falla al cargar, usar la imagen por defecto
    event.target.src = this.defaultImage;
  }

  // Método para obtener el precio convertido de un producto
  getConvertedPrice(product: Product): number {
    return this.convertValue(product.price);
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
      
      // Preparar datos del plan de venta
      const salesPlanData = {
        region: this.salesPlanForm.get('region')?.value,
        quarter: this.salesPlanForm.get('quarter')?.value,
        totalGoal: this.salesPlanForm.get('totalGoal')?.value,
        products: this.selectedProducts.map(product => ({
          id: product.id,
          name: product.name,
          goal: product.goal || 0
        }))
      };
      
      console.log('Plan de venta creado:', salesPlanData);
      
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
