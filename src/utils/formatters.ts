import { getCurrentLanguage, mapLanguageToLocale } from '../contexts/LanguageContext';

/**
 * Format price as currency using current locale
 */
export const formatPrice = (price: number): string => {
  const lang = getCurrentLanguage();
  const locale = mapLanguageToLocale(lang);
  // Currency can be adjusted; keeping USD as placeholder if backend sends USD-equivalent
  const currency = lang === 'es' ? 'ARS' : lang === 'pt' ? 'BRL' : 'USD';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);
};

/**
 * Format number with commas
 */
export const formatNumber = (num: number): string => {
  const locale = mapLanguageToLocale(getCurrentLanguage());
  return new Intl.NumberFormat(locale).format(num);
};

/**
 * Format address to show only city and state
 */
export const formatLocation = (city: string, state: string): string => {
  return `${city}, ${state}`;
};