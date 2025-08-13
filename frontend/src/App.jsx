import React, { useState } from 'react';
import './index.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

// Header Component
const Header = () => (
  <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-6">
    <div className="container mx-auto px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">ReadCast</h1>
        <nav className="hidden md:flex space-x-6">
          <a href="#upload" className="hover:text-blue-200 transition-colors">Upload</a>
          <a href="#voice" className="hover:text-blue-200 transition-colors">Voice</a>
          <a href="#projects" className="hover:text-blue-200 transition-colors">Projects</a>
        </nav>
      </div>
    </div>
  </header>
);

// Hero Section
const HeroSection = () => (
  <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white py-20">
    <div className="container mx-auto px-6 text-center">
      <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
        Transform PDFs into Podcasts
      </h2>
      <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
        Upload your documents and let AI convert them into natural-sounding audio content you can listen to anywhere.
      </p>
      <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-full transition-all transform hover:scale-105 shadow-lg">
        Get Started Free
      </button>
    </div>
  </section>
);

// Upload Section
const UploadSection = () => {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
    }
  };

  return (
    <section id="upload" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Upload Your PDF</h2>
          <p className="text-gray-600 text-lg">Drag and drop your document or click to browse</p>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <div 
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
              dragOver 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-100'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {file ? file.name : 'Drop your PDF here'}
            </h3>
            <p className="text-gray-500 mb-6">or click to browse files</p>
            
            <input 
              type="file" 
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label 
              htmlFor="file-upload" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg cursor-pointer transition-colors inline-block"
            >
              Choose File
            </label>
            
            {file && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800">✅ {file.name} ready to convert</p>
                <button className="mt-3 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition-colors">
                  Start Conversion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

// Voice Section
const VoiceSection = () => {
  const [selectedVoice, setSelectedVoice] = useState('sarah');
  
  const voices = [
    { id: 'sarah', name: 'Sarah', description: 'Warm and professional', gender: 'Female' },
    { id: 'michael', name: 'Michael', description: 'Clear and authoritative', gender: 'Male' },
    { id: 'emma', name: 'Emma', description: 'Friendly and engaging', gender: 'Female' },
    { id: 'david', name: 'David', description: 'Deep and calming', gender: 'Male' }
  ];

  return (
    <section id="voice" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Choose Your Voice</h2>
          <p className="text-gray-600 text-lg">Select the perfect narrator for your content</p>
        </div>
        
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {voices.map(voice => (
            <div 
              key={voice.id}
              className={`p-6 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg ${
                selectedVoice === voice.id 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => setSelectedVoice(voice.id)}
            >
              <div className="text-center">
                <div className="text-4xl mb-3">🎙️</div>
                <h3 className="font-bold text-lg text-gray-800">{voice.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{voice.gender}</p>
                <p className="text-sm text-gray-600">{voice.description}</p>
                <button className="mt-3 text-blue-600 hover:text-blue-800 font-medium">
                  ▶️ Preview
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Projects Section
const ProjectsSection = () => {
  const projects = [
    {
      id: 1,
      title: "Machine Learning Fundamentals",
      status: "completed",
      duration: "45 min",
      date: "2024-01-15"
    },
    {
      id: 2,
      title: "React Best Practices",
      status: "processing",
      duration: "-- min",
      date: "2024-01-16"
    }
  ];

  return (
    <section id="projects" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Your Projects</h2>
          <p className="text-gray-600 text-lg">Manage and download your converted audio content</p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          {projects.length > 0 ? (
            <div className="space-y-4">
              {projects.map(project => (
                <div key={project.id} className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">🎧</div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800">{project.title}</h3>
                      <p className="text-gray-500">Duration: {project.duration} • {project.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      project.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {project.status === 'completed' ? '✅ Ready' : '⏳ Processing'}
                    </span>
                    {project.status === 'completed' && (
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                        Download
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No projects yet</h3>
              <p className="text-gray-500">Upload your first PDF to get started</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

// Footer
const Footer = () => (
  <footer className="bg-gray-800 text-white py-12">
    <div className="container mx-auto px-6 text-center">
      <h3 className="text-2xl font-bold mb-4">ReadCast</h3>
      <p className="text-gray-400 mb-6">Transform your reading experience with AI-powered audio</p>
      <div className="flex justify-center space-x-6 text-sm">
        <a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a>
        <a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a>
        <a href="#" className="hover:text-blue-400 transition-colors">Contact</a>
      </div>
    </div>
  </footer>
);

function App() {
  return (
    <div className="App">
      <Header />
      <HeroSection />
      <UploadSection />
      <VoiceSection />
      <ProjectsSection />
      <Footer />
    </div>
  );
}

export default App;
