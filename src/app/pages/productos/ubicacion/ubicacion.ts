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
  
  // Popup de ubicaciones
  showLocationPopup = false;
  selectedProduct: any = null;
  
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
    const baseProducts = [
      // Productos en Bogotá - BOG001 (Central)
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
        warehouse: 'bog001',
        city: 'bogota',
        locations: [
          { section: 'C', aisle: '3', shelf: '1', level: '1', lot: 'LOT004', expires: '2025-01-10', available: 200, reserved: 0 }
        ]
      },
      {
        id: 4,
        name: 'Acetaminofén 500mg',
        sku: 'ACE500',
        image: '/assets/images/products/acetaminofen.jpg',
        totalAvailable: 120,
        hasAvailability: true,
        warehouse: 'bog001',
        city: 'bogota',
        locations: [
          { section: 'A', aisle: '2', shelf: '1', level: '1', lot: 'LOT005', expires: '2024-10-15', available: 120, reserved: 0 }
        ]
      },
      {
        id: 5,
        name: 'Omeprazol 20mg',
        sku: 'OME20',
        image: '/assets/images/products/omeprazol.jpg',
        totalAvailable: 85,
        hasAvailability: true,
        warehouse: 'bog001',
        city: 'bogota',
        locations: [
          { section: 'B', aisle: '1', shelf: '3', level: '2', lot: 'LOT006', expires: '2025-02-28', available: 85, reserved: 0 }
        ]
      },
      {
        id: 6,
        name: 'Loratadina 10mg',
        sku: 'LOR10',
        image: '/assets/images/products/loratadina.jpg',
        totalAvailable: 0,
        hasAvailability: false,
        warehouse: 'bog001',
        city: 'bogota',
        locations: []
      },
      {
        id: 7,
        name: 'Vitamina C 1000mg',
        sku: 'VIT1000',
        image: '/assets/images/products/vitamina-c.jpg',
        totalAvailable: 90,
        hasAvailability: true,
        warehouse: 'bog001',
        city: 'bogota',
        locations: [
          { section: 'C', aisle: '2', shelf: '2', level: '1', lot: 'LOT007', expires: '2024-09-30', available: 90, reserved: 5 }
        ]
      },
      {
        id: 8,
        name: 'Dexametasona 4mg',
        sku: 'DEX4',
        image: '/assets/images/products/dexametasona.jpg',
        totalAvailable: 45,
        hasAvailability: true,
        warehouse: 'bog001',
        city: 'bogota',
        locations: [
          { section: 'A', aisle: '3', shelf: '2', level: '2', lot: 'LOT008', expires: '2024-12-15', available: 45, reserved: 0 }
        ]
      },
      {
        id: 9,
        name: 'Amoxicilina 500mg',
        sku: 'AMO500',
        image: '/assets/images/products/amoxicilina.jpg',
        totalAvailable: 180,
        hasAvailability: true,
        warehouse: 'bog001',
        city: 'bogota',
        locations: [
          { section: 'B', aisle: '3', shelf: '1', level: '3', lot: 'LOT009', expires: '2025-04-20', available: 180, reserved: 0 }
        ]
      },
      {
        id: 10,
        name: 'Metformina 850mg',
        sku: 'MET850',
        image: '/assets/images/products/metformina.jpg',
        totalAvailable: 95,
        hasAvailability: true,
        warehouse: 'bog001',
        city: 'bogota',
        locations: [
          { section: 'C', aisle: '1', shelf: '3', level: '2', lot: 'LOT010', expires: '2024-11-10', available: 95, reserved: 0 }
        ]
      },
      // Productos en Bogotá - BOG002 (Norte)
      {
        id: 11,
        name: 'Losartán 50mg',
        sku: 'LOS50',
        image: '/assets/images/products/losartan.jpg',
        totalAvailable: 110,
        hasAvailability: true,
        warehouse: 'bog002',
        city: 'bogota',
        locations: [
          { section: 'A', aisle: '1', shelf: '1', level: '1', lot: 'LOT011', expires: '2025-01-15', available: 110, reserved: 0 }
        ]
      },
      {
        id: 12,
        name: 'Atorvastatina 20mg',
        sku: 'ATO20',
        image: '/assets/images/products/atorvastatina.jpg',
        totalAvailable: 75,
        hasAvailability: true,
        warehouse: 'bog002',
        city: 'bogota',
        locations: [
          { section: 'B', aisle: '2', shelf: '2', level: '1', lot: 'LOT012', expires: '2024-12-05', available: 75, reserved: 0 }
        ]
      },
      {
        id: 13,
        name: 'Metoprolol 50mg',
        sku: 'MET50',
        image: '/assets/images/products/metoprolol.jpg',
        totalAvailable: 60,
        hasAvailability: true,
        warehouse: 'bog002',
        city: 'bogota',
        locations: [
          { section: 'C', aisle: '3', shelf: '1', level: '2', lot: 'LOT013', expires: '2025-03-10', available: 60, reserved: 0 }
        ]
      },
      {
        id: 14,
        name: 'Enalapril 10mg',
        sku: 'ENA10',
        image: '/assets/images/products/enalapril.jpg',
        totalAvailable: 85,
        hasAvailability: true,
        warehouse: 'bog002',
        city: 'bogota',
        locations: [
          { section: 'A', aisle: '2', shelf: '3', level: '1', lot: 'LOT014', expires: '2024-10-25', available: 85, reserved: 0 }
        ]
      },
      {
        id: 15,
        name: 'Furosemida 40mg',
        sku: 'FUR40',
        image: '/assets/images/products/furosemida.jpg',
        totalAvailable: 0,
        hasAvailability: false,
        warehouse: 'bog002',
        city: 'bogota',
        locations: []
      },
      {
        id: 16,
        name: 'Hidroclorotiazida 25mg',
        sku: 'HID25',
        image: '/assets/images/products/hidroclorotiazida.jpg',
        totalAvailable: 70,
        hasAvailability: true,
        warehouse: 'bog002',
        city: 'bogota',
        locations: [
          { section: 'B', aisle: '1', shelf: '2', level: '3', lot: 'LOT015', expires: '2025-02-15', available: 70, reserved: 0 }
        ]
      },
      {
        id: 17,
        name: 'Captopril 25mg',
        sku: 'CAP25',
        image: '/assets/images/products/captopril.jpg',
        totalAvailable: 95,
        hasAvailability: true,
        warehouse: 'bog002',
        city: 'bogota',
        locations: [
          { section: 'C', aisle: '2', shelf: '1', level: '2', lot: 'LOT016', expires: '2024-11-30', available: 95, reserved: 0 }
        ]
      },
      {
        id: 18,
        name: 'Ramipril 5mg',
        sku: 'RAM5',
        image: '/assets/images/products/ramipril.jpg',
        totalAvailable: 50,
        hasAvailability: true,
        warehouse: 'bog002',
        city: 'bogota',
        locations: [
          { section: 'A', aisle: '3', shelf: '2', level: '1', lot: 'LOT017', expires: '2025-01-20', available: 50, reserved: 0 }
        ]
      },
      {
        id: 19,
        name: 'Valsartán 80mg',
        sku: 'VAL80',
        image: '/assets/images/products/valsartan.jpg',
        totalAvailable: 80,
        hasAvailability: true,
        warehouse: 'bog002',
        city: 'bogota',
        locations: [
          { section: 'B', aisle: '3', shelf: '3', level: '2', lot: 'LOT018', expires: '2024-12-20', available: 80, reserved: 0 }
        ]
      },
      {
        id: 20,
        name: 'Amlodipino 5mg',
        sku: 'AML5',
        image: '/assets/images/products/amlodipino.jpg',
        totalAvailable: 65,
        hasAvailability: true,
        warehouse: 'bog002',
        city: 'bogota',
        locations: [
          { section: 'C', aisle: '1', shelf: '2', level: '3', lot: 'LOT019', expires: '2025-04-05', available: 65, reserved: 0 }
        ]
      },
      // Más productos para Bogotá - BOG001 (Central) - Lote 2
      {
        id: 21,
        name: 'Ciprofloxacina 500mg',
        sku: 'CIP500',
        image: '/assets/images/products/ciprofloxacina.jpg',
        totalAvailable: 130,
        hasAvailability: true,
        warehouse: 'bog001',
        city: 'bogota',
        locations: [
          { section: 'A', aisle: '4', shelf: '1', level: '1', lot: 'LOT020', expires: '2025-05-15', available: 130, reserved: 0 }
        ]
      },
      {
        id: 22,
        name: 'Azitromicina 500mg',
        sku: 'AZI500',
        image: '/assets/images/products/azitromicina.jpg',
        totalAvailable: 75,
        hasAvailability: true,
        warehouse: 'bog001',
        city: 'bogota',
        locations: [
          { section: 'B', aisle: '4', shelf: '2', level: '1', lot: 'LOT021', expires: '2024-08-20', available: 75, reserved: 0 }
        ]
      },
      {
        id: 23,
        name: 'Clindamicina 300mg',
        sku: 'CLI300',
        image: '/assets/images/products/clindamicina.jpg',
        totalAvailable: 0,
        hasAvailability: false,
        warehouse: 'bog001',
        city: 'bogota',
        locations: []
      },
      {
        id: 24,
        name: 'Doxiciclina 100mg',
        sku: 'DOX100',
        image: '/assets/images/products/doxiciclina.jpg',
        totalAvailable: 90,
        hasAvailability: true,
        warehouse: 'bog001',
        city: 'bogota',
        locations: [
          { section: 'C', aisle: '4', shelf: '3', level: '2', lot: 'LOT022', expires: '2025-06-10', available: 90, reserved: 0 }
        ]
      },
      {
        id: 25,
        name: 'Ceftriaxona 1g',
        sku: 'CEF1G',
        image: '/assets/images/products/ceftriaxona.jpg',
        totalAvailable: 55,
        hasAvailability: true,
        warehouse: 'bog001',
        city: 'bogota',
        locations: [
          { section: 'A', aisle: '5', shelf: '1', level: '3', lot: 'LOT023', expires: '2024-07-25', available: 55, reserved: 0 }
        ]
      },
      {
        id: 26,
        name: 'Vancomicina 500mg',
        sku: 'VAN500',
        image: '/assets/images/products/vancomicina.jpg',
        totalAvailable: 40,
        hasAvailability: true,
        warehouse: 'bog001',
        city: 'bogota',
        locations: [
          { section: 'B', aisle: '5', shelf: '2', level: '1', lot: 'LOT024', expires: '2025-08-30', available: 40, reserved: 0 }
        ]
      },
      {
        id: 27,
        name: 'Gentamicina 80mg',
        sku: 'GEN80',
        image: '/assets/images/products/gentamicina.jpg',
        totalAvailable: 65,
        hasAvailability: true,
        warehouse: 'bog001',
        city: 'bogota',
        locations: [
          { section: 'C', aisle: '5', shelf: '3', level: '2', lot: 'LOT025', expires: '2024-09-15', available: 65, reserved: 0 }
        ]
      },
      {
        id: 28,
        name: 'Levofloxacina 500mg',
        sku: 'LEV500',
        image: '/assets/images/products/levofloxacina.jpg',
        totalAvailable: 85,
        hasAvailability: true,
        warehouse: 'bog001',
        city: 'bogota',
        locations: [
          { section: 'A', aisle: '6', shelf: '1', level: '1', lot: 'LOT026', expires: '2025-07-20', available: 85, reserved: 0 }
        ]
      },
      {
        id: 29,
        name: 'Meropenem 1g',
        sku: 'MER1G',
        image: '/assets/images/products/meropenem.jpg',
        totalAvailable: 30,
        hasAvailability: true,
        warehouse: 'bog001',
        city: 'bogota',
        locations: [
          { section: 'B', aisle: '6', shelf: '2', level: '3', lot: 'LOT027', expires: '2024-06-30', available: 30, reserved: 0 }
        ]
      },
      {
        id: 30,
        name: 'Imipenem 500mg',
        sku: 'IMI500',
        image: '/assets/images/products/imipenem.jpg',
        totalAvailable: 25,
        hasAvailability: true,
        warehouse: 'bog001',
        city: 'bogota',
        locations: [
          { section: 'C', aisle: '6', shelf: '3', level: '1', lot: 'LOT028', expires: '2025-09-05', available: 25, reserved: 0 }
        ]
      },
      // Más productos para Bogotá - BOG002 (Norte) - Lote 2
      {
        id: 31,
        name: 'Digoxina 0.25mg',
        sku: 'DIG025',
        image: '/assets/images/products/digoxina.jpg',
        totalAvailable: 100,
        hasAvailability: true,
        warehouse: 'bog002',
        city: 'bogota',
        locations: [
          { section: 'A', aisle: '4', shelf: '1', level: '2', lot: 'LOT029', expires: '2025-10-12', available: 100, reserved: 0 }
        ]
      },
      {
        id: 32,
        name: 'Warfarina 5mg',
        sku: 'WAR5',
        image: '/assets/images/products/warfarina.jpg',
        totalAvailable: 80,
        hasAvailability: true,
        warehouse: 'bog002',
        city: 'bogota',
        locations: [
          { section: 'B', aisle: '4', shelf: '2', level: '1', lot: 'LOT030', expires: '2024-11-08', available: 80, reserved: 0 }
        ]
      },
      {
        id: 33,
        name: 'Heparina 5000UI',
        sku: 'HEP5000',
        image: '/assets/images/products/heparina.jpg',
        totalAvailable: 0,
        hasAvailability: false,
        warehouse: 'bog002',
        city: 'bogota',
        locations: []
      },
      {
        id: 34,
        name: 'Enoxaparina 40mg',
        sku: 'ENO40',
        image: '/assets/images/products/enoxaparina.jpg',
        totalAvailable: 60,
        hasAvailability: true,
        warehouse: 'bog002',
        city: 'bogota',
        locations: [
          { section: 'C', aisle: '4', shelf: '3', level: '2', lot: 'LOT031', expires: '2025-11-25', available: 60, reserved: 0 }
        ]
      },
      {
        id: 35,
        name: 'Clopidogrel 75mg',
        sku: 'CLO75',
        image: '/assets/images/products/clopidogrel.jpg',
        totalAvailable: 95,
        hasAvailability: true,
        warehouse: 'bog002',
        city: 'bogota',
        locations: [
          { section: 'A', aisle: '5', shelf: '1', level: '3', lot: 'LOT032', expires: '2024-12-18', available: 95, reserved: 0 }
        ]
      },
      {
        id: 36,
        name: 'Aspirina 100mg',
        sku: 'ASP100B',
        image: '/assets/images/products/aspirina.jpg',
        totalAvailable: 200,
        hasAvailability: true,
        warehouse: 'bog002',
        city: 'bogota',
        locations: [
          { section: 'B', aisle: '5', shelf: '2', level: '1', lot: 'LOT033', expires: '2025-01-10', available: 200, reserved: 0 }
        ]
      },
      {
        id: 37,
        name: 'Diltiazem 60mg',
        sku: 'DIL60',
        image: '/assets/images/products/diltiazem.jpg',
        totalAvailable: 70,
        hasAvailability: true,
        warehouse: 'bog002',
        city: 'bogota',
        locations: [
          { section: 'C', aisle: '5', shelf: '3', level: '2', lot: 'LOT034', expires: '2025-02-28', available: 70, reserved: 0 }
        ]
      },
      {
        id: 38,
        name: 'Verapamilo 80mg',
        sku: 'VER80',
        image: '/assets/images/products/verapamilo.jpg',
        totalAvailable: 55,
        hasAvailability: true,
        warehouse: 'bog002',
        city: 'bogota',
        locations: [
          { section: 'A', aisle: '6', shelf: '1', level: '1', lot: 'LOT035', expires: '2024-10-05', available: 55, reserved: 0 }
        ]
      },
      {
        id: 39,
        name: 'Nifedipino 20mg',
        sku: 'NIF20',
        image: '/assets/images/products/nifedipino.jpg',
        totalAvailable: 45,
        hasAvailability: true,
        warehouse: 'bog002',
        city: 'bogota',
        locations: [
          { section: 'B', aisle: '6', shelf: '2', level: '3', lot: 'LOT036', expires: '2025-03-15', available: 45, reserved: 0 }
        ]
      },
      {
        id: 40,
        name: 'Diltiazem 120mg',
        sku: 'DIL120',
        image: '/assets/images/products/diltiazem.jpg',
        totalAvailable: 35,
        hasAvailability: true,
        warehouse: 'bog002',
        city: 'bogota',
        locations: [
          { section: 'C', aisle: '6', shelf: '3', level: '1', lot: 'LOT037', expires: '2024-11-20', available: 35, reserved: 0 }
        ]
      },
      // Productos en Medellín
      {
        id: 41,
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

    // Generar más productos para Bogotá para tener más de 100
    const additionalProducts = this.generateAdditionalProducts();
    this.allProducts = [...baseProducts, ...additionalProducts];
  }

  private generateAdditionalProducts() {
    const products = [];
    const bogotaWarehouses = ['bog001', 'bog002'];
    const sections = ['A', 'B', 'C', 'D', 'E'];
    const aisles = ['1', '2', '3', '4', '5', '6', '7', '8'];
    const shelves = ['1', '2', '3', '4', '5'];
    const levels = ['1', '2', '3', '4', '5'];
    
    const medicineNames = [
      'Acetaminofén', 'Ibuprofeno', 'Aspirina', 'Omeprazol', 'Loratadina',
      'Vitamina C', 'Dexametasona', 'Amoxicilina', 'Metformina', 'Losartán',
      'Atorvastatina', 'Metoprolol', 'Enalapril', 'Furosemida', 'Hidroclorotiazida',
      'Captopril', 'Ramipril', 'Valsartán', 'Amlodipino', 'Ciprofloxacina',
      'Azitromicina', 'Clindamicina', 'Doxiciclina', 'Ceftriaxona', 'Vancomicina',
      'Gentamicina', 'Levofloxacina', 'Meropenem', 'Imipenem', 'Digoxina',
      'Warfarina', 'Heparina', 'Enoxaparina', 'Clopidogrel', 'Diltiazem',
      'Verapamilo', 'Nifedipino', 'Diazepam', 'Lorazepam', 'Clonazepam',
      'Fluoxetina', 'Sertralina', 'Paroxetina', 'Escitalopram', 'Venlafaxina',
      'Trazodona', 'Mirtazapina', 'Bupropión', 'Quetiapina', 'Risperidona',
      'Olanzapina', 'Aripiprazol', 'Haloperidol', 'Clorpromazina', 'Tioridazina',
      'Metoclopramida', 'Ondansetrón', 'Granisetrón', 'Domperidona', 'Proclorperazina',
      'Ranitidina', 'Famotidina', 'Cimetidina', 'Nizatidina', 'Lansoprazol',
      'Pantoprazol', 'Rabeprazol', 'Esomeprazol', 'Sucralfato', 'Misoprostol',
      'Prednisolona', 'Hidrocortisona', 'Betametasona', 'Triamcinolona', 'Fluticasona',
      'Budesonida', 'Mometasona', 'Clobetasol', 'Fluocinonida', 'Hidroquinona',
      'Tretinoína', 'Adapaleno', 'Benzoyl Peroxide', 'Clindamicina Tópica', 'Eritromicina Tópica',
      'Mupirocina', 'Neomicina', 'Polimixina B', 'Bacitracina', 'Nistatina',
      'Clotrimazol', 'Miconazol', 'Ketoconazol', 'Fluconazol', 'Itraconazol',
      'Voriconazol', 'Posaconazol', 'Anfotericina B', 'Caspofungina', 'Micafungina',
      'Acyclovir', 'Valacyclovir', 'Famciclovir', 'Ganciclovir', 'Valganciclovir',
      'Foscarnet', 'Cidofovir', 'Ribavirin', 'Interferón', 'Peginterferón'
    ];

    const dosages = ['100mg', '200mg', '250mg', '300mg', '400mg', '500mg', '600mg', '750mg', '1000mg'];
    const forms = ['Tabletas', 'Cápsulas', 'Jarabe', 'Inyección', 'Crema', 'Ungüento', 'Gotas', 'Supositorios'];

    for (let i = 0; i < 80; i++) {
      const medicineName = medicineNames[Math.floor(Math.random() * medicineNames.length)];
      const dosage = dosages[Math.floor(Math.random() * dosages.length)];
      const form = forms[Math.floor(Math.random() * forms.length)];
      const warehouse = bogotaWarehouses[Math.floor(Math.random() * bogotaWarehouses.length)];
      
      const product = {
        id: 100 + i,
        name: `${medicineName} ${dosage} ${form}`,
        sku: `${medicineName.substring(0, 3).toUpperCase()}${dosage.replace('mg', '')}${i.toString().padStart(3, '0')}`,
        image: '/assets/images/products/default.jpg',
        totalAvailable: Math.floor(Math.random() * 200) + 10,
        hasAvailability: Math.random() > 0.1, // 90% con disponibilidad
        warehouse: warehouse,
        city: 'bogota',
        locations: Math.random() > 0.1 ? [{
          section: sections[Math.floor(Math.random() * sections.length)],
          aisle: aisles[Math.floor(Math.random() * aisles.length)],
          shelf: shelves[Math.floor(Math.random() * shelves.length)],
          level: levels[Math.floor(Math.random() * levels.length)],
          lot: `LOT${(100 + i).toString().padStart(3, '0')}`,
          expires: new Date(2024 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
          available: Math.floor(Math.random() * 100) + 10,
          reserved: Math.floor(Math.random() * 20)
        }] : []
      };
      
      products.push(product);
    }

    return products;
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
    this.selectedProduct = product;
    this.showLocationPopup = true;
  }

  closeLocationPopup() {
    this.showLocationPopup = false;
    this.selectedProduct = null;
  }

  getCityName(cityCode: string): string {
    const cityMap: { [key: string]: string } = {
      'bogota': 'Bogotá',
      'medellin': 'Medellín',
      'cali': 'Cali',
      'barranquilla': 'Barranquilla'
    };
    return cityMap[cityCode] || cityCode;
  }

  getWarehouseName(warehouseCode: string): string {
    const warehouseMap: { [key: string]: string } = {
      'bog001': 'BOG001 - Bodega Central',
      'bog002': 'BOG002 - Bodega Norte',
      'med001': 'MED001 - Bodega Medellín',
      'cal001': 'CAL001 - Bodega Cali',
      'bar001': 'BAR001 - Bodega Barranquilla'
    };
    return warehouseMap[warehouseCode] || warehouseCode;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
  
  onPageChange(event: any) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    // TODO: Implementar lógica de paginación
  }
}
