import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeader } from '../../shared/page-header/page-header';
import { CustomSelect } from '../../shared/custom-select/custom-select';
import { MatButtonModule } from '@angular/material/button';
import { StatusMessage } from '../../shared/status-message/status-message';
import { mockSalesData } from './mocks/sales-report.mock';
import { TranslatePipe } from '../../shared/pipes/translate.pipe'; 
import { NgxChartsModule } from '@swimlane/ngx-charts';

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
    try {
      const vendedorKey = this.vendedor() as keyof typeof mockSalesData;
      const periodoKey = this.periodo() as keyof typeof mockSalesData[typeof vendedorKey];
      const data = mockSalesData[vendedorKey]?.[periodoKey] ?? null;
      if (!data) {
        this.messageType.set('error');
        this.messageText.set('salesReportNoData');
        this.showMessage.set(true);
        this.reportData.set(null);
        return;
      }
  
      this.messageType.set('success');
      this.messageText.set('salesReportSuccess');
      this.showMessage.set(true);
      this.reportData.set(data);
    } catch {
      this.messageType.set('error');
      this.messageText.set('salesReportError');
      this.showMessage.set(true);
      this.reportData.set(null);
    }
  }
  
}
