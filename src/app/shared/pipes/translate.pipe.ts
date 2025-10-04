import { Pipe, PipeTransform } from '@angular/core';
import { ACTIVE_TRANSLATIONS, currentLangSignal } from '../lang/lang-store';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false,
})
export class TranslatePipe implements PipeTransform {
  transform(key: string): string {
    currentLangSignal();
    return ACTIVE_TRANSLATIONS[key] || key;
  }
}
