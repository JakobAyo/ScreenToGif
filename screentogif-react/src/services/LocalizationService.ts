/**
 * Localization Service
 * Internationalization and translation management
 */

import type { AppLocale } from '../stores/settingsStore';

/** Supported locales with their display names */
export const SUPPORTED_LOCALES: Record<AppLocale, string> = {
  en: 'English',
  de: 'Deutsch',
  es: 'Español',
  fr: 'Français',
  pt: 'Português',
  ru: 'Русский',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
};

/** Translation dictionary type */
interface TranslationDictionary {
  [key: string]: string | TranslationDictionary;
}

/** Pluralization rules */
type PluralRule = (n: number) => 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';

/** Interpolation options */
interface InterpolationOptions {
  [key: string]: string | number;
}

class LocalizationServiceImpl {
  private currentLocale: AppLocale = 'en';
  private translations: Map<AppLocale, TranslationDictionary> = new Map();
  private fallbackLocale: AppLocale = 'en';
  private _isInitialized = false;
  private loadingPromises: Map<AppLocale, Promise<void>> = new Map();
  private pluralRules: Map<AppLocale, PluralRule> = new Map();

  constructor() {
    this.initPluralRules();
  }

  /**
   * Initialize the service with a locale
   */
  async initialize(locale: AppLocale = 'en'): Promise<void> {
    await this.loadTranslations(locale);

    // Also load fallback locale
    if (locale !== this.fallbackLocale) {
      await this.loadTranslations(this.fallbackLocale);
    }

    this.currentLocale = locale;
    this._isInitialized = true;
  }

  /**
   * Check if service is initialized
   */
  isInitialized(): boolean {
    return this._isInitialized;
  }

  /**
   * Get current locale
   */
  getLocale(): AppLocale {
    return this.currentLocale;
  }

  /**
   * Set current locale
   */
  async setLocale(locale: AppLocale): Promise<void> {
    if (!SUPPORTED_LOCALES[locale]) {
      console.warn(`Unsupported locale: ${locale}`);
      return;
    }

    await this.loadTranslations(locale);
    this.currentLocale = locale;

    // Update document lang attribute
    document.documentElement.lang = locale;
  }

  /**
   * Load translations for a locale
   */
  async loadTranslations(locale: AppLocale): Promise<void> {
    // Check if already loaded
    if (this.translations.has(locale)) {
      return;
    }

    // Check if loading is in progress
    const existingPromise = this.loadingPromises.get(locale);
    if (existingPromise) {
      return existingPromise;
    }

    // Load translations
    const loadPromise = this.fetchTranslations(locale);
    this.loadingPromises.set(locale, loadPromise);

    try {
      await loadPromise;
    } finally {
      this.loadingPromises.delete(locale);
    }
  }

  /**
   * Translate a key
   */
  t(key: string, options?: InterpolationOptions): string {
    const translation = this.getTranslation(key);

    if (!translation) {
      console.warn(`Missing translation for key: ${key}`);
      return key;
    }

    if (options) {
      return this.interpolate(translation, options);
    }

    return translation;
  }

  /**
   * Translate with pluralization
   */
  tp(key: string, count: number, options?: InterpolationOptions): string {
    const pluralForm = this.getPluralForm(count);
    const pluralKey = `${key}.${pluralForm}`;

    // Try plural form first, then fall back to base key
    let translation = this.getTranslation(pluralKey);
    if (!translation) {
      translation = this.getTranslation(`${key}.other`);
    }
    if (!translation) {
      translation = this.getTranslation(key);
    }

    if (!translation) {
      console.warn(`Missing translation for key: ${key}`);
      return key;
    }

    const interpolationOptions = { ...options, count };
    return this.interpolate(translation, interpolationOptions);
  }

  /**
   * Check if a translation exists
   */
  hasTranslation(key: string): boolean {
    return this.getTranslation(key) !== null;
  }

  /**
   * Get all supported locales
   */
  getSupportedLocales(): { code: AppLocale; name: string }[] {
    return Object.entries(SUPPORTED_LOCALES).map(([code, name]) => ({
      code: code as AppLocale,
      name,
    }));
  }

  /**
   * Get the display name for a locale
   */
  getLocaleName(locale: AppLocale): string {
    return SUPPORTED_LOCALES[locale] ?? locale;
  }

