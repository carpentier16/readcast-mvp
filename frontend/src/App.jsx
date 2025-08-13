import React, { useState } from 'react';
import './index.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

// Header Component
const Header = () => (
  <header className="bg-white shadow-sm border-b">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center py-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-xl">R</span>
          </div>
          <span className="text-xl font-semibold text-gray-900">READCAST</span>
        </div>
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
          <a href="#login" className="text-gray-600 hover:text-gray-900">Login</a>
          <a href="#register" className="text-gray-600 hover:text-gray-900">Register</a>
          <select className="text-gray-600 bg-transparent border-none">
            <option>English</option>
            <option>Français</option>
          </select>
        </nav>
      </div>
    </div>
  </header>
);

// Main Hero Section
const HeroSection = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  return (
    <section className="bg-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
          The world's most trusted PDF to audio converter
        </h1>
        <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
          Easily convert PDF documents into natural-sounding audio content. 
          Transform your reading experience with AI-powered voice synthesis.
        </p>
        
        {/* Upload Area */}
        <div className="bg-gray-50 rounded-xl p-16 mb-8">
          <div className="max-w-md mx-auto">
            <input 
              type="file" 
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              id="pdf-upload"
            />
            <label 
              htmlFor="pdf-upload" 
              className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium py-4 px-8 rounded-lg cursor-pointer inline-block transition-colors"
            >
              Click here to convert a PDF!
            </label>
            {file && (
              <div className="mt-4 text-green-600 font-medium">
                ✓ {file.name} selected
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

// Features Section
const FeaturesSection = () => {
  const features = [
    {
      icon: "🔒",
      title: "Secure",
      description: "With years of experience in document processing, we comply with strict standards when handling your files."
    },
    {
      icon: "🏢",
      title: "Professional",
      description: "We've provided our services to thousands of reputable educational, business and legal firms."
    },
    {
      icon: "🎯",
      title: "Accurate",
      description: "We're continually improving our algorithms. If a file doesn't convert to your expectations, email us and we'll fix it."
    }
  ];

  return (
    <section className="bg-white py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-12">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">{feature.icon}</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Voice Selection Section
const VoiceSection = () => {
  const [selectedVoice, setSelectedVoice] = useState('natural');
  
  const voices = [
    { id: 'natural', name: 'Natural Voice', description: 'Clear and professional' },
    { id: 'expressive', name: 'Expressive Voice', description: 'Engaging and dynamic' },
    { id: 'calm', name: 'Calm Voice', description: 'Soothing and relaxed' }
  ];

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Voice Style</h2>
          <p className="text-gray-600 text-lg">Select the perfect narrator for your content</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {voices.map(voice => (
            <div 
              key={voice.id}
              className={`p-6 rounded-lg border cursor-pointer transition-all ${
                selectedVoice === voice.id 
                  ? 'border-blue-500 bg-white shadow-md' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onClick={() => setSelectedVoice(voice.id)}
            >
              <div className="text-center">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">{voice.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{voice.description}</p>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  ▶ Preview
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// How It Works Section
const HowItWorksSection = () => {
  const steps = [
    { step: "1", title: "Upload PDF", description: "Select your PDF document" },
    { step: "2", title: "Choose Voice", description: "Pick your preferred narrator" },
    { step: "3", title: "Convert", description: "AI processes your document" },
    { step: "4", title: "Download", description: "Get your audio file" }
  ];

  return (
    <section className="bg-white py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-gray-600 text-lg">Simple and straightforward process</p>
        </div>
        
        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((item, index) => (
            <div key={index} className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                {item.step}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Footer
const Footer = () => (
  <footer className="bg-gray-900 text-white py-12">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-2">
              <span className="text-white font-bold">R</span>
            </div>
            <span className="font-semibold">ReadCast</span>
          </div>
          <p className="text-gray-400 text-sm">
            Transform your documents into audio content with AI-powered voice synthesis.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Product</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><a href="#" className="hover:text-white">Features</a></li>
            <li><a href="#" className="hover:text-white">Pricing</a></li>
            <li><a href="#" className="hover:text-white">API</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Company</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><a href="#" className="hover:text-white">About</a></li>
            <li><a href="#" className="hover:text-white">Blog</a></li>
            <li><a href="#" className="hover:text-white">Careers</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Support</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><a href="#" className="hover:text-white">Help Center</a></li>
            <li><a href="#" className="hover:text-white">Contact</a></li>
            <li><a href="#" className="hover:text-white">Privacy</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
        © 2024 ReadCast. All rights reserved.
      </div>
    </div>
  </footer>
);

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
