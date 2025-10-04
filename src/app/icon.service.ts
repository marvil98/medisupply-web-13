import { Injectable, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';

@Injectable({ providedIn: 'root' })
export class IconService {
  private readonly iconRegistry = inject(MatIconRegistry);
  private readonly sanitizer = inject(DomSanitizer);

  constructor() {
    this.registerIcons();
  }

  private registerIcons(): void {
    const icons: Record<string, string> = {
      home: 'assets/icons/home.svg',
      box: 'assets/icons/box.svg',
      users: 'assets/icons/users.svg',
      'bar-chart': 'assets/icons/bar-chart.svg',
      dollar: 'assets/icons/dollar.svg',
      map: 'assets/icons/map.svg',
      user: 'assets/icons/user.svg',
      logout: 'assets/icons/logout.svg',
      upload: 'assets/icons/upload.svg',
      list: 'assets/icons/list.svg',
      reports: 'assets/icons/reports.svg',
      arrow: 'assets/icons/arrow-icon.svg',
    };

    for (const [name, path] of Object.entries(icons)) {
      this.iconRegistry.addSvgIcon(name, this.sanitizer.bypassSecurityTrustResourceUrl(path));
    }
  }
}
