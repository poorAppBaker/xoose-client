import { useState, useEffect } from 'react';
import i18n, { changeLanguage, getCurrentLocale } from '../i18n';

export const useTranslation = () => {
  const [locale, setLocale] = useState(getCurrentLocale());

  const t = (key: string, options?: any): string => {
    return i18n.t(key, options);
  };

  const changeLanguageHandler = async (newLocale: string): Promise<void> => {
    await changeLanguage(newLocale);
    setLocale(newLocale);
  };

  useEffect(() => {
    setLocale(getCurrentLocale());
  }, []);

  return {
    t,
    locale,
    changeLanguage: changeLanguageHandler,
  };
};