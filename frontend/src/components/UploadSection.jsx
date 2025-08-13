import React, { useState, useRef } from 'react';

export const UploadSection = ({ onFileUpload, isUploading }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file) => {
    if (!file.type.includes('pdf')) {
      alert('Veuillez sélectionner un fichier PDF');
      return;
    }
    
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      alert('Le fichier est trop volumineux (max 50MB)');
      return;
    }
    
    onFileUpload(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm border-2 border-blue-300 rounded-3xl p-10 text-center shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/30 hover:-translate-y-2">
      <div 
        className={`transition-all ${isDragOver ? 'scale-110' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-800 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-4xl">
          📖
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          {isUploading ? 'Upload en cours...' : 'Nouveau Audiobook'}
        </h2>
        
        <p className="text-gray-600 mb-6 leading-relaxed">
          Glissez votre manuscrit ici ou cliquez pour sélectionner<br />
          <span className="text-sm">Formats acceptés: PDF (max 50MB)</span>
        </p>
        
        <button
          onClick={handleButtonClick}
          disabled={isUploading}
          className="bg-gradient-to-r from-blue-500 to-blue-800 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all hover:shadow-lg hover:shadow-blue-500/40 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? 'Upload...' : 'Choisir un fichier'}
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleInputChange}
          className="hidden"
        />
      </div>
    </div>
  );
};
