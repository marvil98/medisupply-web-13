import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeader } from '../../shared/page-header/page-header';
import { CustomSelect } from '../../shared/custom-select/custom-select';
import { MatButtonModule } from '@angular/material/button';
import { StatusMessage } from '../../shared/status-message/status-message';
import { mockSalesData } from './mocks/sales-report.mock';

@Component({
  selector: 'app-sales-report',
  standalone: true,
  imports: [CommonModule, PageHeader, CustomSelect, MatButtonModule, StatusMessage],
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
    { value: 'v1', labelKey: 'Vendedor 1' },
    { value: 'v2', labelKey: 'Vendedor 2' },
    { value: 'v3', labelKey: 'Vendedor 3' },
    { value: 'v4', labelKey: 'Vendedor 4' },
    { value: 'v5', labelKey: 'Vendedor 5' },
  ];

  periodos = [
    { value: 'bimestral', labelKey: 'Bimestral' },
    { value: 'trimestral', labelKey: 'Trimestral' },
    { value: 'semestral', labelKey: 'Semestral' },
    { value: 'anual', labelKey: 'Anual' },
  ];

  get isButtonDisabled() {
    return !this.vendedor() || !this.periodo();
  }

  generarReporte() {
    try {
      const data = (mockSalesData as Record<string, Record<string, any>>)[this.vendedor()]?.[this.periodo()] ?? null;
      if (!data) {
        this.messageType.set('error');
        this.messageText.set('¡Ups! No se encontraron datos para este período');
        this.showMessage.set(true);
        this.reportData.set(null);
        return;
      }

      this.messageType.set('success');
      this.messageText.set('Reporte generado correctamente');
      this.showMessage.set(true);
      this.reportData.set(data);
    } catch {
      this.messageType.set('error');
      this.messageText.set('¡Ups! Hubo un error al generar el reporte. Intenta nuevamente');
      this.showMessage.set(true);
      this.reportData.set(null);
    }
  }
}
