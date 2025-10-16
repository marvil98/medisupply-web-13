import { Injectable } from '@angular/core';
import { ClientStop, LatLng, Vehicle, VehicleRoute } from '../../../shared/types/route-types';

interface OptimizeInput {
  center: LatLng;
  clients: ClientStop[];
  availableVehicles: Vehicle[]; // pool
  requestedVehicles: number;    // user selection 1..3
}

interface OptimizeResult {
  usedRoutes: VehicleRoute[];
  usedVehicles: Vehicle[];
  unassigned?: ClientStop[];
}

@Injectable({ providedIn: 'root' })
export class RouteOptimizerService {
  optimize({ center, clients, availableVehicles, requestedVehicles }: OptimizeInput): OptimizeResult {
    if (requestedVehicles < 1 || requestedVehicles > 3) {
      throw new Error('invalid-requested-vehicles');
    }
    if (availableVehicles.length === 0) {
      throw new Error('no-vehicles');
    }

    const totalDemand = clients.reduce((acc, c) => acc + c.demand, 0);
    const perVehicleCap = availableVehicles[0].capacity;
    const minVehiclesByDemand = Math.max(1, Math.ceil(totalDemand / perVehicleCap));
    const maxUsable = Math.min(availableVehicles.length, requestedVehicles);
    const vehiclesNeeded = Math.min(minVehiclesByDemand, maxUsable);

    const vehicles = availableVehicles.slice(0, vehiclesNeeded);

    // Simple k-means-like clustering by geography (lat/lng) with k = vehiclesNeeded
    const clusters: ClientStop[][] = this.kmeans(clients, vehiclesNeeded);

    // Balance por capacidad: reasignar si alguna ruta supera capacidad
    const balanced = this.balanceByCapacity(clusters, perVehicleCap);

    // Crear rutas (orden NN desde el centro)
    const usedRoutes: VehicleRoute[] = vehicles.map((v, idx) => {
      const stops = balanced[idx] || [];
      const nnOrdered = this.nearestNeighborOrder(center, stops);
      const twoOpt = this.twoOptOrder(center, nnOrdered, 400); // más iteraciones 2-opt
      const ordered = this.threeOptOrder(center, twoOpt, 120);  // más iteraciones 3-opt
      const path: LatLng[] = [center, ...ordered.map((s) => ({ lat: s.lat, lng: s.lng })), center];
      return { vehicle: v, stops: ordered, path };
    });

    const unassigned: ClientStop[] = [];
    // Validación de capacidad global
    const totalCapacity = vehicles.reduce((acc, v) => acc + v.capacity, 0);
    if (totalCapacity < totalDemand) {
      // No se puede cubrir toda la demanda con los vehículos disponibles
      // (Se marca todo como asignado en rutas, pero devolvemos la lista completa como unassigned para validar fuera)
      unassigned.push(...clients);
    }

    return { usedRoutes, usedVehicles: vehicles, unassigned };
  }

  // --- Utils ---

  private kmeans(points: ClientStop[], k: number): ClientStop[][] {
    if (k <= 1) {
      return [points.slice()];
    }
    // Inicialización simple: elegir los k primeros puntos como centroides
    let centroids = points.slice(0, k).map((p) => ({ lat: p.lat, lng: p.lng }));
    let clusters: ClientStop[][] = Array.from({ length: k }, () => []);

    for (let iter = 0; iter < 8; iter++) {
      clusters = Array.from({ length: k }, () => []);
      for (const p of points) {
        let bestIndex = 0;
        let bestDist = Number.POSITIVE_INFINITY;
        for (let i = 0; i < k; i++) {
          const d = this.haversine(centroids[i], p);
          if (d < bestDist) {
            bestDist = d;
            bestIndex = i;
          }
        }
        clusters[bestIndex].push(p);
      }
      // Recalcular centroides
      const newCentroids = [];
      for (const cluster of clusters) {
        if (cluster.length === 0) {
          newCentroids.push(centroids[newCentroids.length]);
          continue;
        }
        const meanLat = cluster.reduce((a, c) => a + c.lat, 0) / cluster.length;
        const meanLng = cluster.reduce((a, c) => a + c.lng, 0) / cluster.length;
        newCentroids.push({ lat: meanLat, lng: meanLng });
      }
      centroids = newCentroids;
    }
    return clusters;
  }

  private balanceByCapacity(clusters: ClientStop[][], capacity: number): ClientStop[][] {
    // Si alguna ruta excede capacidad, se mueve el último punto al cluster con menos carga, iterativamente.
    const loads = clusters.map((cs) => cs.reduce((a, c) => a + c.demand, 0));
    const result = clusters.map((cs) => cs.slice());

    let moved = true;
    let iterations = 0;
    const maxIterations = 50; // salvaguarda para evitar ciclos largos que congelen la UI
    while (moved && iterations < maxIterations) {
      iterations++;
      moved = false;
      const maxIdx = loads.indexOf(Math.max(...loads));
      const minIdx = loads.indexOf(Math.min(...loads));
      if (loads[maxIdx] > capacity && result[maxIdx].length > 1) {
        const candidate = result[maxIdx].pop()!;
        result[minIdx].push(candidate);
        loads[maxIdx] -= candidate.demand;
        loads[minIdx] += candidate.demand;
        moved = true;
      }
    }
    return result;
  }

