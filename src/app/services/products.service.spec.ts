import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductsService, Product, ProductsResponse } from './products.service';
import { environment } from '../../environments/environment';

describe('ProductsService', () => {
  let service: ProductsService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.baseUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductsService]
    });
    service = TestBed.inject(ProductsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAvailableProducts', () => {
    it('should return products when backend returns array', (done) => {
      const mockProducts: any[] = [
        {
          product_id: 1,
          sku: 'MED-001',
          name: 'Producto 1',
          value: 1000,
          category_name: 'Medicamentos',
          total_quantity: 50
        },
        {
          product_id: 2,
          sku: 'MED-002',
          name: 'Producto 2',
          value: 2000,
          category_name: 'Equipos',
          total_quantity: 30
        }
      ];

      service.getAvailableProducts(1).subscribe({
        next: (response: ProductsResponse) => {
          expect(response.success).toBe(true);
          expect(response.products.length).toBe(2);
          expect(response.products[0].sku).toBe('MED-001');
          expect(response.total).toBe(2);
          done();
        },
        error: (error) => {
          fail('Should not have failed: ' + JSON.stringify(error));
        }
      });

      const req = httpMock.expectOne(`${baseUrl}products/location/warehouses`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProducts);
    });

    it('should transform object with products array', (done) => {
      const mockResponse = {
        products: [
          {
            product_id: 1,
            sku: 'MED-001',
            name: 'Producto 1',
            value: 1000,
            category_name: 'Medicamentos',
            quantity: 50
          }
        ],
        success: true
      };

      service.getAvailableProducts(1).subscribe({
        next: (response: ProductsResponse) => {
          expect(response.success).toBe(true);
          expect(response.products.length).toBe(1);
          expect(response.products[0].total_quantity).toBe(50);
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}products/location/warehouses`);
      req.flush(mockResponse);
    });

    it('should handle empty array response', (done) => {
      service.getAvailableProducts(1).subscribe({
        next: (response: ProductsResponse) => {
          expect(response.success).toBe(true);
          expect(response.products.length).toBe(0);
          expect(response.total).toBe(0);
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}products/location/warehouses`);
      req.flush([]);
    });

    it('should handle error response', (done) => {
      service.getAvailableProducts(1).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}products/location/warehouses`);
      req.error(new ErrorEvent('Network error'));
    });

    it('should handle unsupported response format', (done) => {
      service.getAvailableProducts(1).subscribe({
        next: (response: ProductsResponse) => {
          expect(response.success).toBe(false);
          expect(response.products.length).toBe(0);
          expect(response.message).toBe('Formato de respuesta no soportado');
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}products/location/warehouses`);
      req.flush({ invalid: 'format' });
    });
  });

  describe('getProductsByWarehouse', () => {
    it('should return products grouped by SKU', (done) => {
      const mockResponse = {
        products: [
          {
            product_id: 1,
            sku: 'MED-001',
            name: 'Producto 1',
            value: 1000,
            category_name: 'Medicamentos',
            quantity: 20
          },
          {
            product_id: 1,
            sku: 'MED-001',
            name: 'Producto 1',
            value: 1000,
            category_name: 'Medicamentos',
            quantity: 30
          }
        ],
        success: true
      };

      service.getProductsByWarehouse(1).subscribe({
        next: (response: ProductsResponse) => {
          expect(response.success).toBe(true);
          expect(response.products.length).toBe(1);
          expect(response.products[0].sku).toBe('MED-001');
          expect(response.products[0].total_quantity).toBe(50); // 20 + 30
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}products/by-warehouse/1`);
      req.flush(mockResponse);
    });

    it('should handle error when getting products by warehouse', (done) => {
      service.getProductsByWarehouse(1).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}products/by-warehouse/1`);
      req.error(new ErrorEvent('Network error'));
    });

    it('should return empty array when no products found', (done) => {
      const mockResponse = {
        products: [],
        success: false
      };

      service.getProductsByWarehouse(1).subscribe({
        next: (response: ProductsResponse) => {
          expect(response.products.length).toBe(0);
          expect(response.success).toBe(false);
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}products/by-warehouse/1`);
      req.flush(mockResponse);
    });
  });

  describe('getProductsWithoutStock', () => {
    it('should return products without stock', (done) => {
      const mockResponse = {
        products_without_stock: [
          {
            product_id: 1,
            sku: 'MED-001',
            name: 'Producto 1',
            value: 1000,
            category_name: 'Medicamentos'
          }
        ],
        success: true
      };

      service.getProductsWithoutStock().subscribe({
        next: (response: ProductsResponse) => {
          expect(response.success).toBe(true);
          expect(response.products.length).toBe(1);
          expect(response.products[0].total_quantity).toBe(0);
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}products/without-stock`);
      req.flush(mockResponse);
    });

    it('should handle error when getting products without stock', (done) => {
      service.getProductsWithoutStock().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}products/without-stock`);
      req.error(new ErrorEvent('Network error'));
    });
  });

  describe('getProductById', () => {
    it('should return a product by id', (done) => {
      const mockProduct: Product = {
        product_id: 1,
        sku: 'MED-001',
        name: 'Producto 1',
        value: 1000,
        category_name: 'Medicamentos',
        total_quantity: 50
      };

      service.getProductById('1').subscribe({
        next: (product: Product) => {
          expect(product.product_id).toBe(1);
          expect(product.sku).toBe('MED-001');
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}products/1`);
      req.flush(mockProduct);
    });

    it('should handle error when getting product by id', (done) => {
      service.getProductById('999').subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}products/999`);
      req.error(new ErrorEvent('Not found'), { status: 404 });
    });
  });

  describe('createProduct', () => {
    it('should create a new product', (done) => {
      const newProduct = {
        sku: 'MED-003',
        name: 'Producto 3',
        value: 3000,
        category_name: 'Suministros',
        total_quantity: 100
      } as any;

      const createdProduct: Product = {
        product_id: 3,
        ...newProduct
      };

      service.createProduct(newProduct as any).subscribe({
        next: (product: Product) => {
          expect(product.product_id).toBe(3);
          expect(product.sku).toBe('MED-003');
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}products`);
      expect(req.request.method).toBe('POST');
      req.flush(createdProduct);
    });

    it('should handle error when creating product', (done) => {
      const newProduct = {
        sku: 'MED-003',
        name: 'Producto 3',
        value: 3000,
        category_name: 'Suministros',
        total_quantity: 100
      } as any;

      service.createProduct(newProduct as any).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}products`);
      req.error(new ErrorEvent('Bad request'), { status: 400 });
    });
  });

  describe('updateProduct', () => {
    it('should update an existing product', (done) => {
      const updatedData = {
        name: 'Producto Actualizado',
        value: 1500
      };

      const updatedProduct: Product = {
        product_id: 1,
        sku: 'MED-001',
        name: 'Producto Actualizado',
        value: 1500,
        category_name: 'Medicamentos',
        total_quantity: 50
      };

      service.updateProduct('1', updatedData).subscribe({
        next: (product: Product) => {
          expect(product.name).toBe('Producto Actualizado');
          expect(product.value).toBe(1500);
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}products/1`);
      expect(req.request.method).toBe('PUT');
      req.flush(updatedProduct);
    });

    it('should handle error when updating product', (done) => {
      service.updateProduct('999', { name: 'Test' }).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}products/999`);
      req.error(new ErrorEvent('Not found'), { status: 404 });
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product', (done) => {
      const mockResponse = {
        success: true,
        message: 'Producto eliminado exitosamente'
      };

      service.deleteProduct('1').subscribe({
        next: (response) => {
          expect(response.success).toBe(true);
          expect(response.message).toBe('Producto eliminado exitosamente');
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}products/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });

    it('should handle error when deleting product', (done) => {
      service.deleteProduct('999').subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}products/999`);
      req.error(new ErrorEvent('Not found'), { status: 404 });
    });
  });

  describe('toggleProductStatus', () => {
    it('should toggle product status to active', (done) => {
      const updatedProduct: Product = {
        product_id: 1,
        sku: 'MED-001',
        name: 'Producto 1',
        value: 1000,
        category_name: 'Medicamentos',
        total_quantity: 50
      };

      service.toggleProductStatus('1', 'activo').subscribe({
        next: (product: Product) => {
          expect(product.product_id).toBe(1);
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}products/1/status`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ estado: 'activo' });
      req.flush(updatedProduct);
    });

    it('should toggle product status to inactive', (done) => {
      const updatedProduct: Product = {
        product_id: 1,
        sku: 'MED-001',
        name: 'Producto 1',
        value: 1000,
        category_name: 'Medicamentos',
        total_quantity: 50
      };

      service.toggleProductStatus('1', 'inactivo').subscribe({
        next: (product: Product) => {
          expect(product.product_id).toBe(1);
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}products/1/status`);
      expect(req.request.body).toEqual({ estado: 'inactivo' });
      req.flush(updatedProduct);
    });

    it('should handle error when toggling product status', (done) => {
      service.toggleProductStatus('999', 'activo').subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}products/999/status`);
      req.error(new ErrorEvent('Not found'), { status: 404 });
    });
  });
});

