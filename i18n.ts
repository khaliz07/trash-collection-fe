import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';

// Dynamic import các file dịch trong public/locales
// Hỗ trợ cả 'vi' và 'en', namespace 'common'
i18n
  .use(initReactI18next)
  .use(
    resourcesToBackend((language: string, namespace: string) =>
      import(`./public/locales/${language}/${namespace}.json`)
    )
  )
  .init({
    lng: 'vi',
    fallbackLng: 'vi',
    ns: ['common'],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

export default i18n; 