import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ClientStop, Vehicle } from '../shared/types/route-types';

@Injectable({ providedIn: 'root' })
export class RoutesDataService {
  private readonly api = environment.baseUrl; // e.g. http://localhost:5000/api/v1/

  constructor(private http: HttpClient) {
    console.log('🏗️ RoutesDataService: Servicio instanciado');
    console.log('🌐 RoutesDataService: URL base configurada:', this.api);
  }

  getClients(): Observable<ClientStop[]> {
    console.log('🔍 RoutesDataService: Solicitando clientes desde:', `${this.api}routes/clients`);
    return this.http.get<ClientStop[]>(`${this.api}routes/clients`).pipe(
      tap(data => console.log('📡 RoutesDataService: Respuesta de clientes recibida:', data)),
      catchError(error => {
        console.error('❌ RoutesDataService: Error en petición de clientes:', error);
        return throwError(() => error);
      })
    );
  }

  getVehicles(): Observable<Vehicle[]> {
    console.log('🔍 RoutesDataService: Solicitando vehículos desde:', `${this.api}routes/vehicles`);
    return this.http.get<Vehicle[]>(`${this.api}routes/vehicles`).pipe(
      tap(data => console.log('📡 RoutesDataService: Respuesta de vehículos recibida:', data)),
      catchError(error => {
        console.error('❌ RoutesDataService: Error en petición de vehículos:', error);
        return throwError(() => error);
      })
    );
  }
}


