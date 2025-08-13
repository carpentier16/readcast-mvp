import React from 'react';
import Header from './components/Header';
import UploadSection from './components/UploadSection';
import VoiceSection from './components/VoiceSection';
import ProjectsSection from './components/ProjectsSection';
import './index.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

function App() {
  return (
    <div className="App">
      <Header />
      <main className="main-content">
        <UploadSection />
        <VoiceSection />
        <ProjectsSection />
      </main>
    </div>
  );
}

export default App;
