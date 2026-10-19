import { useCallback, useEffect, useMemo, useState } from 'react';
import LanguageContext from './LanguageContextValue.js';
import { translateText } from '../utils/translations';
const STORAGE_KEY = 'pem-language';

// The dictionary is deliberately local and dependency-free: language changes
// don't introduce another runtime package or affect API payloads/database data.



export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'vi' ? 'vi' : 'en';
    } catch {
      return 'en';
    }
  });

  const setLanguage = useCallback((nextLanguage) => {
    const safeLanguage = nextLanguage === 'vi' ? 'vi' : 'en';
    setLanguageState(safeLanguage);
    try {
      localStorage.setItem(STORAGE_KEY, safeLanguage);
    } catch {
      // Private browsing/storage-disabled environments still work for the session.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = useCallback((text) => {
    return translateText(text, language);
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}



