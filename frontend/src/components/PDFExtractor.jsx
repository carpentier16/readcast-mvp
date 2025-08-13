import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation.jsx';
import { jobsAPI, projectsAPI, fileAPI, errorHandler } from '../services/api.js';

const PDFExtractor = ({ file, onExtractionComplete, onError }) => {
  const { t } = useTranslation();
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [extractionStatus, setExtractionStatus] = useState('idle');
  const [extractedText, setExtractedText] = useState('');
  const [documentInfo, setDocumentInfo] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [stopListening, setStopListening] = useState(null);

  useEffect(() => {
    if (file && extractionStatus === 'idle') {
      startExtraction();
    }

    // Cleanup function
    return () => {
      if (stopListening) {
        stopListening();
      }
    };
  }, [file]);

  const startExtraction = async () => {
    if (!file) return;

    try {
      // Valider le fichier PDF
      fileAPI.validatePDF(file);
      
      setExtractionStatus('extracting');
      setExtractionProgress(0);

      // Créer le job de conversion
      const job = await jobsAPI.createJob(file, 'Rachel', 'fra');
      setJobId(job.id);

      // Commencer l'écoute des événements en temps réel
      const stopEvents = jobsAPI.getJobEvents(
        job.id,
        handleJobUpdate,
        handleJobError
      );
      
      setStopListening(() => stopEvents);

    } catch (error) {
      console.error('Erreur lors de l\'extraction:', error);
      const errorInfo = errorHandler.handleAPIError(error, 'extraction');
      setExtractionStatus('error');
      onError?.(errorInfo);
      errorHandler.showError(errorInfo.message);
    }
  };

  const handleJobUpdate = (data) => {
    try {
      // Extraire la progression depuis le message d'erreur (astuce du backend)
      if (data.error && data.error.startsWith('PROGRESS::')) {
        const progress = parseInt(data.error.split('::')[1]);
        setExtractionProgress(progress);
      }

      // Mettre à jour le statut
      if (data.status === 'done') {
        completeExtraction(data);
      } else if (data.status === 'error') {
        handleJobError(new Error(data.error || 'Erreur de conversion'));
      }
    } catch (error) {
      console.error('Erreur parsing mise à jour job:', error);
    }
  };

  const handleJobError = (error) => {
    console.error('Erreur job:', error);
    setExtractionStatus('error');
    onError?.(error);
    errorHandler.showError('Erreur lors de la conversion PDF');
  };

  const completeExtraction = (jobData) => {
    setExtractionProgress(100);
    setExtractionStatus('completed');
    
    // Créer les informations du document
    const info = {
      title: file.name.replace('.pdf', ''),
      pages: Math.floor(Math.random() * 50) + 10, // Simulé pour l'instant
      wordCount: Math.floor(Math.random() * 10000) + 5000, // Simulé pour l'instant
      language: 'fra',
      extractedAt: new Date().toISOString(),
      jobId: jobId,
      mp3Url: jobData.mp3,
      m4bUrl: jobData.m4b
    };
    
    setDocumentInfo(info);
    setExtractedText(`Document extrait avec succès: ${info.title} (${info.pages} pages, ${info.wordCount} mots)`);
    
    // Créer et sauvegarder le projet
    const project = {
      id: jobId,
      title: info.title,
      pages: info.pages,
      wordCount: info.wordCount,
      language: info.language,
      fileSize: file.size,
      status: 'completed',
      createdAt: new Date().toISOString(),
      extractedAt: info.extractedAt,
      audioUrl: jobData.mp3,
      audioDuration: Math.floor(Math.random() * 1800) + 300, // Simulé pour l'instant
      jobId: jobId
    };
    
    projectsAPI.saveProject(project);
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

  const getProgressText = () => {
    if (extractionStatus === 'extracting') {
      if (extractionProgress < 30) {
        return 'Upload du fichier PDF...';
      } else if (extractionProgress < 60) {
        return 'Analyse de la structure du document...';
      } else if (extractionProgress < 90) {
        return 'Extraction du texte et conversion audio...';
      } else {
        return 'Finalisation...';
      }
    }
    return '';
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

      {/* Statut détaillé */}
      {extractionStatus === 'extracting' && (
        <div className="text-sm text-gray-600 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <span>{getProgressText()}</span>
          </div>
        </div>
      )}

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
          
          {/* Liens de téléchargement */}
          {documentInfo.mp3Url && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h5 className="font-medium text-gray-900 mb-2">Fichiers audio générés</h5>
              <div className="flex gap-3">
                <a
                  href={documentInfo.mp3Url}
                  download={`${documentInfo.title}.mp3`}
                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Télécharger MP3
                </a>
                
                {documentInfo.m4bUrl && (
                  <a
                    href={documentInfo.m4bUrl}
                    download={`${documentInfo.title}.m4b`}
                    className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Télécharger M4B
                  </a>
                )}
              </div>
            </div>
          )}
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