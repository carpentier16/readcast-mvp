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

// Fonction de traduction
const translate = (key, language) => {
  const keys = key.split('.');
  let value = null;
  
  // Essayer de trouver la traduction dans les fichiers séparés
  if (keys[0] === 'nav') {
    value = navTranslations[language];
  } else if (keys[0] === 'hero') {
    value = heroTranslations[language];
  }
  
  if (value) {
    // Commencer par le deuxième élément car le premier est le nom de la section
    for (let i = 1; i < keys.length; i++) {
      const k = keys[i];
      if (value && value[k] !== undefined) {
        value = value[k];
      } else {
        break;
      }
    }
    if (value && typeof value === 'string') {
      return value;
    }
  }
  
  // Fallback vers l'anglais si la traduction n'existe pas
  let fallbackValue = null;
  if (keys[0] === 'nav') {
    fallbackValue = navTranslations.en;
  } else if (keys[0] === 'hero') {
    fallbackValue = heroTranslations.en;
  }
  
  if (fallbackValue) {
    // Commencer par le deuxième élément car le premier est le nom de la section
    for (let i = 1; i < keys.length; i++) {
      const k = keys[i];
      if (fallbackValue && fallbackValue[k] !== undefined) {
        fallbackValue = fallbackValue[k];
      } else {
        break;
      }
    }
    if (fallbackValue && typeof fallbackValue === 'string') {
      return fallbackValue;
    }
  }
  
  return key; // Retourne la clé si aucune traduction n'est trouvée
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