import React, { useState } from 'react';
import './index.css';
import { LanguageProvider } from './hooks/useTranslation.jsx';
import {
  Header,
  HeroSection,
  FeaturesSection,
  VoiceSection,
  HowItWorksSection,
  PricingSection,
  AboutSection,
  Footer,
  ProjectManager,
  ApiTest
} from './components';

function App() {
  const [currentView, setCurrentView] = useState('main'); // 'main', 'projects', ou 'test'

  const renderMainView = () => (
    <>
      <Header />
      <HeroSection />
      <FeaturesSection />
      <VoiceSection />
      <HowItWorksSection />
      <PricingSection />
      <AboutSection />
      <Footer />
    </>
  );

  const renderProjectsView = () => (
    <>
      <Header />
      <ProjectManager />
      <Footer />
    </>
  );

  const renderTestView = () => (
    <>
      <Header />
      <div className="pt-20 pb-8">
        <ApiTest />
      </div>
      <Footer />
    </>
  );

  return (
    <LanguageProvider>
      <div className="App">
        {/* Navigation entre les vues */}
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2">
            <button
              onClick={() => setCurrentView('main')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'main'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Accueil
            </button>
            <button
              onClick={() => setCurrentView('projects')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'projects'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Projets
            </button>
            <button
              onClick={() => setCurrentView('test')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'test'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              🧪 Test API
            </button>
          </div>
        </div>

        {/* Contenu principal */}
        {currentView === 'main' ? renderMainView() : 
         currentView === 'projects' ? renderProjectsView() : 
         renderTestView()}
      </div>
    </LanguageProvider>
  );
}

export default App;
