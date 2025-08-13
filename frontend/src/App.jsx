import React, { useState, useEffect } from 'react';
import UploadSection from './components/UploadSection';
import VoiceSection from './components/VoiceSection';
import ProjectsSection from './components/ProjectsSection';
const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

const App = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('Rachel');
  const [isUploading, setIsUploading] = useState(false);

  // Charger les jobs existants au démarrage
  useEffect(() => {
    const savedJobs = JSON.parse(localStorage.getItem('readcast_jobs') || '[]');
    setJobs(savedJobs);
    
    // Démarrer les SSE pour les jobs en cours
    savedJobs.forEach(job => {
      if (job.status === 'processing' || job.status === 'pending') {
        startJobSSE(job.id);
      }
    });
  }, []);

  const startJobSSE = (jobId) => {
    const eventSource = new EventSource(`${API_BASE_URL}/api/jobs/${jobId}/events`);
    
    eventSource.addEventListener('update', (event) => {
      try {
        const jobData = JSON.parse(event.data);
        updateJobStatus(jobId, {
          ...jobData,
          // Mapper les status du backend vers le frontend
          status: mapBackendStatus(jobData.status),
          progress: jobData.progress || (jobData.status === 'processing' ? 45 : 0)
        });
        
        // Fermer SSE si terminé
        if (jobData.status === 'done' || jobData.status === 'error') {
          eventSource.close();
        }
      } catch (e) {
        console.error('Erreur parsing SSE:', e);
      }
    });

    eventSource.onerror = () => {
      eventSource.close();
    };
  };

  const mapBackendStatus = (backendStatus) => {
    const statusMap = {
      'PENDING': 'pending',
      'PROCESSING': 'processing',
      'DONE': 'done', 
      'ERROR': 'error'
    };
    return statusMap[backendStatus] || backendStatus.toLowerCase();
  };

  const updateJobStatus = (jobId, jobData) => {
    setJobs(prevJobs => {
      const updatedJobs = prevJobs.map(job => 
        job.id === jobId ? { 
          ...job, 
          ...jobData,
          // Garder le titre local si pas fourni par le backend
          title: job.title || jobData.input_filename?.replace('.pdf', '') || 'Sans titre'
        } : job
      );
      localStorage.setItem('readcast_jobs', JSON.stringify(updatedJobs));
      return updatedJobs;
    });
  };

  const handleFileUpload = async (file) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('voice', selectedVoice);
      formData.append('lang', 'fra');

      const response = await fetch(`${API_BASE_URL}/api/jobs`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `HTTP ${response.status}`);
      }

      const jobData = await response.json();
      
      const newJob = {
        id: jobData.id,
        title: file.name.replace('.pdf', ''),
        status: 'pending',
        voice: selectedVoice,
        estimatedDuration: '~' + Math.floor(file.size / 100000) + 'min',
        progress: 0,
        createdAt: new Date().toISOString(),
        input_filename: file.name
      };

      const updatedJobs = [...jobs, newJob];
      setJobs(updatedJobs);
      localStorage.setItem('readcast_jobs', JSON.stringify(updatedJobs));

      // Démarrer SSE pour ce job
      setTimeout(() => startJobSSE(jobData.id), 1000);
      
    } catch (error) {
      console.error('Erreur upload:', error);
      alert(`Erreur lors de l'upload: ${error.message}`);
    }
    setIsUploading(false);
  };

  const handleDeleteJob = (jobId) => {
    const updatedJobs = jobs.filter(job => job.id !== jobId);
    setJobs(updatedJobs);
    localStorage.setItem('readcast_jobs', JSON.stringify(updatedJobs));
  };

  const handleDownload = (job) => {
    if (job.output_mp3_url) {
      window.open(job.output_mp3_url, '_blank');
    } else if (job.mp3) {
      window.open(job.mp3, '_blank');  
    } else {
      alert('Fichier audio non disponible');
    }
  };

  const handlePreview = (job) => {
    // Pour l'instant, même action que download
    handleDownload(job);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="container mx-auto max-w-7xl px-5 py-5">
        <Header userCredits={2} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <UploadSection 
            onFileUpload={handleFileUpload}
            isUploading={isUploading}
          />
          <VoiceSection 
            selectedVoice={selectedVoice}
            onVoiceSelect={setSelectedVoice}
          />
        </div>

        <ProjectsSection 
          jobs={jobs}
          onDeleteJob={handleDeleteJob}
          onDownload={handleDownload}
          onPreview={handlePreview}
        />
      </div>
    </div>
  );
};

export default App;
