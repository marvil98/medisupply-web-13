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
    
    // Tasas de conversión actualizadas (octubre 2024)
    // El backend devuelve valores en pesos colombianos (COP)
    const rates: Record<string, number> = { 
      'CO': 1,           // Colombia - Sin conversión (ya está en pesos)
      'PE': 0.0014,      // Perú - COP a PEN (1 COP ≈ 0.0014 PEN)
      'EC': 0.00026,     // Ecuador - COP a USD (1 COP ≈ 0.00026 USD)
      'MX': 0.0047       // México - COP a MXN (1 COP ≈ 0.0047 MXN)
    };
    
    const rate = rates[country] || 1;
    const convertedValue = Math.round(value * rate);
    
    console.log('💰 SalesReport: Conversión de valor:', {
      valorOriginal: value,
      pais: country,
      monedaOriginal: 'COP (Peso Colombiano)',
      monedaDestino: this.getCurrencyName(country),
      tasa: rate,
      valorConvertido: convertedValue
    });
    
    return convertedValue;
  }

  // Función auxiliar para obtener el nombre de la moneda
  private getCurrencyName(country: string): string {
    const currencies: Record<string, string> = {
      'CO': 'COP (Peso Colombiano)',
      'PE': 'PEN (Sol Peruano)', 
      'EC': 'USD (Dólar Estadounidense)',
      'MX': 'MXN (Peso Mexicano)'
    };
    return currencies[country] || 'COP (Peso Colombiano)';
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
    const startTime = performance.now();
    
    console.log('🚀 SalesReport: ===== INICIANDO GENERACIÓN DE REPORTE =====');
    console.log('⏱️ SalesReport: Timestamp inicio:', new Date().toISOString());
    console.log('🕐 SalesReport: Tiempo de inicio (ms):', startTime);
    
    // Limpiar mensaje anterior y datos
    this.showMessage.set(false);
    this.reportData.set(null);
    
    // Preparar datos de la petición
    const country = localStorage.getItem('userCountry') || 'CO';
    const request: SalesReportRequest = {
      vendor_id: this.vendedor(),
      period: this.periodo(),
      start_date: this.getStartDate(),
      end_date: this.getEndDate()
    };

    console.log('📋 SalesReport: Parámetros del usuario:');
    console.log('👤 SalesReport: Vendedor seleccionado:', this.vendedor());
    console.log('📅 SalesReport: Período seleccionado:', this.periodo());
    console.log('🌍 SalesReport: País seleccionado:', country);
    console.log('📊 SalesReport: Fecha inicio calculada:', this.getStartDate());
    console.log('📊 SalesReport: Fecha fin calculada:', this.getEndDate());
    console.log('📦 SalesReport: Request completo:', JSON.stringify(request, null, 2));

    // Realizar petición al backend
    this.salesReportService.getSalesReport(request).subscribe({
      next: (response) => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        console.log('✅ SalesReport: ===== RESPUESTA RECIBIDA EN COMPONENTE =====');
        console.log('⏱️ SalesReport: Timestamp fin:', new Date().toISOString());
        console.log('🕐 SalesReport: Tiempo de fin (ms):', endTime);
        console.log('⏰ SalesReport: Duración total componente (ms):', Math.round(duration * 100) / 100);
        console.log('📋 SalesReport: Response completa del backend:', JSON.stringify(response, null, 2));
        
        // Extraer los datos del response (el backend devuelve {data: {...}, success: true})
        const rawData = response.data || response;
        console.log('📊 SalesReport: Datos extraídos de response:', rawData);
        
        if (!rawData || !rawData.productos || !rawData.grafico) {
          console.error('❌ SalesReport: ===== ESTRUCTURA DE DATOS INVÁLIDA =====');
          console.error('❌ SalesReport: Datos recibidos:', rawData);
          console.error('❌ SalesReport: ¿Tiene productos?:', !!rawData?.productos);
          console.error('❌ SalesReport: ¿Tiene gráfico?:', !!rawData?.grafico);
          console.error('❌ SalesReport: Productos recibidos:', rawData?.productos);
          console.error('❌ SalesReport: Gráfico recibido:', rawData?.grafico);
          
          this.messageType.set('error');
          this.messageText.set('salesReportError');
          this.showMessage.set(true);
          this.reportData.set(null);
          return;
        }
        
        console.log('🌍 SalesReport: Configuración de país:');
        console.log('🌍 SalesReport: País actual:', localStorage.getItem('userCountry') || 'CO');
        console.log('🌍 SalesReport: Símbolo de moneda:', this.currencySymbol());
        console.log('💡 SalesReport: NOTA: El backend siempre devuelve datos en COP, las conversiones se hacen en el frontend');
        
        // Convertir valores según el país actual
        const convertedData = {
          ...rawData,
          ventasTotales: this.convertValue(rawData.ventasTotales),
          productos: rawData.productos.map(producto => ({
            ...producto,
            ventas: this.convertValue(producto.ventas)
          })),
          grafico: rawData.grafico // Los valores del gráfico NO se convierten - son unidades/cantidades
        };

        console.log('💰 SalesReport: Conversión de monedas:');
        console.log('💰 SalesReport: Ventas totales originales:', rawData.ventasTotales);
        console.log('💰 SalesReport: Ventas totales convertidas:', convertedData.ventasTotales);
        console.log('📦 SalesReport: Productos originales:', rawData.productos);
        console.log('📦 SalesReport: Número de productos:', rawData.productos?.length);
        console.log('📦 SalesReport: Detalle productos originales:', rawData.productos?.map(p => ({ 
          nombre: p.nombre, 
          ventas: p.ventas 
        })));
        console.log('🔄 SalesReport: Datos convertidos:', convertedData);
        console.log('📦 SalesReport: Productos convertidos:', convertedData.productos);
        console.log('📦 SalesReport: Número de productos convertidos:', convertedData.productos?.length);
        console.log('📊 SalesReport: Gráfico original:', rawData.grafico);
        console.log('📊 SalesReport: Gráfico convertido:', convertedData.grafico);
        console.log('💡 SalesReport: NOTA: El gráfico mantiene los valores originales porque representan cantidades/unidades, no valores monetarios');
    
        console.log('✅ SalesReport: ===== REPORTE GENERADO EXITOSAMENTE =====');
        this.messageType.set('success');
        this.messageText.set('salesReportSuccess');
        this.showMessage.set(true);
        this.reportData.set(convertedData);
      },
      error: (error) => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        console.error('❌ SalesReport: ===== ERROR EN GENERACIÓN DE REPORTE =====');
        console.error('⏱️ SalesReport: Timestamp error:', new Date().toISOString());
        console.error('🕐 SalesReport: Tiempo de error (ms):', endTime);
        console.error('⏰ SalesReport: Duración hasta error (ms):', Math.round(duration * 100) / 100);
        console.error('📊 SalesReport: Status HTTP:', error.status || 'Desconocido');
        console.error('📋 SalesReport: Mensaje de error:', error.message || 'Sin mensaje');
        console.error('🔍 SalesReport: Error completo:', error);
        
        // Mensaje específico para cuando no hay datos (404)
        if (error.status === 404) {
          console.error('❌ SalesReport: Error 404 - No hay datos para los parámetros especificados');
          this.messageType.set('error');
          this.messageText.set('salesReportNoDataForParams');
        } else {
          console.error('❌ SalesReport: Error general en la consulta');
          this.messageType.set('error');
          this.messageText.set('salesReportError');
        }
        
        this.showMessage.set(true);
        this.reportData.set(null);
        console.error('❌ SalesReport: ===== ERROR MANEJADO =====');
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
    
    console.log('📅 SalesReport: Calculando fecha de inicio para período:', period);
    console.log('📅 SalesReport: Fecha actual:', currentDate.toISOString());
    
    switch (period) {
      case 'bimestral':
        currentDate.setMonth(currentDate.getMonth() - 2);
        console.log('📅 SalesReport: Período bimestral - restando 2 meses');
        break;
      case 'trimestral':
        currentDate.setMonth(currentDate.getMonth() - 3);
        console.log('📅 SalesReport: Período trimestral - restando 3 meses');
        break;
      case 'semestral':
        currentDate.setMonth(currentDate.getMonth() - 6);
        console.log('📅 SalesReport: Período semestral - restando 6 meses');
        break;
      case 'anual':
        currentDate.setFullYear(currentDate.getFullYear() - 1);
        console.log('📅 SalesReport: Período anual - restando 1 año');
        break;
      default:
        console.warn('⚠️ SalesReport: Período no reconocido:', period);
    }
    
    const startDate = currentDate.toISOString().split('T')[0];
    console.log('📅 SalesReport: Fecha de inicio calculada:', startDate);
    return startDate;
  }

  private getEndDate(): string {
    const endDate = new Date().toISOString().split('T')[0];
    console.log('📅 SalesReport: Fecha de fin (actual):', endDate);
    return endDate;
  }
  
}
