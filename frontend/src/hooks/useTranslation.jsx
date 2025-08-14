import { useState, useEffect, createContext, useContext } from 'react';
import { navTranslations } from '../locales/translations-nav.js';
import { heroTranslations } from '../locales/translations-hero.js';

// Contexte pour la langue
const LanguageContext = createContext();

// Hook personnalisé pour utiliser les traductions
export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  
  const { currentLanguage, setLanguage, t } = context;
  
  return {
    currentLanguage,
    setLanguage,
    t
  };
};

// Fonction de traduction simplifiée - anglais uniquement
const translate = (key) => {
  console.log(`🔍 Translation requested: "${key}"`);
  
  const keys = key.split('.');
  console.log('🔑 Keys decomposed:', keys);
  
  let translations = null;
  
  // Select the correct translation file
  if (keys[0] === 'nav') {
    translations = navTranslations.en;
    console.log('📁 Nav file selected:', translations);
  } else if (keys[0] === 'hero') {
    translations = heroTranslations.en;
    console.log('📁 Hero file selected:', translations);
  } else {
    console.warn('⚠️ Unknown section:', keys[0]);
    return key;
  }
  
  let value = translations;
  console.log('🌍 Translations for English:', value);
  
  // Navigate through nested keys
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    console.log(`🔍 Searching for key "${k}" in:`, value);
    
    if (value && typeof value === 'object' && value[k] !== undefined) {
      value = value[k];
      console.log(`✅ Value found:`, value);
    } else {
      console.warn(`❌ Key "${k}" not found in:`, value);
      break;
    }
  }
  
  // Check final result
  if (value && typeof value === 'string') {
    console.log(`🎯 Final translation: "${value}"`);
    return value;
  } else {
    console.warn(`❌ Invalid result:`, value);
    return key; // Return the key if no translation found
  }
};

// Provider du contexte de langue - anglais forcé
export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  // Function to change language (kept for compatibility but always returns English)
  const setLanguage = (language) => {
    console.log(`🌍 Language change requested: ${language} → forced to English`);
    setCurrentLanguage('en');
    
    // Update document lang attribute
    document.documentElement.lang = 'en';
    
    // Update page title
    document.title = 'ReadCast - AI-Powered PDF to Audio Conversion';
  };

  // Translation function
  const t = (key) => translate(key);

  // Effect to initialize language
  useEffect(() => {
    console.log(`🚀 Initializing language: English only`);
    setLanguage('en');
  }, []);

  const value = {
    currentLanguage,
    setLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook pour obtenir la langue actuelle
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context.currentLanguage;
}; 