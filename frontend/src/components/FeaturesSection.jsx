import React, { useState } from 'react';

const FeaturesSection = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      title: "AI-Powered Conversion",
      description: "Our advanced artificial intelligence ensures natural-sounding audio with perfect pronunciation and intonation.",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      details: ["Natural voice synthesis", "Multiple language support", "Context-aware reading"],
      color: "blue-500"
    },
    {
      title: "Professional Quality",
      description: "Studio-grade audio output with customizable settings for speed, pitch, and voice selection.",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      ),
      details: ["High-fidelity audio", "Customizable settings", "Professional voices"],
      color: "green-500"
    },
    {
      title: "Lightning Fast",
      description: "Convert documents in seconds, not minutes. Our optimized processing ensures quick turnaround times.",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      details: ["Instant processing", "Batch conversion", "Real-time preview"],
      color: "purple-500"
    },
    {
      title: "Secure & Private",
      description: "Bank-level encryption ensures your documents remain confidential throughout the entire process.",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      details: ["End-to-end encryption", "GDPR compliant", "Secure cloud storage"],
      color: "red-500"
    },
    {
      title: "Multi-Platform",
      description: "Access your audio files from anywhere. Works seamlessly across all devices and platforms.",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      details: ["Cross-platform sync", "Mobile optimized", "Offline access"],
      color: "indigo-500"
    },
    {
      title: "24/7 Support",
      description: "Our dedicated support team is always ready to help you get the most out of ReadCast.",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 0l3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      details: ["Live chat support", "Video tutorials", "Knowledge base"],
      color: "orange-500"
    }
  ];

  return (
    <section id="features" className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Features
            <span className="block text-blue-600">
              That Matter
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover why thousands of users choose ReadCast for their document-to-audio conversion needs.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group cursor-pointer transition-all duration-500 ${
                activeFeature === index ? 'scale-105' : 'hover:scale-102'
              }`}
              onClick={() => setActiveFeature(index)}
              onMouseEnter={() => setActiveFeature(index)}
            >
              <div className={`relative bg-white rounded-3xl p-8 shadow-lg border-2 transition-all duration-500 ${
                activeFeature === index 
                  ? 'border-blue-300 shadow-2xl shadow-blue-100/50' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-xl'
              }`}>
                {/* Background Color */}
                <div className={`absolute inset-0 bg-${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl`}></div>
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`w-20 h-20 rounded-2xl bg-${feature.color} bg-opacity-10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <div className={`text-${feature.color}`}>
                      {feature.icon}
                    </div>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {feature.description}
                  </p>
                  
                  {/* Details */}
                  <div className="space-y-2">
                    {feature.details.map((detail, detailIndex) => (
                      <div key={detailIndex} className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {detail}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hover Effect */}
                <div className={`absolute inset-0 bg-${feature.color} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500`}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Demo */}
        <div className="bg-white rounded-3xl p-12 shadow-2xl border border-gray-200">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Try It Yourself
            </h3>
            <p className="text-xl text-gray-600">
              Experience the power of our AI voice synthesis with a live demo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Voice Preview */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Voice Preview</h4>
              <p className="text-gray-600 mb-4">Listen to different AI voices</p>
              <button 
                onClick={() => {
                  alert('Voice preview functionality coming soon!');
                  // Ici vous pourriez ouvrir un modal avec des échantillons de voix
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Play Sample
              </button>
            </div>

            {/* Speed Test */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Speed Test</h4>
              <p className="text-gray-600 mb-4">See conversion speed in action</p>
              <button 
                onClick={() => {
                  alert('Speed test functionality coming soon!');
                  // Ici vous pourriez lancer un test de vitesse réel
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Start Test
              </button>
            </div>

            {/* Quality Demo */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Quality Demo</h4>
              <p className="text-gray-600 mb-4">Compare before and after</p>
              <button 
                onClick={() => {
                  alert('Quality demo functionality coming soon!');
                  // Ici vous pourriez ouvrir un comparateur avant/après
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                View Demo
              </button>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-blue-600 rounded-3xl p-12 text-white">
            <h3 className="text-3xl font-bold mb-4">
              Ready to Transform Your Documents?
            </h3>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of users who have already discovered the power of AI-powered audio conversion.
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
                Start Free Trial
              </button>
              <button 
                onClick={() => {
                  alert('Demo video functionality coming soon!');
                  // Ici vous pourriez ouvrir une vidéo de démonstration
                }}
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200"
              >
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection; 