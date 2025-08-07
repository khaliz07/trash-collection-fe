'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';

// ĐẢM BẢO chỉ init 1 lần
if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .use(
      resourcesToBackend((language: string, namespace: string) =>
        import(`../public/locales/${language}/${namespace}.json`)
      )
    )
    .init({
      lng: 'vi', // Hoặc bạn lấy từ cookie / localStorage
      fallbackLng: 'vi',
      ns: ['common'],
      defaultNS: 'common',
      interpolation: { escapeValue: false },
      react: { useSuspense: false },
    });
}

export default i18n;
