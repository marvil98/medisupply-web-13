import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild, computed, signal } from '@angular/core';
import { GoogleMap, GoogleMapsModule, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { ClientStop, LatLng, VehicleRoute } from '../../../shared/types/route-types';

@Component({
  selector: 'app-route-map',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule],
  templateUrl: './route-map.html',
  styleUrls: ['./route-map.css'],
})
export class RouteMap implements OnInit, OnChanges {
  @Input({ required: true }) center!: LatLng;
  @Input({ required: true }) clients: ClientStop[] = [];
  @Input({ required: true }) routes: VehicleRoute[] = [];

  @ViewChild(GoogleMap) map?: GoogleMap;
  @ViewChild(MapInfoWindow) infoWindow?: MapInfoWindow;

  width = 780;
  height = 420;
  selectedStop = signal<ClientStop | null>(null);

  // Google Maps state
  mapCenter: google.maps.LatLngLiteral = { lat: 0, lng: 0 };
  zoom = 13;
  userMarker: google.maps.LatLngLiteral | null = null;

  // bounds calculation
  private bounds = computed(() => {
    const points = [this.center, ...this.clients];
    const lats = points.map((p) => p.lat);
    const lngs = points.map((p) => p.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    return { minLat, maxLat, minLng, maxLng };
  });

  pxFromLatLng(lat: number, lng: number) {
    const b = this.bounds();
    // Avoid division by zero
    const latRange = Math.max(0.00001, b.maxLat - b.minLat);
    const lngRange = Math.max(0.00001, b.maxLng - b.minLng);
    const x = ((lng - b.minLng) / lngRange) * this.width;
    const y = this.height - ((lat - b.minLat) / latRange) * this.height;
    return { x, y };
  }

  pathD(points: LatLng[], color: string) {
    if (points.length === 0) return '';
    const first = this.pxFromLatLng(points[0].lat, points[0].lng);
    let d = `M ${first.x} ${first.y}`;
    for (let i = 1; i < points.length; i++) {
      const p = this.pxFromLatLng(points[i].lat, points[i].lng);
      d += ` L ${p.x} ${p.y}`;
    }
    return d;
  }

  vehicleForStop(stop: ClientStop): string | null {
    for (const r of this.routes) {
      if (r.stops.find((s) => s.id === stop.id)) {
        return r.vehicle.label || r.vehicle.id;
      }
    }
    return null;
  }

  onStopClick(stop: ClientStop) {
    this.selectedStop.set(stop);
  }

  openInfo(stop: ClientStop, marker: MapMarker) {
    this.selectedStop.set(stop);
    this.infoWindow?.open(marker);
  }

  getOriginMarkerOptions(): any {
    return {
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="#1976d2" stroke="#fff" stroke-width="3"/>
            <text x="20" y="26" text-anchor="middle" fill="#fff" font-family="Arial" font-size="18" font-weight="bold">🏢</text>
          </svg>
        `),
        scaledSize: new google.maps.Size(40, 40),
        anchor: new google.maps.Point(20, 20)
      }
    };
  }

  ngOnInit(): void {
    // Initialize map center from provided center
    if (this.center) {
      this.mapCenter = { lat: this.center.lat, lng: this.center.lng };
    }
    // Try browser geolocation to center on user
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const p = { lat: pos.coords.latitude, lng: pos.coords.longitude } as const;
          this.mapCenter = p;
          this.userMarker = p;
        },
        () => {
          // keep provided center
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
    // Ajustar vista inicial
    queueMicrotask(() => this.fitToData());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['center'] && this.center) {
      this.mapCenter = { lat: this.center.lat, lng: this.center.lng };
    }
    if (changes['routes'] || changes['clients'] || changes['center']) {
      queueMicrotask(() => this.fitToData());
    }
  }

  private fitToData(): void {
    if (!this.map) return;
    const bounds = new google.maps.LatLngBounds();
    if (this.center) bounds.extend(this.center as google.maps.LatLngLiteral);
    for (const c of this.clients) {
      bounds.extend({ lat: c.lat, lng: c.lng });
    }
    for (const r of this.routes) {
      for (const p of r.path) bounds.extend({ lat: p.lat, lng: p.lng });
    }
    try {
      if (!bounds.isEmpty()) {
        this.map.fitBounds(bounds, 32);
      }
    } catch {}
  }
}
