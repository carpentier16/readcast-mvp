import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation.jsx';

const PDFExtractor = ({ file, onExtractionComplete, onError }) => {
  const { t } = useTranslation();
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [extractionStatus, setExtractionStatus] = useState('idle');
  const [extractedText, setExtractedText] = useState('');
  const [documentInfo, setDocumentInfo] = useState(null);

  useEffect(() => {
    if (file && extractionStatus === 'idle') {
      startExtraction();
    }
  }, [file]);

  const startExtraction = async () => {
    if (!file) return;

    setExtractionStatus('extracting');
    setExtractionProgress(0);

    try {
      // Simuler l'extraction avec une barre de progression
      const totalSteps = 5;
      let currentStep = 0;

      const updateProgress = () => {
        currentStep++;
        const progress = (currentStep / totalSteps) * 100;
        setExtractionProgress(progress);

        if (currentStep >= totalSteps) {
          completeExtraction();
        } else {
          setTimeout(updateProgress, 800);
        }
      };

      // Démarrer l'extraction
      setTimeout(updateProgress, 500);

    } catch (error) {
      console.error('Erreur lors de l\'extraction:', error);
      setExtractionStatus('error');
      onError?.(error);
    }
  };

  const completeExtraction = () => {
    setExtractionProgress(100);
    setExtractionStatus('completed');
    
    // Simuler les informations du document extrait
    const info = {
      title: file.name.replace('.pdf', ''),
      pages: Math.floor(Math.random() * 50) + 10,
      wordCount: Math.floor(Math.random() * 10000) + 5000,
      language: 'en',
      extractedAt: new Date().toISOString()
    };
    
    setDocumentInfo(info);
    setExtractedText(`Document extrait avec succès: ${info.title} (${info.pages} pages, ${info.wordCount} mots)`);
    
    onExtractionComplete?.(info);
  };

  const getStatusText = () => {
    switch (extractionStatus) {
      case 'idle':
        return 'Prêt à extraire';
      case 'extracting':
        return 'Extraction en cours...';
      case 'completed':
        return 'Extraction terminée';
      case 'error':
        return 'Erreur lors de l\'extraction';
      default:
        return '';
    }
  };

  const getStatusColor = () => {
    switch (extractionStatus) {
      case 'idle':
        return 'text-gray-500';
      case 'extracting':
        return 'text-blue-600';
      case 'completed':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  if (!file) return null;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900">
          Extraction PDF en cours
        </h3>
        <div className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </div>
      </div>

      {/* Barre de progression */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progression</span>
          <span>{Math.round(extractionProgress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${extractionProgress}%` }}
          ></div>
        </div>
      </div>

      {/* Informations du document */}
      {documentInfo && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-gray-900 mb-2">Informations du document</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Titre:</span>
              <span className="ml-2 font-medium">{documentInfo.title}</span>
            </div>
            <div>
              <span className="text-gray-600">Pages:</span>
              <span className="ml-2 font-medium">{documentInfo.pages}</span>
            </div>
            <div>
              <span className="text-gray-600">Mots:</span>
              <span className="ml-2 font-medium">{documentInfo.wordCount.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-600">Langue:</span>
              <span className="ml-2 font-medium">{documentInfo.language.toUpperCase()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Statut détaillé */}
      {extractionStatus === 'extracting' && (
        <div className="text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <span>Analyse de la structure du document...</span>
          </div>
        </div>
      )}

      {extractionStatus === 'completed' && (
        <div className="text-sm text-green-600">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
            <span>Document prêt pour la conversion audio</span>
          </div>
        </div>
      )}

      {extractionStatus === 'error' && (
        <div className="text-sm text-red-600">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-600 rounded-full"></div>
            <span>Erreur lors de l'extraction. Veuillez réessayer.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFExtractor; 