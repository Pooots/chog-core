import i18n, { getActiveLocale, normalizeLocale } from '@/i18n'

const DEFAULT_CURRENCY = 'PHP'

export function getFormatLocale(): string {
  const locale = getActiveLocale()
  return locale === 'fil' ? 'fil-PH' : 'en-PH'
}

export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(getFormatLocale(), options).format(value)
}

export function formatPrice(
  value: string | number | null | undefined,
  options?: { currency?: string; freeLabel?: string },
): string {
  const num = typeof value === 'string' ? parseFloat(value) : (value ?? 0)
  const freeLabel = options?.freeLabel ?? i18n.t('common:price.free')
  if (!Number.isFinite(num) || num <= 0) return freeLabel
  return new Intl.NumberFormat(getFormatLocale(), {
    style: 'currency',
    currency: options?.currency ?? DEFAULT_CURRENCY,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

export function formatPriceDecimal(
  value: string | number | null | undefined,
  currency = DEFAULT_CURRENCY,
): string {
  const num = typeof value === 'string' ? parseFloat(value) : (value ?? 0)
  return new Intl.NumberFormat(getFormatLocale(), {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

export function formatDate(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString(getFormatLocale(), options)
}

export function formatDateTime(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString(getFormatLocale(), options)
}

export function formatTime(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString(getFormatLocale(), options)
}

export function getIntlLocaleFromStorage(): string {
  if (typeof localStorage === 'undefined') return 'en'
  return normalizeLocale(localStorage.getItem('i18nextLng'))
}
