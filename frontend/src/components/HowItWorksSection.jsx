import React, { useState } from 'react';

const HowItWorksSection = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      number: "01",
      title: "Upload PDF",
      description: "Select your PDF document and drag it into our secure upload area. We support files up to 50MB with bank-level encryption.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      color: "blue-600",
      bgColor: "blue-50"
    },
    {
      number: "02",
      title: "Choose Voice & Language",
      description: "Pick from our collection of natural AI voices in multiple languages. Customize speed, pitch, and emotion for perfect narration.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      ),
      color: "green-600",
      bgColor: "green-50"
    },
    {
      number: "03",
      title: "AI Processing",
      description: "Our advanced AI analyzes your document structure, extracts text intelligently, and converts it to natural-sounding speech.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      color: "purple-600",
      bgColor: "purple-50"
    },
    {
      number: "04",
      title: "Download & Enjoy",
      description: "Get your high-quality MP3 file instantly. Listen on any device, share with others, or create audiobooks for your projects.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: "orange-600",
      bgColor: "orange-50"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How It
            <span className="block text-blue-600">
              Works
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our streamlined process makes converting PDFs to audio as simple as 1-2-3-4. 
            Experience the future of document consumption in just a few clicks.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`group cursor-pointer transition-all duration-500 ${
                activeStep === index ? 'scale-105' : 'hover:scale-102'
              }`}
              onClick={() => setActiveStep(index)}
              onMouseEnter={() => setActiveStep(index)}
            >
              <div className={`relative bg-white rounded-3xl p-8 shadow-lg border-2 transition-all duration-500 ${
                activeStep === index 
                  ? 'border-blue-300 shadow-2xl shadow-blue-100/50' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-xl'
              }`}>
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${step.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`}></div>
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Step Number */}
                  <div className={`w-20 h-20 rounded-2xl bg-${step.color} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <span className="text-2xl font-bold">{step.number}</span>
                  </div>
                  
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-${step.color} bg-opacity-10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <div className={`text-${step.color.split('-')[1]}-600`}>
                      {step.icon}
                    </div>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                    {step.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {step.description}
                  </p>
                </div>

                {/* Hover Effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${step.color} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500`}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Process Flow */}
        <div className="bg-white rounded-3xl p-12 shadow-2xl border border-gray-200 mb-16">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Visual Process Flow
            </h3>
            <p className="text-xl text-gray-600">
              See how your document flows through our AI-powered pipeline
            </p>
          </div>

          {/* Process Flow Diagram */}
          <div className="relative">
            {/* Connection Lines */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gray-200 transform -translate-y-1/2"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="text-center relative">
                  {/* Step Circle */}
                  <div className={`w-24 h-24 rounded-full bg-${step.color} flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {step.number}
                  </div>
                  
                  {/* Step Info */}
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h4>
                  <p className="text-gray-600 text-sm">{step.description.split('.')[0]}.</p>
                  
                  {/* Arrow (except for last step) */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-12 -right-4 text-gray-300">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-blue-600 rounded-3xl p-12 text-white">
            <h3 className="text-3xl font-bold mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of users who have already transformed their reading experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => {
                  // Rediriger vers la section hero pour commencer la conversion
                  const heroSection = document.getElementById('hero');
                  if (heroSection) {
                    heroSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-xl font-semibold text-lg transition-colors duration-200"
              >
                Start Converting Now
              </button>
              <button 
                onClick={() => {
                  alert('Examples gallery coming soon!');
                  // Ici vous pourriez ouvrir une galerie d'exemples
                }}
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200"
              >
                View Examples
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection; 