import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import hi from './locales/hi.json';
import zh from './locales/zh.json';

export type Locale = 'en' | 'es' | 'fr' | 'de' | 'hi' | 'zh';

export const LOCALES: Record<Locale, { label: string; dir: 'ltr' | 'rtl' }> = {
  en: { label: 'English', dir: 'ltr' },
  es: { label: 'Español', dir: 'ltr' },
  fr: { label: 'Français', dir: 'ltr' },
  de: { label: 'Deutsch', dir: 'ltr' },
  hi: { label: 'हिन्दी', dir: 'ltr' },
  zh: { label: '中文', dir: 'ltr' },
};

const translations: Record<Locale, Record<string, string>> = { en, es, fr, de, hi, zh };

const DEFAULT_LOCALE: Locale = 'en';

export function getLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  const stored = localStorage.getItem('locale') as Locale | null;
  if (stored && translations[stored]) return stored;
  const browserLang = navigator.language.slice(0, 2);
  if (browserLang in translations) return browserLang as Locale;
  return DEFAULT_LOCALE;
}

export function setLocale(locale: Locale): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('locale', locale);
  document.documentElement.setAttribute('lang', locale);
  applyTranslations(locale);
}

export function t(key: string, locale?: Locale): string {
  const lang = locale || (typeof window !== 'undefined' ? getLocale() : DEFAULT_LOCALE);
  return translations[lang]?.[key] || translations[DEFAULT_LOCALE]?.[key] || key;
}

export function applyTranslations(locale?: Locale): void {
  if (typeof window === 'undefined') return;
  const lang = locale || getLocale();
  document.documentElement.setAttribute('lang', lang);
  
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key) {
      const translated = translations[lang]?.[key] || translations[DEFAULT_LOCALE]?.[key];
      if (translated) {
        el.textContent = translated;
      }
    }
  });

  document.querySelectorAll<HTMLElement>('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key) {
      const translated = translations[lang]?.[key] || translations[DEFAULT_LOCALE]?.[key];
      if (translated) {
        el.setAttribute('placeholder', translated);
      }
    }
  });

  document.querySelectorAll<HTMLElement>('[data-i18n-aria]').forEach(el => {
    const key = el.getAttribute('data-i18n-aria');
    if (key) {
      const translated = translations[lang]?.[key] || translations[DEFAULT_LOCALE]?.[key];
      if (translated) {
        el.setAttribute('aria-label', translated);
      }
    }
  });
}

export function formatCurrency(amount: number, locale?: Locale): string {
  const lang = locale || getLocale();
  const currencyMap: Record<Locale, string> = {
    en: 'USD',
    es: 'USD',
    fr: 'USD',
    de: 'USD',
    hi: 'INR',
    zh: 'CNY',
  };
  const localeMap: Record<Locale, string> = {
    en: 'en-US',
    es: 'es-ES',
    fr: 'fr-FR',
    de: 'de-DE',
    hi: 'hi-IN',
    zh: 'zh-CN',
  };
  return new Intl.NumberFormat(localeMap[lang], {
    style: 'currency',
    currency: currencyMap[lang],
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
