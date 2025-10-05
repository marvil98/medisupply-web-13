import { Component, signal } from '@angular/core';
import { PageHeader } from '../../shared/page-header/page-header';
import { ActionCard } from '../../shared/action-card/action-card';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CustomSelect } from '../../shared/custom-select/custom-select';
import { StatusMessage } from '../../shared/status-message/status-message';

@Component({
  selector: 'app-components',
  standalone: true,
  imports: [
    PageHeader,
    ActionCard,
    TranslatePipe,
    MatButtonModule,
    MatIconModule,
    CustomSelect,
    StatusMessage,
  ],
  templateUrl: './components.html',
  styleUrl: './components.css',
})
export class Components {
  pageTitle = 'Componentes de la web';
  languageOptions = [
    { value: 'es', labelKey: 'spanishLabel' },
    { value: 'en', labelKey: 'englishLabel' },
  ];

  countryOptions = [
    { value: 'co', labelKey: 'colombiaLabel' },
    { value: 'mx', labelKey: 'mexicoLabel' },
  ];

  regionOptions = [
    { value: 'andina', labelKey: 'andinaLabel' },
    { value: 'caribe', labelKey: 'caribeLabel' },
  ];

  selectedLanguage = signal<string>('');
  selectedCountry = signal<string>('co');
  selectedRegion = signal<string>('');
  methodClick() {
    console.log('onclick method');
  }
}
