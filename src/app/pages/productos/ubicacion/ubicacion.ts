import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeader } from '../../../shared/page-header/page-header';
import { StatusMessage } from '../../../shared/status-message/status-message';
import { CustomSelect } from '../../../shared/custom-select/custom-select';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { LocationService, City, Warehouse, Product, ProductLocation } from '../../../services/location.service';

@Component({
  selector: 'app-ubicacion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCardModule,
    MatPaginatorModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    TranslateModule,
    TranslatePipe,
    PageHeader,
    StatusMessage,
    CustomSelect
  ],
  templateUrl: './ubicacion.html',
  styleUrls: ['./ubicacion.css']
})
export class UbicacionComponent implements OnInit {
  pageTitle = 'productLocationTitle';
  
  // Datos de búsqueda
  searchQuery = '';
  
  // Filtros
  selectedCity = signal('');
  selectedWarehouse = signal('');
  
  // Opciones para los filtros
  cityOptions: any[] = [];
  warehouseOptions: any[] = [];
  
  // Resultados
  allProducts: Product[] = [];
  products: Product[] = [];
  filteredProducts: Product[] = [];
  
  // Paginación
  pageSize = 3;
  currentPage = 0;
  totalProducts = 0;
  
  // Configuración de paginación
  readonly paginationOptions = [3, 5, 10, 20, 50];
  readonly defaultPageSize = 3;
  
  // Estados
  loading = false;
  message: any = null;
  
  // Popup de ubicaciones
  showLocationPopup = false;
  selectedProduct: Product | null = null;
  
  // Panel de navegación
  viewMode: 'grid' | 'list' = 'grid';
  availabilityFilter: 'all' | 'available' | 'unavailable' = 'all';
  sortBy: 'name' | 'availability' | 'none' = 'none';
  
  constructor(private locationService: LocationService) {}
  
  ngOnInit() {
    this.initializeData();
  }

  private initializeData() {
    this.loadCities();
    this.loadAllProducts();
  }
  
  private loadCities() {
    this.loading = true;
    this.locationService.getCities().subscribe({
      next: (response) => {
        this.cityOptions = response.cities.map(city => ({
          value: city.city_id.toString(),
          labelKey: `city_${city.name.toLowerCase().replace('á', 'a').replace('í', 'i')}`,
          name: city.name
        }));
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading cities:', error);
        this.message = {
          type: 'error',
          key: 'errorLoadingCities'
        };
        this.loading = false;
      }
    });
  }

  private loadAllProducts() {
    this.loading = true;
    this.locationService.getProductsLocation().subscribe({
      next: (response) => {
        // Mapear los productos del backend al formato esperado por el frontend
        this.allProducts = response.products.map(product => this.mapProductToFrontendFormat(product));
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.message = {
          type: 'error',
          key: 'errorLoadingProducts'
        };
        this.loading = false;
      }
    });
  }

  private mapProductToFrontendFormat(product: Product): any {
    return {
      ...product,
      product_id: product.product_id,
      id: product.product_id, // Para compatibilidad con el template
      totalAvailable: product.total_quantity,
      hasAvailability: product.total_quantity > 0,
      warehouse: 1, // Por ahora hardcodeado, se puede mejorar
      city: 1, // Por ahora hardcodeado, se puede mejorar
      locations: this.generateMockLocations(product)
    };
  }

  private generateMockLocations(product: Product): ProductLocation[] {
    // Generar ubicaciones mock basadas en el producto
    // En el futuro esto vendrá del backend
    const sections = ['A', 'B', 'C'];
    const aisles = ['1', '2', '3'];
    const shelves = ['1', '2', '3'];
    const levels = ['1', '2', '3'];
    
    const section = sections[product.product_id % sections.length];
    const aisle = aisles[product.product_id % aisles.length];
    const shelf = shelves[product.product_id % shelves.length];
    const level = levels[product.product_id % levels.length];
    
    return [{
      section,
      aisle,
      shelf,
      level,
      lot: `LOT-${product.sku}-${new Date().getFullYear()}`,
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 año desde ahora
      available: product.total_quantity,
      reserved: 0
    }];
  }
  
  onCityChange() {
    this.selectedWarehouse.set('');
    this.warehouseOptions = [];
    this.products = [];
    this.filteredProducts = [];
    this.totalProducts = 0;
    
    if (this.selectedCity()) {
      this.loadWarehouses();
    }
  }
  
  private loadWarehouses() {
    const cityId = this.selectedCity();
    if (!cityId) {
      this.warehouseOptions = [];
      return;
    }

    this.loading = true;
    this.locationService.getWarehouses(parseInt(cityId)).subscribe({
      next: (response) => {
        this.warehouseOptions = response.warehouses.map(warehouse => ({
          value: warehouse.warehouse_id.toString(),
          labelKey: `warehouse_${warehouse.warehouse_id}`,
          name: warehouse.name,
          description: warehouse.description
        }));
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading warehouses:', error);
        this.message = {
          type: 'error',
          key: 'errorLoadingWarehouses'
        };
        this.loading = false;
      }
    });
  }

  onWarehouseChange() {
    const selectedWarehouse = this.selectedWarehouse();
    if (selectedWarehouse) {
      this.loadProductsByWarehouse(selectedWarehouse);
    } else {
      this.products = [];
      this.filteredProducts = [];
      this.totalProducts = 0;
    }
  }

