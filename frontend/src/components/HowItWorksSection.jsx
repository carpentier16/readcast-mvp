import React from 'react';

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

export default HowItWorksSection; 