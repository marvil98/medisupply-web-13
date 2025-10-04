import { signal } from '@angular/core';
import ES_TRANSLATIONS from '../../pages/regional-settings/es.json';
import EN_TRANSLATIONS from '../../pages/regional-settings/en.json';

export const ACTIVE_TRANSLATIONS: Record<string, string> = {};

export type LangKey = 'es' | 'en';

export const currentLangSignal = signal<LangKey>(
  (localStorage.getItem('userLang')?.split('-')[0] as LangKey) || 'es',
);

export function loadTranslations(lang: LangKey) {
  let newTranslations: Record<string, string> = {};

  if (lang === 'es') {
    newTranslations = ES_TRANSLATIONS;
  } else if (lang === 'en') {
    newTranslations = EN_TRANSLATIONS;
  }

  Object.keys(ACTIVE_TRANSLATIONS).forEach((key) => delete ACTIVE_TRANSLATIONS[key]);
  Object.assign(ACTIVE_TRANSLATIONS, newTranslations);
  currentLangSignal.set(lang);
}

loadTranslations(currentLangSignal());
