import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ClientStop, Vehicle } from '../shared/types/route-types';

@Injectable({ providedIn: 'root' })
export class RoutesDataService {
  private readonly api = environment.baseUrl; // e.g. http://localhost:5000/api/v1/

  constructor(private http: HttpClient) {}

  getClients(): Observable<ClientStop[]> {
    return this.http.get<ClientStop[]>(`${this.api}routes/clients`);
  }

  getVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.api}routes/vehicles`);
  }
}