  private loadProductsByWarehouse(warehouseId: string) {
    this.loading = true;
    this.message = null;
    
    this.locationService.getProductsByWarehouse(parseInt(warehouseId)).subscribe({
      next: (response) => {
        // Mapear los productos del backend al formato esperado por el frontend
        this.products = response.products.map(product => this.mapProductToFrontendFormat(product));
        this.filteredProducts = [...this.products];
        this.totalProducts = this.products.length;
        this.loading = false;
        
        // Mostrar mensaje si no hay productos en esta bodega
        if (this.products.length === 0) {
          this.message = {
            type: 'info',
            key: 'noProductsFound'
          };
        }
      },
      error: (error) => {
        console.error('Error loading products by warehouse:', error);
        this.message = {
          type: 'error',
          key: 'errorLoadingProducts'
        };
        this.loading = false;
      }
    });
  }
  
  onSearch() {
    if (!this.searchQuery.trim()) {
      // Si no hay término de búsqueda, mostrar todos los productos de la bodega
      this.filteredProducts = [...this.products];
      this.totalProducts = this.products.length;
      this.message = null;
      return;
    }
    
    if (!this.selectedWarehouse()) {
      this.message = {
        type: 'warning',
        key: 'warehouseRequired'
      };
      return;
    }
    
    this.searchProducts();
  }
  
  private searchProducts() {
    this.loading = true;
    this.message = null;
    
    // Simular tiempo de carga
    setTimeout(() => {
      const searchTerm = this.searchQuery.toLowerCase().trim();
      
      // Filtrar solo los productos ya cargados por bodega
      this.filteredProducts = this.products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) || 
          product.sku.toLowerCase().includes(searchTerm);
        
        return matchesSearch;
      });
      
      this.totalProducts = this.filteredProducts.length;
      this.loading = false;
      
      // Mostrar mensaje si no hay resultados
      if (this.filteredProducts.length === 0) {
        this.message = {
          type: 'info',
          key: 'noProductsFound'
        };
      }
    }, 500);
  }
  
  onViewLocations(product: any) {
    this.selectedProduct = product;
    this.showLocationPopup = true;
  }

  closeLocationPopup() {
    this.showLocationPopup = false;
    this.selectedProduct = null;
  }

  getCityName(cityId: string): string {
    const city = this.cityOptions.find(c => c.value === cityId);
    return city ? city.name : cityId;
  }

  getWarehouseName(warehouseId: string): string {
    const warehouse = this.warehouseOptions.find(w => w.value === warehouseId);
    return warehouse ? `${warehouse.name} - ${warehouse.description}` : warehouseId;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  // Métodos para el panel de navegación
  toggleViewMode() {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }

  toggleSort() {
    if (this.sortBy === 'none') {
      this.sortBy = 'name';
    } else if (this.sortBy === 'name') {
      this.sortBy = 'availability';
    } else {
      this.sortBy = 'none';
    }
    this.resetPagination();
  }

  setAvailabilityFilter(filter: 'all' | 'available' | 'unavailable') {
    this.availabilityFilter = filter;
    this.resetPagination();
  }

  getFilteredProducts() {
    let filtered = [...this.filteredProducts];
    
    // Filtrar por disponibilidad
    if (this.availabilityFilter === 'available') {
      filtered = filtered.filter(product => product.hasAvailability);
    } else if (this.availabilityFilter === 'unavailable') {
      filtered = filtered.filter(product => !product.hasAvailability);
    }
    
    // Ordenar según el criterio seleccionado
    if (this.sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
    } else if (this.sortBy === 'availability') {
      filtered.sort((a, b) => {
        if (a.hasAvailability && !b.hasAvailability) return -1;
        if (!a.hasAvailability && b.hasAvailability) return 1;
        return 0;
      });
    }
    
    // Aplicar paginación
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    
    return filtered.slice(startIndex, endIndex);
  }

  getAvailableCount() {
    return this.filteredProducts.filter(product => product.hasAvailability).length;
  }

  getUnavailableCount() {
    return this.filteredProducts.filter(product => !product.hasAvailability).length;
  }

  getTotalFilteredProducts() {
    let filtered = [...this.filteredProducts];
    
    // Aplicar los mismos filtros que en getFilteredProducts pero sin paginación
    if (this.availabilityFilter === 'available') {
      filtered = filtered.filter(product => product.hasAvailability);
    } else if (this.availabilityFilter === 'unavailable') {
      filtered = filtered.filter(product => !product.hasAvailability);
    }
    
    return filtered.length;
  }

  trackByProductId(index: number, product: Product) {
    return product.product_id;
  }

  getSortIcon() {
    switch (this.sortBy) {
      case 'name':
        return 'sort_by_alpha';
      case 'availability':
        return 'sort';
      default:
        return 'sort';
    }
  }

  getSortTooltip() {
    switch (this.sortBy) {
      case 'name':
        return 'Ordenar por disponibilidad';
      case 'availability':
        return 'Sin ordenamiento';
      default:
        return 'Ordenar por nombre';
    }
  }

  getSortLabel() {
    switch (this.sortBy) {
      case 'name':
        return 'Ordenado por nombre';
      case 'availability':
        return 'Ordenado por disponibilidad';
      default:
        return '';
    }
  }
  
  onPageChange(event: any) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  resetPagination() {
    this.currentPage = 0;
  }

  onImageError(event: any) {
    // Si la imagen falla al cargar, usar imagen por defecto
    event.target.src = '/assets/images/products/por-defecto.png';
  }
}
