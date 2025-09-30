import { Component, Input } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatIconModule, MatButtonModule],
  templateUrl: './page-header.html',
  styleUrls: ['./page-header.css']
})
export class PageHeader {
  @Input() pageTitle = '';
  @Input() userName = 'John Doe';
  @Input() userRole = 'Administrador';
}
