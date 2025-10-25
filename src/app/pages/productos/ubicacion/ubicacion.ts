import { Component, signal } from '@angular/core';
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
export class UbicacionComponent {
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
  products: any[] = [];
  filteredProducts: any[] = [];
  
  // Paginación
  pageSize = 20;
  currentPage = 0;
  totalProducts = 0;
  
  // Estados
  loading = false;
  message: any = null;
  
  constructor() {
    this.initializeData();
  }
  
  private initializeData() {
    this.loadCities();
  }
  
  private loadCities() {
    // Precargar todas las ciudades disponibles
    this.cityOptions = [
      { value: 'bogota', labelKey: 'city_bogota' },
      { value: 'medellin', labelKey: 'city_medellin' },
      { value: 'cali', labelKey: 'city_cali' },
      { value: 'barranquilla', labelKey: 'city_barranquilla' }
    ];
  }
  
  onCityChange() {
    this.selectedWarehouse.set('');
    this.warehouseOptions = [];
    
    if (this.selectedCity()) {
      this.loadWarehouses();
    }
  }
  
  private loadWarehouses() {
    // Cargar bodegas según la ciudad seleccionada
    const city = this.selectedCity();
    
    switch (city) {
      case 'bogota':
        this.warehouseOptions = [
          { value: 'bog001', labelKey: 'warehouse_bog001' },
          { value: 'bog002', labelKey: 'warehouse_bog002' }
        ];
        break;
      case 'medellin':
        this.warehouseOptions = [
          { value: 'med001', labelKey: 'warehouse_med001' }
        ];
        break;
      case 'cali':
        this.warehouseOptions = [
          { value: 'cal001', labelKey: 'warehouse_cal001' }
        ];
        break;
      case 'barranquilla':
        this.warehouseOptions = [
          { value: 'bar001', labelKey: 'warehouse_bar001' }
        ];
        break;
      default:
        this.warehouseOptions = [];
    }
  }
  
  onSearch() {
    if (!this.searchQuery.trim()) {
      this.message = {
        type: 'warning',
        key: 'searchQueryRequired'
      };
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
    
    // TODO: Implementar búsqueda real de productos
    setTimeout(() => {
      this.products = [
        {
          id: 1,
          name: 'Paracetamol 500mg',
          sku: 'PAR500',
          image: '/assets/images/products/paracetamol.jpg',
          totalAvailable: 150,
          hasAvailability: true
        },
        {
          id: 2,
          name: 'Ibuprofeno 400mg',
          sku: 'IBU400',
          image: '/assets/images/products/ibuprofeno.jpg',
          totalAvailable: 0,
          hasAvailability: false
        }
      ];
      
      this.filteredProducts = [...this.products];
      this.totalProducts = this.products.length;
      this.loading = false;
    }, 1000);
  }
  
  onViewLocations(product: any) {
    // TODO: Implementar apertura del pop-up de ubicaciones
    console.log('Ver ubicaciones para:', product);
  }
  
  onPageChange(event: any) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    // TODO: Implementar lógica de paginación
  }
}
