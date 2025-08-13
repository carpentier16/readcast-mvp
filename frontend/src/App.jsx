import React from 'react';
import './index.css';
import { LanguageProvider } from './hooks/useTranslation';
import {
  Header,
  HeroSection,
  FeaturesSection,
  VoiceSection,
  HowItWorksSection,
  PricingSection,
  AboutSection,
  Footer
} from './components';

function App() {
  return (
    <LanguageProvider>
      <div className="App">
        <Header />
        <HeroSection />
        <FeaturesSection />
        <VoiceSection />
        <HowItWorksSection />
        <PricingSection />
        <AboutSection />
        <Footer />
      </div>
    </LanguageProvider>
  );
}

export default App;
