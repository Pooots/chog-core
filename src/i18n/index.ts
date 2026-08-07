import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import enCommon from '@/locales/en/common.json'
import filCommon from '@/locales/fil/common.json'

export const SUPPORTED_LOCALES = ['en', 'fil'] as const
export type AppLocale = (typeof SUPPORTED_LOCALES)[number]

export const LOCALE_LABELS: Record<AppLocale, string> = {
  en: 'English',
  fil: 'Filipino',
}

export function normalizeLocale(value: string | null | undefined): AppLocale {
  if (!value) return 'en'
  const base = value.split('-')[0]?.toLowerCase()
  if (base === 'fil' || base === 'tl') return 'fil'
  return 'en'
}

export function getActiveLocale(): AppLocale {
  return normalizeLocale(i18n.language || i18n.resolvedLanguage)
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
      },
      fil: {
        common: filCommon,
      },
    },
    defaultNS: 'common',
    fallbackLng: 'en',
    supportedLngs: [...SUPPORTED_LOCALES],
    nonExplicitSupportedLngs: true,
    load: 'languageOnly',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  })

i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = normalizeLocale(lng)
})

document.documentElement.lang = normalizeLocale(i18n.language || i18n.resolvedLanguage)

export default i18n
