import { ar } from './dictionaries/ar';
import { en } from './dictionaries/en';

export type Locale = 'ar' | 'en';
export type Direction = 'rtl' | 'ltr';

export const LOCALE_STORAGE_KEY = 'athar-locale';
export const DEFAULT_LOCALE: Locale = 'ar';

const dictionaries = { ar, en } as const;

function resolvePath(obj: unknown, path: string): string | undefined {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return typeof current === 'string' ? current : undefined;
}

export function getDirection(locale: Locale): Direction {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

export function translate(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>,
): string {
  const primary = resolvePath(dictionaries[locale], key);
  const fallbackLocale: Locale = locale === 'ar' ? 'en' : 'ar';
  const raw = primary ?? resolvePath(dictionaries[fallbackLocale], key) ?? key;

  if (!params) return raw;
  return Object.entries(params).reduce(
    (acc, [paramKey, paramValue]) => acc.replaceAll(`{${paramKey}}`, String(paramValue)),
    raw,
  );
}
