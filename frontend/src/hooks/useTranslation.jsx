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

// Fonction de traduction simplifiée et robuste
const translate = (key, language) => {
  console.log(`🔍 Traduction demandée: "${key}" en "${language}"`);
  
  const keys = key.split('.');
  console.log('🔑 Clés décomposées:', keys);
  
  let translations = null;
  
  // Sélectionner le bon fichier de traductions
  if (keys[0] === 'nav') {
    translations = navTranslations;
    console.log('📁 Fichier nav sélectionné:', translations);
  } else if (keys[0] === 'hero') {
    translations = heroTranslations;
    console.log('📁 Fichier hero sélectionné:', translations);
  } else {
    console.warn('⚠️ Section inconnue:', keys[0]);
    return key;
  }
  
  // Vérifier que la langue existe
  if (!translations[language]) {
    console.warn(`⚠️ Langue "${language}" non trouvée, fallback vers "en"`);
    language = 'en';
  }
  
  let value = translations[language];
  console.log('🌍 Traductions pour la langue:', value);
  
  // Naviguer dans les clés imbriquées
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    console.log(`🔍 Recherche de la clé "${k}" dans:`, value);
    
    if (value && typeof value === 'object' && value[k] !== undefined) {
      value = value[k];
      console.log(`✅ Valeur trouvée:`, value);
    } else {
      console.warn(`❌ Clé "${k}" non trouvée dans:`, value);
      break;
    }
  }
  
  // Vérifier le résultat final
  if (value && typeof value === 'string') {
    console.log(`🎯 Traduction finale: "${value}"`);
    return value;
  } else {
    console.warn(`❌ Résultat invalide:`, value);
    // Fallback vers l'anglais
    return translateFallback(key, 'en');
  }
};

// Fallback vers l'anglais
const translateFallback = (key, language) => {
  console.log(`🔄 Fallback vers l'anglais pour: "${key}"`);
  
  const keys = key.split('.');
  let translations = null;
  
  if (keys[0] === 'nav') {
    translations = navTranslations.en;
  } else if (keys[0] === 'hero') {
    translations = heroTranslations.en;
  } else {
    return key;
  }
  
  let value = translations;
  
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (value && typeof value === 'object' && value[k] !== undefined) {
      value = value[k];
    } else {
      break;
    }
  }
  
  if (value && typeof value === 'string') {
    console.log(`🔄 Fallback réussi: "${value}"`);
    return value;
  }
  
  console.error(`💥 Fallback échoué, retour de la clé: "${key}"`);
  return key;
};

// Provider du contexte de langue
export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // Récupérer la langue depuis le localStorage ou utiliser le français par défaut
    const savedLanguage = localStorage.getItem('readcast-language');
    return savedLanguage || 'fr';
  });

  // Fonction pour changer la langue
  const setLanguage = (language) => {
    console.log(`🌍 Changement de langue: ${currentLanguage} → ${language}`);
    setCurrentLanguage(language);
    localStorage.setItem('readcast-language', language);
    
    // Mettre à jour l'attribut lang du document HTML
    document.documentElement.lang = language;
    
    // Mettre à jour le titre de la page
    const titles = {
      en: 'ReadCast - AI-Powered PDF to Audio Conversion',
      fr: 'ReadCast - Conversion PDF vers Audio par IA',
      es: 'ReadCast - Conversión de PDF a Audio con IA'
    };
    document.title = titles[language] || titles.fr;
  };

  // Fonction de traduction
  const t = (key) => translate(key, currentLanguage);

  // Effet pour initialiser la langue
  useEffect(() => {
    console.log(`🚀 Initialisation de la langue: ${currentLanguage}`);
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