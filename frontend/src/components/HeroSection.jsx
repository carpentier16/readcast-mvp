import React, { useState, useCallback, useEffect } from 'react';
import apiService from '../services/api.js';

const HeroSection = () => {
  const [file, setFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentText, setCurrentText] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [conversionStatus, setConversionStatus] = useState('');
  const [conversionResult, setConversionResult] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('Rachel');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showResults, setShowResults] = useState(false);

  const texts = [
    "The world's most trusted PDF to audio converter",
    "Transform any document into crystal-clear audio",
    "AI-powered voice synthesis that sounds human"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentText((prev) => (prev + 1) % texts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [texts.length]);

  // Vérifier la connexion au backend
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const result = await apiService.testConnection();
        setConnectionStatus(result.connected ? 'connected' : 'disconnected');
      } catch (error) {
        setConnectionStatus('disconnected');
      }
    };
    
    checkConnection();
  }, []);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      handleFileUpload(selectedFile);
    }
  };

  const handleFileUpload = async (file) => {
    setIsUploading(true);
    setUploadProgress(0);
    setConversionStatus('');
    setConversionResult(null);
    setShowResults(false);
    
    try {
      // Simuler la conversion pour le moment (car le backend n'est pas encore déployé)
      setConversionStatus('Creating conversion job...');
      setUploadProgress(10);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setConversionStatus('File uploaded successfully!');
      setUploadProgress(30);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setConversionStatus('Converting PDF to audio...');
      setUploadProgress(60);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      setConversionStatus('Conversion completed!');
      setUploadProgress(100);
      
      // Simuler le résultat de conversion
      const mockResult = {
        jobId: 'mock-job-123',
        status: 'done',
        mp3Url: 'https://example.com/mock-audio.mp3',
        m4bUrl: 'https://example.com/mock-audiobook.m4b',
        filename: file.name
      };
      
      setConversionResult(mockResult);
      setShowResults(true);
      setIsUploading(false);
      
    } catch (error) {
      console.error('Upload/Conversion error:', error);
      setIsUploading(false);
      setUploadProgress(0);
      setConversionStatus(`Error: ${error.message}`);
    }
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      handleFileUpload(droppedFile);
    }
  }, []);

  const handlePlayAudio = async () => {
    if (!conversionResult?.mp3Url) return;
    
    try {
      setIsPlaying(true);
      // Simuler la lecture audio
      await new Promise(resolve => setTimeout(resolve, 3000));
      setIsPlaying(false);
      alert('Audio playback simulation completed!');
    } catch (error) {
      console.error('Playback error:', error);
      setIsPlaying(false);
    }
  };

  const handleDownloadMp3 = async () => {
    if (!conversionResult?.mp3Url) return;
    
    try {
      // Simuler le téléchargement
      const link = document.createElement('a');
      link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent('Mock MP3 file content');
      link.download = conversionResult.filename.replace('.pdf', '.mp3');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert('MP3 download simulation completed!');
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const resetConversion = () => {
    setFile(null);
    setConversionResult(null);
    setConversionStatus('');
    setUploadProgress(0);
    setIsUploading(false);
    setShowResults(false);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-white via-blue-50 to-indigo-100 pt-20">
      {/* Background Elements Subtils */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-100/40 to-indigo-100/40 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-100/40 to-purple-100/40 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-50/30 to-indigo-50/30 rounded-full blur-3xl"></div>
      </div>

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

      {/* Floating Icons Subtils */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 animate-float-slow">
          <div className="w-16 h-16 bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-100 shadow-lg flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
        <div className="absolute top-40 right-32 animate-float-medium">
          <div className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-xl border border-indigo-100 shadow-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
        </div>
        <div className="absolute bottom-32 left-32 animate-float-fast">
          <div className="w-20 h-20 bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-100 shadow-lg flex items-center justify-center">
            <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Animated Badge */}
        <div className="inline-flex items-center px-6 py-3 bg-white/90 backdrop-blur-sm border border-blue-200 rounded-full shadow-lg mb-8 animate-fade-in-up">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
          <span className="text-sm font-semibold text-gray-800">Trusted by 10,000+ users worldwide</span>
        </div>

        {/* Main Heading with Typewriter Effect */}
        <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
          <span className="block text-gray-900 mb-4">
            {texts[currentText].split(' ').map((word, index) => (
              <span
                key={index}
                className="inline-block mr-4 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {word}
              </span>
            ))}
          </span>
          <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            AI-Powered
          </span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-gray-700 mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          Experience the future of document consumption. Our advanced AI transforms any PDF into 
          natural-sounding audio with multiple voice options and professional quality.
        </p>
        
        {/* Voice and Language Selection */}
        {!showResults && (
          <div className="max-w-2xl mx-auto mb-8 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Voice</label>
                  <select 
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Rachel">Rachel (Female)</option>
                    <option value="Domi">Domi (Female)</option>
                    <option value="Bella">Bella (Female)</option>
                    <option value="Antoni">Antoni (Male)</option>
                    <option value="Thiago">Thiago (Male)</option>
                    <option value="Josh">Josh (Male)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select 
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="en">🇺🇸 English</option>
                    <option value="fr">🇫🇷 Français</option>
                    <option value="es">🇪🇸 Español</option>
                    <option value="de">🇩🇪 Deutsch</option>
                    <option value="it">🇮🇹 Italiano</option>
                  </select>
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
                  onChange={handleFileChange}
                  className="hidden"
                  id="pdf-upload"
                  disabled={isUploading}
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