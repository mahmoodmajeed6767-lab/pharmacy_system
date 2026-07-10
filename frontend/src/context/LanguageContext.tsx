import { createContext, useState, useMemo, useEffect, ReactNode, useContext } from 'react';
import { getTranslations } from '../translations';

interface LanguageContextType {
  lang: string;
  setLang: (code: string) => void;
  t: ReturnType<typeof getTranslations>;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: getTranslations('en'),
});

const RTL_LANGS = ['ar', 'ur'];

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem('app_lang') || 'en';
  });

  const setLang = (code: string) => {
    localStorage.setItem('app_lang', code);
    setLangState(code);
  };

  const t = useMemo(() => getTranslations(lang), [lang]);
  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);

  // Set dir attribute on <html> for RTL languages
  useEffect(() => {
    const isRTL = RTL_LANGS.includes(lang);
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
