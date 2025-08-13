import React from 'react';
import './index.css';
import {
  Header,
  HeroSection,
  FeaturesSection,
  VoiceSection,
  HowItWorksSection,
  Footer
} from './components';

function App() {
  return (
    <div className="App">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <VoiceSection />
      <HowItWorksSection />
      <Footer />
    </div>
  );
}

export default App;
