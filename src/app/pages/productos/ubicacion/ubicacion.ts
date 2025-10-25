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
  allProducts: any[] = [];
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
    this.loadAllProducts();
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

  private loadAllProducts() {
    // Cargar todos los productos con sus ubicaciones en diferentes bodegas
    this.allProducts = [
      // Productos en Bogotá
      {
        id: 1,
        name: 'Paracetamol 500mg',
        sku: 'PAR500',
        image: '/assets/images/products/paracetamol.jpg',
        totalAvailable: 150,
        hasAvailability: true,
        warehouse: 'bog001',
        city: 'bogota',
        locations: [
          { section: 'A', aisle: '1', shelf: '2', level: '3', lot: 'LOT001', expires: '2024-12-31', available: 100, reserved: 0 },
          { section: 'A', aisle: '1', shelf: '2', level: '4', lot: 'LOT002', expires: '2025-03-15', available: 50, reserved: 10 }
        ]
      },
      {
        id: 2,
        name: 'Ibuprofeno 400mg',
        sku: 'IBU400',
        image: '/assets/images/products/ibuprofeno.jpg',
        totalAvailable: 75,
        hasAvailability: true,
        warehouse: 'bog001',
        city: 'bogota',
        locations: [
          { section: 'B', aisle: '2', shelf: '1', level: '2', lot: 'LOT003', expires: '2024-11-20', available: 75, reserved: 5 }
        ]
      },
      {
        id: 3,
        name: 'Aspirina 100mg',
        sku: 'ASP100',
        image: '/assets/images/products/aspirina.jpg',
        totalAvailable: 200,
        hasAvailability: true,
        warehouse: 'bog002',
        city: 'bogota',
        locations: [
          { section: 'C', aisle: '3', shelf: '1', level: '1', lot: 'LOT004', expires: '2025-01-10', available: 200, reserved: 0 }
        ]
      },
      // Productos en Medellín
      {
        id: 4,
        name: 'Omeprazol 20mg',
        sku: 'OME20',
        image: '/assets/images/products/omeprazol.jpg',
        totalAvailable: 120,
        hasAvailability: true,
        warehouse: 'med001',
        city: 'medellin',
        locations: [
          { section: 'A', aisle: '1', shelf: '3', level: '2', lot: 'LOT005', expires: '2024-10-15', available: 120, reserved: 15 }
        ]
      },
      {
        id: 5,
        name: 'Loratadina 10mg',
        sku: 'LOR10',
        image: '/assets/images/products/loratadina.jpg',
        totalAvailable: 0,
        hasAvailability: false,
        warehouse: 'med001',
        city: 'medellin',
        locations: []
      },
      // Productos en Cali
      {
        id: 6,
        name: 'Acetaminofén 500mg',
        sku: 'ACE500',
        image: '/assets/images/products/acetaminofen.jpg',
        totalAvailable: 80,
        hasAvailability: true,
        warehouse: 'cal001',
        city: 'cali',
        locations: [
          { section: 'B', aisle: '2', shelf: '2', level: '3', lot: 'LOT006', expires: '2025-02-28', available: 80, reserved: 0 }
        ]
      },
      // Productos en Barranquilla
      {
        id: 7,
        name: 'Vitamina C 1000mg',
        sku: 'VIT1000',
        image: '/assets/images/products/vitamina-c.jpg',
        totalAvailable: 90,
        hasAvailability: true,
        warehouse: 'bar001',
        city: 'barranquilla',
        locations: [
          { section: 'A', aisle: '1', shelf: '1', level: '1', lot: 'LOT007', expires: '2024-09-30', available: 90, reserved: 5 }
        ]
      },
      {
        id: 8,
        name: 'Dexametasona 4mg',
        sku: 'DEX4',
        image: '/assets/images/products/dexametasona.jpg',
        totalAvailable: 45,
        hasAvailability: true,
        warehouse: 'bar001',
        city: 'barranquilla',
        locations: [
          { section: 'C', aisle: '3', shelf: '2', level: '2', lot: 'LOT008', expires: '2024-12-15', available: 45, reserved: 0 }
        ]
      }
    ];
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

  private loadProductsByWarehouse(warehouse: string) {
    this.loading = true;
    this.message = null;
    
    // Simular tiempo de carga
    setTimeout(() => {
      // Filtrar productos por bodega
      this.products = this.allProducts.filter(product => product.warehouse === warehouse);
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
    }, 600);
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
    // TODO: Implementar apertura del pop-up de ubicaciones
    console.log('Ver ubicaciones para:', product);
  }
  
  onPageChange(event: any) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    // TODO: Implementar lógica de paginación
  }
}
