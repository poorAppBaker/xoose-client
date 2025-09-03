import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import JSON files
import en from './locales/en.json';
import it from './locales/it.json';

// Create i18n instance
const i18n = new I18n();

// Set translations
i18n.translations = {
  en,
  it,
};

// Configuration
i18n.defaultLocale = 'en';
i18n.enableFallback = true;

// Set initial locale
const setInitialLocale = async (): Promise<void> => {
  try {
    const savedLocale = await AsyncStorage.getItem('userLocale');
    
    if (savedLocale && i18n.translations[savedLocale]) {
      i18n.locale = savedLocale;
    } else {
      const deviceLocale = Localization.locale.split('-')[0];
      i18n.locale = deviceLocale === 'it' ? 'it' : 'en';
    }
  } catch (error) {
    console.warn('Error setting initial locale:', error);
    i18n.locale = 'en';
  }
};

setInitialLocale();

// Change language function
export const changeLanguage = async (locale: string): Promise<void> => {
  try {
    i18n.locale = locale;
    await AsyncStorage.setItem('userLocale', locale);
  } catch (error) {
    console.warn('Error changing language:', error);
  }
};

export const getCurrentLocale = (): string => i18n.locale;
export const getAvailableLocales = (): string[] => Object.keys(i18n.translations);

export default i18n;