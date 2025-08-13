import React, { useState, useRef } from 'react';
import { useTranslation } from '../hooks/useTranslation.jsx';
import { fileAPI } from '../services/api.js';

const FileSelector = ({ onFileSelected, onCancel }) => {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedVoice, setSelectedVoice] = useState('Rachel');
  const [selectedLanguage, setSelectedLanguage] = useState('fra');
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const voices = [
    { id: 'Rachel', name: 'Rachel', gender: 'Female', accent: 'American', personality: 'Professional & Warm' },
    { id: 'Domi', name: 'Domi', gender: 'Female', accent: 'American', personality: 'Energetic & Friendly' },
    { id: 'Bella', name: 'Bella', gender: 'Female', accent: 'British', personality: 'Elegant & Clear' },
    { id: 'Antoni', name: 'Antoni', gender: 'Male', accent: 'American', personality: 'Confident & Authoritative' },
    { id: 'Thiago', name: 'Thiago', gender: 'Male', accent: 'Brazilian', personality: 'Warm & Engaging' },
    { id: 'Josh', name: 'Josh', gender: 'Male', accent: 'American', personality: 'Casual & Approachable' }
  ];

  const languages = [
    { code: 'fra', name: 'Français', flag: '🇫🇷' },
    { code: 'eng', name: 'English', flag: '🇺🇸' },
    { code: 'spa', name: 'Español', flag: '🇪🇸' },
    { code: 'deu', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'ita', name: 'Italiano', flag: '🇮🇹' },
    { code: 'por', name: 'Português', flag: '🇵🇹' }
  ];

  const handleFileSelect = (file) => {
    try {
      setError('');
      fileAPI.validatePDF(file);
      setSelectedFile(file);
    } catch (error) {
      setError(error.message);
      setSelectedFile(null);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleSubmit = () => {
    if (!selectedFile) {
      setError('Veuillez sélectionner un fichier PDF');
      return;
    }

    const project = fileAPI.createProjectFromFile(selectedFile, selectedVoice, selectedLanguage);
    onFileSelected(project);
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setError('');
    onCancel?.();
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Sélectionner votre fichier PDF
        </h2>
        <p className="text-gray-600">
          Choisissez un document PDF et configurez les options de conversion
        </p>
      </div>

      {/* Zone de glisser-déposer */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          dragOver
            ? 'border-blue-400 bg-blue-50'
            : selectedFile
            ? 'border-green-400 bg-green-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileInput}
          className="hidden"
        />

        {!selectedFile ? (
          <div>
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-900 mb-2">
              Glissez votre PDF ici ou cliquez pour sélectionner
            </p>
            <p className="text-gray-500">
              Formats supportés : PDF (max 100 MB)
            </p>
          </div>
        ) : (
          <div>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-900 mb-2">
              {selectedFile.name}
            </p>
            <p className="text-gray-500">
              {fileAPI.formatFileSize(selectedFile.size)}
            </p>
          </div>
        )}
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Configuration des options */}
      {selectedFile && (
        <div className="mt-8 space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Configuration de la conversion
          </h3>

          {/* Sélection de la voix */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Sélectionner la voix
            </label>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {voices.map((voice) => (
                <div
                  key={voice.id}
                  onClick={() => setSelectedVoice(voice.id)}
                  className={`relative cursor-pointer rounded-xl p-4 border-2 transition-all duration-300 ${
                    selectedVoice === voice.id
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-center">
                    <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                      selectedVoice === voice.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </div>
                    <h4 className={`font-semibold text-sm ${
                      selectedVoice === voice.id ? 'text-blue-700' : 'text-gray-900'
                    }`}>
                      {voice.name}
                    </h4>
                    <p className="text-xs text-gray-500">{voice.gender}</p>
                    <p className="text-xs text-gray-400">{voice.accent}</p>
                  </div>
                  
                  {/* Indicateur de sélection */}
                  {selectedVoice === voice.id && (
                    <div className="absolute top-2 right-2">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sélection de la langue */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Langue du document
            </label>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {languages.map((lang) => (
                <div
                  key={lang.code}
                  onClick={() => setSelectedLanguage(lang.code)}
                  className={`relative cursor-pointer rounded-lg p-3 border-2 transition-all duration-300 ${
                    selectedLanguage === lang.code
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{lang.flag}</span>
                    <span className={`font-medium ${
                      selectedLanguage === lang.code ? 'text-blue-700' : 'text-gray-900'
                    }`}>
                      {lang.name}
                    </span>
                  </div>
                  
                  {selectedLanguage === lang.code && (
                    <div className="absolute top-2 right-2">
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              L'IA détectera automatiquement la langue si elle diffère de votre sélection
            </p>
          </div>
        </div>
      )}

      {/* Boutons d'action */}
      <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={handleCancel}
          className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
        >
          Annuler
        </button>
        <button
          onClick={handleSubmit}
          disabled={!selectedFile}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            selectedFile
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Commencer la conversion
        </button>
      </div>
    </div>
  );
};

export default FileSelector; 