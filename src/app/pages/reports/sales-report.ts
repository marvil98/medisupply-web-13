import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeader } from '../../shared/page-header/page-header';
import { CustomSelect } from '../../shared/custom-select/custom-select';
import { MatButtonModule } from '@angular/material/button';
import { StatusMessage } from '../../shared/status-message/status-message';
import { TranslatePipe } from '../../shared/pipes/translate.pipe'; 
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { SalesReportService, SalesReportRequest } from '../../services/sales-report.service';

@Component({
  selector: 'app-sales-report',
  standalone: true,
  imports: [CommonModule, PageHeader, CustomSelect, MatButtonModule, TranslatePipe, StatusMessage, NgxChartsModule],
  templateUrl: './sales-report.html',
  styleUrls: ['./sales-report.css'],
})
export class SalesReport {
  pageTitle = 'generateSalesReport';
  vendedor = signal<string>('');
  periodo = signal<string>('');
  showMessage = signal(false);
  messageType = signal<'success' | 'error'>('success');
  messageText = signal('');
  reportData = signal<any | null>(null);

  constructor(private salesReportService: SalesReportService) {
    console.log('🏗️ SalesReport: Componente instanciado con servicio');
  }

  // Función simple para convertir valores según el país
  private convertValue(value: number): number {
    const country = localStorage.getItem('userCountry') || 'CO';
    const rates: Record<string, number> = { 'CO': 4100, 'PE': 3.7, 'EC': 1, 'MX': 17.5 };
    return Math.round(value * (rates[country] || 1));
  }

  // Computed signal para obtener el símbolo de moneda según el país
  currencySymbol = computed(() => {
    const country = localStorage.getItem('userCountry') || 'CO';
    const symbols: Record<string, string> = { 'CO': 'COP', 'PE': 'PEN', 'EC': 'USD', 'MX': 'MXN' };
    return symbols[country] || 'USD';
  });

  vendedores = [
    { value: 'v1', labelKey: 'salesReportVendor1' },
    { value: 'v2', labelKey: 'salesReportVendor2' },
    { value: 'v3', labelKey: 'salesReportVendor3' },
    { value: 'v4', labelKey: 'salesReportVendor4' },
    { value: 'v5', labelKey: 'salesReportVendor5' },
  ];

  periodos = [
    { value: 'bimestral', labelKey: 'salesReportPeriodBimestral' },
    { value: 'trimestral', labelKey: 'salesReportPeriodTrimestral' },
    { value: 'semestral', labelKey: 'salesReportPeriodSemestral' },
    { value: 'anual', labelKey: 'salesReportPeriodAnual' },
  ];

  get isButtonDisabled() {
    return !this.vendedor() || !this.periodo();
  }

  // Limpiar estado cuando cambian los selectores
  onSelectionChange() {
    this.showMessage.set(false);
    this.reportData.set(null);
  }

  
  getChartData() {
    const data = this.reportData();
    if (!data || !data.grafico) return [];
  
    return [
      {
        name: 'Ventas',
        series: data.grafico.map((valor: number, index: number) => ({
          name: `T${index + 1}`,
          value: valor,
        })),
      },
    ];
  }
  

  generarReporte() {
    // Limpiar mensaje anterior y datos
    this.showMessage.set(false);
    this.reportData.set(null);
    
    // Preparar datos de la petición
    const request: SalesReportRequest = {
      vendor_id: this.vendedor(),
      period: this.periodo(),
      start_date: this.getStartDate(),
      end_date: this.getEndDate()
    };

    console.log('🚀 SalesReport: Iniciando consulta al backend');
    console.log('📊 SalesReport: Datos de la petición:', request);

    // Realizar petición al backend
    this.salesReportService.getSalesReport(request).subscribe({
      next: (response) => {
        console.log('✅ SalesReport: Respuesta completa del backend:', response);
        
        // Extraer los datos del response (el backend devuelve {data: {...}, success: true})
        const rawData = response.data || response;
        console.log('📊 SalesReport: Datos extraídos:', rawData);
        
        if (!rawData || !rawData.productos || !rawData.grafico) {
          console.error('❌ SalesReport: Estructura de datos inválida:', rawData);
          this.messageType.set('error');
          this.messageText.set('salesReportError');
          this.showMessage.set(true);
          this.reportData.set(null);
          return;
        }
        
        // Convertir valores según el país actual
        const convertedData = {
          ...rawData,
          ventasTotales: this.convertValue(rawData.ventasTotales),
          productos: rawData.productos.map(producto => ({
            ...producto,
            ventas: this.convertValue(producto.ventas)
          })),
          grafico: rawData.grafico.map(value => this.convertValue(value))
        };

        console.log('🌍 País actual:', localStorage.getItem('userCountry') || 'CO');
        console.log('💰 Datos originales:', rawData);
        console.log('📦 Productos originales:', rawData.productos);
        console.log('📦 Número de productos:', rawData.productos?.length);
        console.log('📦 Detalle de productos originales:', rawData.productos?.map(p => ({ nombre: p.nombre, ventas: p.ventas })));
        console.log('🔄 Datos convertidos:', convertedData);
        console.log('📦 Productos convertidos:', convertedData.productos);
        console.log('📦 Número de productos convertidos:', convertedData.productos?.length);
    
        this.messageType.set('success');
        this.messageText.set('salesReportSuccess');
        this.showMessage.set(true);
        this.reportData.set(convertedData);
      },
      error: (error) => {
        console.error('❌ SalesReport: Error en la consulta:', error);
        
        // Mensaje específico para cuando no hay datos (404)
        if (error.status === 404) {
          this.messageType.set('error');
          this.messageText.set('salesReportNoDataForParams');
        } else {
          this.messageType.set('error');
          this.messageText.set('salesReportError');
        }
        
        this.showMessage.set(true);
        this.reportData.set(null);
      }
    });
  }

  // Función trackBy para evitar duplicados en el template
  trackByProduct(index: number, producto: any): string {
    return `${producto.nombre}-${producto.ventas}`;
  }

  // Métodos auxiliares para generar fechas
  private getStartDate(): string {
    const period = this.periodo();
    const currentDate = new Date();
    
    switch (period) {
      case 'bimestral':
        currentDate.setMonth(currentDate.getMonth() - 2);
        break;
      case 'trimestral':
        currentDate.setMonth(currentDate.getMonth() - 3);
        break;
      case 'semestral':
        currentDate.setMonth(currentDate.getMonth() - 6);
        break;
      case 'anual':
        currentDate.setFullYear(currentDate.getFullYear() - 1);
        break;
    }
    
    return currentDate.toISOString().split('T')[0];
  }

  private getEndDate(): string {
    return new Date().toISOString().split('T')[0];
  }
  
}