  private nearestNeighborOrder(center: LatLng, stops: ClientStop[]): ClientStop[] {
    const remaining = stops.slice();
    const ordered: ClientStop[] = [];
    let current: LatLng = center;
    while (remaining.length > 0) {
      let bestIdx = 0;
      let bestDist = Number.POSITIVE_INFINITY;
      for (let i = 0; i < remaining.length; i++) {
        const d = this.haversine(current, remaining[i]);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = i;
        }
      }
      const chosen = remaining.splice(bestIdx, 1)[0];
      ordered.push(chosen);
      current = chosen;
    }
    return ordered;
  }

  // Refinamiento 2-opt sencillo para acortar la ruta del vehículo
  private twoOptOrder(center: LatLng, stops: ClientStop[], maxIterations: number): ClientStop[] {
    if (stops.length < 3) return stops.slice();
    const current = stops.slice();

    const routeDistance = (seq: ClientStop[]): number => {
      let dist = 0;
      let prev: LatLng = center;
      for (const s of seq) {
        dist += this.haversine(prev, s);
        prev = s;
      }
      dist += this.haversine(prev, center);
      return dist;
    };

    let improved = true;
    let iterations = 0;
    let bestDistance = routeDistance(current);

    while (improved && iterations < maxIterations) {
      improved = false;
      iterations++;
      for (let i = 0; i < current.length - 2; i++) {
        for (let k = i + 1; k < current.length - 1; k++) {
          const candidate = current.slice();
          // reverse segment (i..k)
          const segment = candidate.slice(i, k + 1).reverse();
          candidate.splice(i, segment.length, ...segment);
          const candDist = routeDistance(candidate);
          if (candDist + 1e-9 < bestDistance) {
            for (let t = 0; t < candidate.length; t++) current[t] = candidate[t];
            bestDistance = candDist;
            improved = true;
          }
        }
      }
    }
    return current;
  }

  // 3-opt muy acotado: intenta remover tres aristas y reconectar si mejora
  private threeOptOrder(center: LatLng, stops: ClientStop[], maxIterations: number): ClientStop[] {
    if (stops.length < 5) return stops.slice();
    const current = stops.slice();

    const routeDistance = (seq: ClientStop[]): number => {
      let dist = 0;
      let prev: LatLng = center;
      for (const s of seq) {
        dist += this.haversine(prev, s);
        prev = s;
      }
      dist += this.haversine(prev, center);
      return dist;
    };

    let best = current.slice();
    let bestDist = routeDistance(best);
    let iter = 0;

    const apply = (seq: ClientStop[], i: number, j: number, k: number, pattern: number): ClientStop[] => {
      // Particiona en A|B|C|D y reconecta según patrón clásico
      const A = seq.slice(0, i + 1);
      const B = seq.slice(i + 1, j + 1);
      const C = seq.slice(j + 1, k + 1);
      const D = seq.slice(k + 1);
      switch (pattern) {
        case 0: return A.concat(B.reverse(), C, D);        // flip B
        case 1: return A.concat(B, C.reverse(), D);        // flip C
        case 2: return A.concat(C, B, D);                  // swap B,C
        case 3: return A.concat(C.reverse(), B, D);        // flip C then concat
        case 4: return A.concat(B.reverse(), C.reverse(), D);
        default: return seq;
      }
    };

    let improved = true;
    while (improved && iter < maxIterations) {
      improved = false;
      iter++;
      for (let i = 0; i < current.length - 3; i++) {
        for (let j = i + 1; j < current.length - 2; j++) {
          for (let k = j + 1; k < current.length - 1; k++) {
            for (let p = 0; p < 5; p++) {
              const candidate = apply(best, i, j, k, p);
              const d = routeDistance(candidate);
              if (d + 1e-9 < bestDist) {
                best = candidate;
                bestDist = d;
                improved = true;
              }
            }
          }
        }
      }
    }
    return best;
  }

  private haversine(a: LatLng, b: LatLng): number {
    const R = 6371; // km
    const dLat = this.toRad(b.lat - a.lat);
    const dLon = this.toRad(b.lng - a.lng);
    const lat1 = this.toRad(a.lat);
    const lat2 = this.toRad(b.lat);

    const sinDLat = Math.sin(dLat / 2);
    const sinDLon = Math.sin(dLon / 2);
    const aa = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
    const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
    return R * c;
  }

  private toRad(v: number) {
    return (v * Math.PI) / 180;
  }
}
