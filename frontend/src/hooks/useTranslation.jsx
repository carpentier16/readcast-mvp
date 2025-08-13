import { useState, useEffect, createContext, useContext } from 'react';
import { translations } from '../locales/translations.js';

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

// Fonction de traduction
const translate = (key, language) => {
  const keys = key.split('.');
  let value = translations[language];
  
  for (const k of keys) {
    if (value && value[k] !== undefined) {
      value = value[k];
    } else {
      // Fallback vers l'anglais si la traduction n'existe pas
      let fallbackValue = translations.en;
      for (const fallbackKey of keys) {
        if (fallbackValue && fallbackValue[fallbackKey] !== undefined) {
          fallbackValue = fallbackValue[fallbackKey];
        } else {
          return key; // Retourne la clé si aucune traduction n'est trouvée
        }
      }
      return fallbackValue;
    }
  }
  
  return value || key;
};

// Provider du contexte de langue
export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // Récupérer la langue depuis le localStorage ou utiliser l'anglais par défaut
    const savedLanguage = localStorage.getItem('readcast-language');
    return savedLanguage || 'en';
  });

  // Fonction pour changer la langue
  const setLanguage = (language) => {
    setCurrentLanguage(language);
    localStorage.setItem('readcast-language', language);
    
    // Mettre à jour l'attribut lang du document HTML
    document.documentElement.lang = language;
    
    // Optionnel : Mettre à jour le titre de la page
    const titles = {
      en: 'ReadCast - AI-Powered PDF to Audio Conversion',
      fr: 'ReadCast - Conversion PDF vers Audio par IA',
      es: 'ReadCast - Conversión de PDF a Audio con IA'
    };
    document.title = titles[language] || titles.en;
  };

  // Fonction de traduction
  const t = (key) => translate(key, currentLanguage);

  // Effet pour initialiser la langue
  useEffect(() => {
    setLanguage(currentLanguage);
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