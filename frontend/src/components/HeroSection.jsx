import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { apiService } from '../services/api';

const HeroSection = () => {
  const { t } = useTranslation();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [conversionStatus, setConversionStatus] = useState('idle');
  const [conversionResult, setConversionResult] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('Rachel');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      const isConnected = await apiService.testConnection();
      setConnectionStatus(isConnected ? 'connected' : 'disconnected');
    } catch (error) {
      setConnectionStatus('disconnected');
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    try {
      setConversionStatus('uploading');
      setUploadProgress(0);
      setShowResults(false);

      const result = await apiService.uploadFileWithProgress(file, selectedVoice, selectedLanguage, (progress) => {
        setUploadProgress(progress);
      });

      if (result.success) {
        setConversionResult(result);
        setConversionStatus('completed');
        setShowResults(true);
      } else {
        setConversionStatus('error');
        alert('Error during conversion: ' + result.error);
      }
    } catch (error) {
      setConversionStatus('error');
      alert('Upload failed: ' + error.message);
    }
  };

  const handlePlayAudio = async () => {
    if (!conversionResult?.audioUrl) return;

    try {
      setIsPlaying(true);
      await apiService.playMp3(conversionResult.audioUrl);
    } catch (error) {
      alert('Error playing audio: ' + error.message);
    } finally {
      setIsPlaying(false);
    }
  };

  const handleDownloadMp3 = async () => {
    if (!conversionResult?.audioUrl) return;

    try {
      await apiService.downloadMp3(conversionResult.audioUrl, conversionResult.filename);
    } catch (error) {
      alert('Error downloading audio: ' + error.message);
    }
  };

  const resetConversion = () => {
    setConversionStatus('idle');
    setConversionResult(null);
    setShowResults(false);
    setUploadProgress(0);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      handleFileUpload(file);
    }
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white pt-20">
      {/* Background Elements Subtils */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Icons */}
        <div className="absolute top-20 left-10 text-blue-100 text-6xl animate-float-slow">
          📄
        </div>
        <div className="absolute top-40 right-20 text-indigo-100 text-4xl animate-float-medium">
          🎧
        </div>
        <div className="absolute bottom-40 left-20 text-purple-100 text-5xl animate-float-fast">
          🔊
        </div>
        <div className="absolute bottom-20 right-10 text-blue-100 text-3xl animate-float-slow">
          📱
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Status Badge */}
        <div className="absolute top-8 right-8 z-20">
          <div className={`inline-flex items-center px-4 py-2 rounded-full shadow-lg border ${
            connectionStatus === 'connected' 
              ? 'bg-green-50 border-green-200 text-green-700' 
              : connectionStatus === 'disconnected'
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-yellow-50 border-yellow-200 text-yellow-700'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
            } ${connectionStatus === 'checking' ? 'animate-pulse' : ''}`}></div>
            <span className="text-sm font-medium">
              {connectionStatus === 'connected' ? 'Backend Connected' : 
               connectionStatus === 'disconnected' ? 'Backend Disconnected' : 
               'Checking Connection...'}
            </span>
          </div>
        </div>

        {/* Animated Badge */}
        <div className="inline-flex items-center px-6 py-3 rounded-full bg-blue-100 text-blue-800 font-semibold text-sm mb-8 animate-fade-in-up">
          <span className="w-2 h-2 bg-blue-600 rounded-full mr-3 animate-pulse"></span>
          {t('hero.badge')}
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <span className="block">{t('hero.title.line1')}</span>
          <span className="block text-blue-600">{t('hero.title.line2')}</span>
        </h1>

        {/* Subheading */}
        <p className="text-xl md:text-2xl text-gray-700 mb-12 max-w-4xl mx-auto animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          {t('hero.subtitle')}
        </p>
        
        {/* Voice and Language Selection */}
        {!showResults && (
          <div className="max-w-4xl mx-auto mb-8 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Customize Your Audio</h3>
                <p className="text-gray-600">Choose the perfect voice and language for your document</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Voice Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4 text-center">Select Voice</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'Rachel', name: 'Rachel', gender: 'Female', accent: 'American', personality: 'Professional & Warm' },
                      { id: 'Domi', name: 'Domi', gender: 'Female', accent: 'American', personality: 'Energetic & Friendly' },
                      { id: 'Bella', name: 'Bella', gender: 'Female', accent: 'British', personality: 'Elegant & Clear' },
                      { id: 'Antoni', name: 'Antoni', gender: 'Male', accent: 'American', personality: 'Confident & Authoritative' },
                      { id: 'Thiago', name: 'Thiago', gender: 'Male', accent: 'Brazilian', personality: 'Warm & Engaging' },
                      { id: 'Josh', name: 'Josh', gender: 'Male', accent: 'American', personality: 'Casual & Approachable' }
                    ].map((voice) => (
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
                        
                        {/* Selection Indicator */}
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
                  
                  {/* Voice Preview */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Selected: {selectedVoice}
                        </p>
                        <p className="text-xs text-gray-600">
                          {[
                            { id: 'Rachel', personality: 'Professional & Warm' },
                            { id: 'Domi', personality: 'Energetic & Friendly' },
                            { id: 'Bella', personality: 'Elegant & Clear' },
                            { id: 'Antoni', personality: 'Confident & Authoritative' },
                            { id: 'Thiago', personality: 'Warm & Engaging' },
                            { id: 'Josh', personality: 'Casual & Approachable' }
                          ].find(v => v.id === selectedVoice)?.personality}
                        </p>
                      </div>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
                        Preview Voice
                      </button>
                    </div>
                  </div>
                </div>

                {/* Language Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4 text-center">Select Language</label>
                  <div className="space-y-3">
                    {[
                      { code: 'en', name: 'English', flag: '🇺🇸', description: 'Perfect for international documents' },
                      { code: 'fr', name: 'Français', flag: '🇫🇷', description: 'Ideal for French literature and business' },
                      { code: 'es', name: 'Español', flag: '🇪🇸', description: 'Great for Spanish content and reports' },
                      { code: 'de', name: 'Deutsch', flag: '🇩🇪', description: 'Excellent for German technical documents' },
                      { code: 'it', name: 'Italiano', flag: '🇮🇹', description: 'Perfect for Italian culture and business' }
                    ].map((lang) => (
                      <div
                        key={lang.code}
                        onClick={() => setSelectedLanguage(lang.code)}
                        className={`relative cursor-pointer rounded-xl p-4 border-2 transition-all duration-300 ${
                          selectedLanguage === lang.code
                            ? 'border-green-500 bg-green-50 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <span className="text-2xl">{lang.flag}</span>
                          <div className="flex-1">
                            <h4 className={`font-semibold ${
                              selectedLanguage === lang.code ? 'text-green-700' : 'text-gray-900'
                            }`}>
                              {lang.name}
                            </h4>
                            <p className="text-sm text-gray-600">{lang.description}</p>
                          </div>
                          
                          {/* Selection Indicator */}
                          {selectedLanguage === lang.code && (
                            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Language Info */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900">
                        Language: {selectedLanguage === 'en' ? 'English' : selectedLanguage === 'fr' ? 'Français' : selectedLanguage === 'es' ? 'Español' : selectedLanguage === 'de' ? 'Deutsch' : 'Italiano'}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        AI will automatically detect and adapt to your document's language
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Upload Area ou Résultats */}
        {!showResults ? (
          <div className={`relative max-w-2xl mx-auto mb-12 animate-fade-in-up`} style={{ animationDelay: '700ms' }}>
            <div className={`relative bg-white rounded-3xl p-12 shadow-2xl border-2 transition-all duration-500 ${
              isDragOver 
                ? 'border-blue-400 scale-105 shadow-blue-200/50' 
                : 'border-gray-200 hover:border-blue-300'
            }`}>
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-3xl blur-xl opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                {/* File Input */}
                <input 
                  type="file" 
                  accept=".pdf"
                  onChange={handleFileInput}
                  className="hidden"
                  id="pdf-upload"
                />
                
                {/* Upload Button */}
                <label 
                  htmlFor="pdf-upload" 
                  className={`group inline-flex items-center justify-center px-12 py-6 rounded-2xl font-bold text-xl transition-all duration-300 cursor-pointer ${
                    isUploading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-2xl hover:shadow-blue-500/25 transform hover:-translate-y-2'
                  }`}
                >
                  {isUploading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {conversionStatus || 'Processing...'}
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Upload PDF & Convert to Audio
                    </>
                  )}
                </label>

                {/* Progress Bar */}
                {isUploading && (
                  <div className="mt-6">
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 font-medium">
                      {uploadProgress.toFixed(0)}% Complete
                    </p>
                  </div>
                )}

                {/* Drag & Drop Text */}
                <p className="text-gray-600 mt-6 text-lg font-medium">
                  or drag and drop your PDF here
                </p>

                {/* File Types */}
                <div className="flex items-center justify-center mt-4 space-x-6 text-sm text-gray-500">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    PDF files
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Up to 50MB
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Secure & private
                  </span>
                </div>
              </div>
            </div>

            {/* File Selected Status */}
            {file && !isUploading && (
              <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 w-full max-w-md">
                <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200">
                  <div className="flex items-center justify-center mb-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-gray-900">{file.name}</h3>
                      <p className="text-sm text-gray-600">
                        {(file.size / 1024 / 1024).toFixed(2)} MB • Ready to convert
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Résultats de Conversion */
          <div className="max-w-2xl mx-auto mb-12 animate-fade-in-up">
            <div className="bg-white rounded-3xl p-12 shadow-2xl border-2 border-green-200">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Conversion Successful!</h3>
                <p className="text-gray-600">Your PDF has been converted to high-quality audio</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">Original File:</span>
                  <span className="text-gray-600">{conversionResult?.filename}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">Voice Used:</span>
                  <span className="text-gray-600">{selectedVoice}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">Language:</span>
                  <span className="text-gray-600">{selectedLanguage === 'en' ? 'English' : selectedLanguage === 'fr' ? 'Français' : selectedLanguage === 'es' ? 'Español' : selectedLanguage === 'de' ? 'Deutsch' : 'Italiano'}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handlePlayAudio}
                  disabled={isPlaying}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPlaying ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Playing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Listen to Audio
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleDownloadMp3}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download MP3
                </button>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={resetConversion}
                  className="text-gray-500 hover:text-gray-700 font-medium transition-colors duration-200"
                >
                  Convert another file
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Trust Indicators */}
        <div className="flex flex-wrap items-center justify-center space-x-8 text-gray-600 animate-fade-in-up" style={{ animationDelay: '900ms' }}>
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">99.9% Uptime</span>
          </div>
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-sm font-medium">Bank-level Security</span>
          </div>
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-sm font-medium">Lightning Fast</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection; 