  /**
   * Format a number according to current locale
   */
  formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(this.currentLocale, options).format(value);
  }

  /**
   * Format a date according to current locale
   */
  formatDate(date: Date | number | string, options?: Intl.DateTimeFormatOptions): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(this.currentLocale, options).format(dateObj);
  }

  /**
   * Format a relative time
   */
  formatRelativeTime(value: number, unit: Intl.RelativeTimeFormatUnit): string {
    const rtf = new Intl.RelativeTimeFormat(this.currentLocale, { numeric: 'auto' });
    return rtf.format(value, unit);
  }

  /**
   * Format duration in human readable format
   */
  formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return this.t('time.hoursMinutes', {
        hours: hours.toString(),
        minutes: (minutes % 60).toString(),
      });
    }

    if (minutes > 0) {
      return this.t('time.minutesSeconds', {
        minutes: minutes.toString(),
        seconds: (seconds % 60).toString(),
      });
    }

    return this.tp('time.seconds', seconds, { count: seconds.toString() });
  }

  /**
   * Format file size
   */
  formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${this.formatNumber(size, { maximumFractionDigits: 2 })} ${units[unitIndex]}`;
  }

  private async fetchTranslations(locale: AppLocale): Promise<void> {
    try {
      // In a real implementation, this would fetch from a JSON file or API
      // For now, we'll use a placeholder that would be replaced with actual translation loading
      const response = await fetch(`/locales/${locale}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load translations for ${locale}`);
      }
      const translations = await response.json();
      this.translations.set(locale, translations);
    } catch (error) {
      console.error(`Failed to load translations for ${locale}:`, error);
      // Set empty translations to prevent repeated loading attempts
      this.translations.set(locale, {});
    }
  }

  private getTranslation(key: string): string | null {
    // Try current locale first
    let translation = this.getNestedValue(this.translations.get(this.currentLocale), key);

    // Fall back to fallback locale
    if (!translation && this.currentLocale !== this.fallbackLocale) {
      translation = this.getNestedValue(this.translations.get(this.fallbackLocale), key);
    }

    return translation;
  }

  private getNestedValue(obj: TranslationDictionary | undefined, key: string): string | null {
    if (!obj) return null;

    const keys = key.split('.');
    let current: TranslationDictionary | string = obj;

    for (const k of keys) {
      if (typeof current !== 'object' || current === null) {
        return null;
      }
      current = current[k] as TranslationDictionary | string;
      if (current === undefined) {
        return null;
      }
    }

    return typeof current === 'string' ? current : null;
  }

  private interpolate(template: string, options: InterpolationOptions): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = options[key];
      return value !== undefined ? String(value) : match;
    });
  }

  private getPluralForm(count: number): string {
    const rule = this.pluralRules.get(this.currentLocale);
    if (rule) {
      return rule(count);
    }
    // Default English-like rules
    return count === 1 ? 'one' : 'other';
  }

  private initPluralRules(): void {
    // English-like (en, de, es, fr, pt)
    const englishLike: PluralRule = (n) => (n === 1 ? 'one' : 'other');
    this.pluralRules.set('en', englishLike);
    this.pluralRules.set('de', englishLike);
    this.pluralRules.set('es', englishLike);
    this.pluralRules.set('fr', englishLike);
    this.pluralRules.set('pt', englishLike);

    // Russian
    const russian: PluralRule = (n) => {
      const mod10 = n % 10;
      const mod100 = n % 100;
      if (mod10 === 1 && mod100 !== 11) return 'one';
      if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'few';
      return 'many';
    };
    this.pluralRules.set('ru', russian);

    // East Asian (zh, ja, ko) - no plural forms
    const eastAsian: PluralRule = () => 'other';
    this.pluralRules.set('zh', eastAsian);
    this.pluralRules.set('ja', eastAsian);
    this.pluralRules.set('ko', eastAsian);
  }
}

// Singleton instance
export const LocalizationService = new LocalizationServiceImpl();

// Convenience function for translations
export function t(key: string, options?: InterpolationOptions): string {
  return LocalizationService.t(key, options);
}

// Convenience function for plural translations
export function tp(key: string, count: number, options?: InterpolationOptions): string {
  return LocalizationService.tp(key, count, options);
}
