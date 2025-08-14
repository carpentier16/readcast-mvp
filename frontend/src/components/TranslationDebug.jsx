import React from 'react';
import { useTranslation } from '../hooks/useTranslation.jsx';

const TranslationDebug = () => {
  const { t, currentLanguage } = useTranslation();

  const testKeys = [
    'nav.signIn',
    'nav.getStarted',
    'nav.features',
    'nav.pricing',
    'nav.about',
    'nav.language'
  ];

  return (
    <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-4 m-4">
      <h3 className="font-bold text-yellow-800 mb-2">🐛 Debug Traductions</h3>
      <p className="text-yellow-700 mb-2">Langue actuelle: {currentLanguage}</p>
      
      <div className="space-y-2">
        {testKeys.map(key => (
          <div key={key} className="text-sm">
            <strong>{key}:</strong> <span className="text-yellow-600">"{t(key)}"</span>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-2 bg-white rounded border">
        <h4 className="font-semibold text-yellow-800 mb-2">Données brutes:</h4>
        <pre className="text-xs text-yellow-700 overflow-auto">
          {JSON.stringify({
            currentLanguage,
            navTranslations: require('../locales/translations-nav.js').navTranslations,
            heroTranslations: require('../locales/translations-hero.js').heroTranslations
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default TranslationDebug; 