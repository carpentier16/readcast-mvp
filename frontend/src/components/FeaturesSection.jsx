import React from 'react';

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

export default FeaturesSection; 