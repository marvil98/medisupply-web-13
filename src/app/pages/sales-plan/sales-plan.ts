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
import { ProductsService, Product as BackendProduct } from '../../services/products.service';
import { OfferService, CreateSalesPlanPayload } from '../../services/offer.service';

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
  private readonly productsService = inject(ProductsService);
  private readonly offerService = inject(OfferService);
  
  public readonly currentLangSignal = currentLangSignal;
  pageTitle = 'pageSalesPlanTitle';
  backRoute = '/dashboard';

  // Formulario reactivo
  salesPlanForm: FormGroup;

  // Opciones para los selectores
  regionOptions: { value: string; labelKey: string }[] = [];
  quarterOptions: { value: string; labelKey: string }[] = [];

  // Productos (cargados desde backend)
  products: Product[] = [];

  // Imagen por defecto
  defaultImage = 'assets/images/products/por-defecto.png';

  // Función para convertir valores según el país
  private convertValue(value: number): number {
    const country = localStorage.getItem('userCountry') || 'CO';
    // Para Colombia, el backend ya devuelve valores en pesos, no necesitamos convertir
    const rates: Record<string, number> = { 'CO': 1, 'PE': 3.7, 'EC': 1, 'MX': 17.5 };
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
  // Señal para forzar recomputes cuando cambien metas/selecciones
  private selectedProductsVersion = signal(0);
  private formVersion = signal(0);
  productSearchFilter = signal('');
  sortBy = signal<'name' | 'price' | 'popularity'>('name');
  sortOrder = signal<'asc' | 'desc'>('asc');
  itemsPerPage = signal(10);
  currentPage = signal(1);
  
  // Estados del modal de meta
  showGoalModal = false;
  currentProduct: Product | null = null;
  goalValue = '';

  // Modal de confirmación de creación
  showConfirmModal = false;

  // Estados del formulario
  saveStatus = signal<'idle' | 'saving' | 'success' | 'error'>('idle');
  formErrors = signal<Record<string, string>>({});

  // Computed para validar si el formulario está completo (región + período + metas > 0)
  isFormValid = computed(() => {
    // Leer versión para que este cómputo reaccione a cambios en metas/selecciones
    this.selectedProductsVersion();
    this.formVersion();
    const region = this.salesPlanForm.get('region')?.value;
    const quarter = this.salesPlanForm.get('quarter')?.value;
    // Considera metas en cualquier producto (seleccionado o no)
    const hasUnits = this.products.some(p => (p.goal || 0) > 0);
    return !!region && !!quarter && hasUnits;
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

  // Paginación adaptable con elipsis (sin placeholders negativos)
  visiblePages = computed(() => {
    const total = this.paginationInfo().totalPages;
    const current = this.paginationInfo().current;
    const maxButtons = 9; // máximo de elementos (números y elipsis)

    const result: (number | string)[] = [];
    if (total <= maxButtons) {
      for (let i = 1; i <= total; i++) result.push(i);
      return result;
    }

    result.push(1);

    const windowSize = 5; // cantidad de páginas alrededor de la actual
    let start = Math.max(2, current - Math.floor(windowSize / 2));
    let end = Math.min(total - 1, current + Math.floor(windowSize / 2));

    // Ajuste si ventana toca bordes
    if (current <= 3) {
      start = 2;
      end = 2 + windowSize - 1;
    } else if (current >= total - 2) {
      end = total - 1;
      start = end - (windowSize - 1);
    }

    if (start > 2) result.push('…');
    for (let p = start; p <= end; p++) result.push(p);
    if (end < total - 1) result.push('…');

    result.push(total);
    return result.slice(0, maxButtons);
  });

  constructor() {
    this.salesPlanForm = this.fb.group({
      product: ['', Validators.required],
      region: ['', Validators.required],
      quarter: ['', Validators.required],
      totalGoal: [''], // se calcula automáticamente con unidades x precio
    });

    // Cargar productos disponibles desde backend
    this.loadAvailableProducts();

    // Cargar catálogos desde Offer (8082)
    this.loadCatalogs();

    // Reactivar validación cuando cambien región o período
    this.salesPlanForm.get('region')?.valueChanges.subscribe(() => {
      this.formVersion.set(this.formVersion() + 1);
    });
    this.salesPlanForm.get('quarter')?.valueChanges.subscribe(() => {
      this.formVersion.set(this.formVersion() + 1);
    });
  }

  private loadCatalogs() {
    // Regiones
    this.offerService.getRegions().subscribe({
      next: (regions) => {
        // Backend retorna [{ value:'Norte', label:'Norte' }, ...]
        const safe = Array.isArray(regions) ? regions : [];
        this.regionOptions = safe.map(r => ({ value: String(r.value), labelKey: `region_${String(r.value).toLowerCase()}` }));
      },
      error: () => {
        // Fallback local
        this.regionOptions = [
          { value: 'norte', labelKey: 'region_norte' },
          { value: 'centro', labelKey: 'region_centro' },
          { value: 'sur', labelKey: 'region_sur' },
          { value: 'caribe', labelKey: 'region_caribe' },
          { value: 'pacifico', labelKey: 'region_pacifico' },
        ];
      }
    });

    // Períodos
    this.offerService.getQuarters().subscribe({
      next: (quarters) => {
        const safe = Array.isArray(quarters) ? quarters : [];
        // Backend retorna [{ value:'Q1', label:'Q1 - ...'}, ...]
        this.quarterOptions = safe.map(q => ({ value: String(q.value), labelKey: `quarter_${String(q.value).toLowerCase()}` }));
      },
      error: () => {
        this.quarterOptions = [
          { value: 'Q1', labelKey: 'quarter_q1' },
          { value: 'Q2', labelKey: 'quarter_q2' },
          { value: 'Q3', labelKey: 'quarter_q3' },
          { value: 'Q4', labelKey: 'quarter_q4' },
        ];
      }
    });
  }

  private loadAvailableProducts() {
    // Usa /products/available (ProductsService.getAvailableProducts)
    console.log('🛒 SalesPlan: Cargando productos disponibles desde el backend...');
    this.productsService.getAvailableProducts(1).subscribe({
      next: (resp) => {
        console.log('🛒 SalesPlan: Respuesta recibida:', resp);
        const list = (resp.products || []) as unknown as BackendProduct[];
        this.products = list.map((p: any) => ({
          id: String(p.product_id ?? p.id ?? p.sku ?? ''),
          name: p.name,
          price: Number(p.value) || 0,
          image: p.image_url || undefined,
        }));
        console.log('🛒 SalesPlan: Productos mapeados:', this.products.length);

        // Forzar detección de cambios en caso de que no se actualice de inmediato
        this.appRef.tick();
      },
      error: () => {
        console.error('🛒 SalesPlan: Error cargando productos.');
        // Mantener lista vacía si falla (botón quedará deshabilitado hasta seleccionar productos)
        this.products = [];
        this.appRef.tick();
      },
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
    this.updateTotalGoalFromProducts();
    this.selectedProductsVersion.set(this.selectedProductsVersion() + 1);
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
      // Asegurar que el producto con meta quede seleccionado
      const exists = this.selectedProducts.some(p => p.id === this.currentProduct!.id);
      if (!exists) {
        this.selectedProducts.push(this.currentProduct);
      }
      this.updateTotalGoalFromProducts();
      this.selectedProductsVersion.set(this.selectedProductsVersion() + 1);
      this.closeGoalModal();
    }
  }

  private updateTotalGoalFromProducts(): void {
    const totalValue = this.selectedProducts.reduce((sum, p) => {
      const units = p.goal || 0;
      const unitPrice = this.convertValue(p.price);
      return sum + (units * unitPrice);
    }, 0);
    const formatted = `${this.currencySymbol()} ${totalValue.toLocaleString()}`;
    this.salesPlanForm.get('totalGoal')?.setValue(formatted, { emitEvent: false });
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

  // Productos con meta > 0
  plannedProducts = computed(() => this.products.filter(p => (p.goal || 0) > 0));

  // Resumen monetario total
  totalPlannedValue = computed(() => this.plannedProducts().reduce((sum, p) => sum + (this.convertValue(p.price) * (p.goal || 0)), 0));

  // Abrir confirmación antes de crear
  openConfirm() {
    if (!this.isFormValid()) return;
    this.showConfirmModal = true;
  }

  cancelConfirm() {
    this.showConfirmModal = false;
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
      const totalUnits = this.products.reduce((sum, p) => sum + (p.goal || 0), 0);
      const totalValue = this.products.reduce((sum, p) => sum + ((p.goal || 0) * this.convertValue(p.price)), 0);
      const salesPlanData = {
        region: this.salesPlanForm.get('region')?.value, // 'Norte', 'Centro', ...
        quarter: this.salesPlanForm.get('quarter')?.value, // 'Q1'..'Q4'
        year: new Date().getFullYear(),
        total_goal: totalValue, // valor monetario de la meta total
        products: this.products
          .filter(p => (p.goal || 0) > 0)
          .map(p => ({
            product_id: Number(p.id) || 0,
            individual_goal: p.goal || 0
          }))
      };
      
      console.log('Plan de venta a enviar:', salesPlanData);

      const payload: CreateSalesPlanPayload = salesPlanData;

      this.offerService.createSalesPlan(payload).subscribe({
        next: (resp) => {
          const ok = !!resp && (resp as any).success === true || typeof (resp as any)?.plan_id !== 'undefined';
          this.saveStatus.set(ok ? 'success' : 'error');
          this.showConfirmModal = false;
          // No redirigir automáticamente; permanecer en la página
        },
        error: () => {
          this.saveStatus.set('error');
          this.showConfirmModal = false;
        }
      });
    }
  }

  getErrorMessage(fieldName: string): string {
    return this.formErrors()[fieldName] || '';
  }
}
