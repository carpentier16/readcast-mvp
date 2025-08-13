import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation.jsx';
import { projectsAPI, jobsAPI } from '../services/api.js';
import PDFExtractor from './PDFExtractor.jsx';
import ProjectHistory from './ProjectHistory.jsx';
import AudioPlayer from './AudioPlayer.jsx';
import FileSelector from './FileSelector.jsx';

const ProjectManager = () => {
  const { t } = useTranslation();
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [activeAudioUrl, setActiveAudioUrl] = useState(null);
  const [activeAudioTitle, setActiveAudioTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Charger les projets depuis le localStorage au démarrage
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    const savedProjects = projectsAPI.getProjects();
    setProjects(savedProjects);
  };

  const handleFileSelected = (project) => {
    setCurrentProject(project);
  };

  const handleExtractionComplete = (documentInfo) => {
    // Le projet est déjà créé et sauvegardé par PDFExtractor
    // On recharge juste la liste
    loadProjects();
    setCurrentProject(null);
  };

  const handleProjectSelect = (project) => {
    if (project.audioUrl) {
      setActiveAudioUrl(project.audioUrl);
      setActiveAudioTitle(project.title);
    }
  };

  const handleProjectDelete = (projectId) => {
    projectsAPI.deleteProject(projectId);
    loadProjects();
    
    // Si le projet supprimé était en cours d'écoute, arrêter l'audio
    if (currentProject?.id === projectId) {
      setCurrentProject(null);
    }
  };

  const handleAudioClose = () => {
    setActiveAudioUrl(null);
    setActiveAudioTitle('');
  };

  const handleAudioPlay = () => {
    console.log('Lecture audio démarrée');
  };

  const handleAudioPause = () => {
    console.log('Lecture audio mise en pause');
  };

  const handleAudioSeek = (time) => {
    console.log('Navigation audio vers:', time);
  };

  const startNewProject = () => {
    setCurrentProject({ id: 'new', title: 'Nouveau Document' });
  };

  const cancelProject = () => {
    setCurrentProject(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* En-tête avec navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestionnaire de Projets</h1>
          <p className="text-gray-600 mt-2">
            Gérez vos conversions PDF vers audio et accédez à votre historique
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              showHistory 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {showHistory ? 'Nouveau Projet' : 'Voir l\'Historique'}
          </button>
        </div>
      </div>

      {/* Contenu principal */}
      {!showHistory ? (
        <div className="space-y-6">
          {/* Zone de téléchargement et extraction */}
          {currentProject ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Nouveau Projet : {currentProject.title}
                </h2>
                <button
                  onClick={cancelProject}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Annuler
                </button>
              </div>
              
              {currentProject.originalFile ? (
                <PDFExtractor
                  file={currentProject.originalFile}
                  onExtractionComplete={handleExtractionComplete}
                  onError={(error) => {
                    console.error('Erreur d\'extraction:', error);
                    setCurrentProject(null);
                  }}
                />
              ) : (
                <FileSelector
                  onFileSelected={handleFileSelected}
                  onCancel={cancelProject}
                />
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Commencer un nouveau projet
              </h3>
              <p className="text-gray-600 mb-6">
                Téléchargez un PDF pour commencer la conversion vers audio
              </p>
              <button
                onClick={startNewProject}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Commencer
              </button>
            </div>
          )}

          {/* Projets récents */}
          {projects.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Projets Récents</h2>
              <div className="grid gap-4">
                {projects.slice(0, 3).map((project) => (
                  <div key={project.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{project.title}</h3>
                        <p className="text-sm text-gray-600">
                          {project.pages} pages • {project.wordCount?.toLocaleString() || 'N/A'} mots
                        </p>
                        {project.jobId && (
                          <p className="text-xs text-gray-500 mt-1">
                            Job ID: {project.jobId}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          project.status === 'completed' ? 'bg-green-100 text-green-800' :
                          project.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          project.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status === 'completed' ? 'Terminé' : 
                           project.status === 'processing' ? 'En cours' : 
                           project.status === 'pending' ? 'En attente' :
                           'Échoué'}
                        </span>
                        {project.status === 'completed' && project.audioUrl && (
                          <button
                            onClick={() => handleProjectSelect(project)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Écouter"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {projects.length > 3 && (
                <div className="text-center mt-4">
                  <button
                    onClick={() => setShowHistory(true)}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Voir tous les projets ({projects.length})
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Historique complet des projets */
        <ProjectHistory
          projects={projects}
          onProjectSelect={handleProjectSelect}
          onProjectDelete={handleProjectDelete}
        />
      )}

      {/* Lecteur audio intégré */}
      {activeAudioUrl && (
        <AudioPlayer
          audioUrl={activeAudioUrl}
          title={activeAudioTitle}
          onClose={handleAudioClose}
          onPlay={handleAudioPlay}
          onPause={handleAudioPause}
          onSeek={handleAudioSeek}
        />
      )}
    </div>
  );
};

export default ProjectManager; 