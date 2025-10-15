import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SalesReportRequest {
  vendor_id: string;
  period: string;
  start_date: string;
  end_date: string;
}

export interface SalesReportResponse {
  data: {
    ventasTotales: number;
    productos: Array<{
      nombre: string;
      ventas: number;
    }>;
    grafico: number[];
  };
  success: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SalesReportService {
  private api = environment.baseUrl;

  constructor(private http: HttpClient) {
    console.log('🏗️ SalesReportService: Servicio instanciado');
    console.log('🌐 SalesReportService: URL base configurada:', this.api);
  }

  getSalesReport(request: SalesReportRequest): Observable<SalesReportResponse> {
    const url = `${this.api}reports/sales-report`;
    console.log('🔍 SalesReportService: Solicitando reporte de ventas desde:', url);
    console.log('📊 SalesReportService: Datos de la petición:', request);
    
    return this.http.post<SalesReportResponse>(url, request);
  }
}
