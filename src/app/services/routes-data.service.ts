import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClientStop, Vehicle } from '../shared/types/route-types';

@Injectable({ providedIn: 'root' })
export class RoutesDataService {
  private readonly clientsUrl = 'assets/mock/routes/clients.json';
  private readonly vehiclesUrl = 'assets/mock/routes/vehicles.json';

  constructor(private http: HttpClient) {}

  getClients(): Observable<ClientStop[]> {
    return this.http.get<ClientStop[]>(this.clientsUrl);
  }

  getVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(this.vehiclesUrl);
  }
}


