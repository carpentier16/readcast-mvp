import React from 'react';

const AboutSection = () => {
  const stats = [
    { number: "10,000+", label: "Happy Users", icon: "👥" },
    { number: "50,000+", label: "Documents Converted", icon: "📄" },
    { number: "99.9%", label: "Uptime", icon: "⚡" },
    { number: "24/7", label: "Support", icon: "🛟" }
  ];

  const team = [
    {
      name: "Alex Chen",
      role: "CEO & Founder",
      bio: "Former AI researcher at Google, passionate about making technology accessible to everyone.",
      avatar: "👨‍💼",
      linkedin: "#"
    },
    {
      name: "Sarah Johnson",
      role: "CTO",
      bio: "Expert in natural language processing and audio synthesis with 10+ years of experience.",
      avatar: "👩‍💻",
      linkedin: "#"
    },
    {
      name: "Marcus Rodriguez",
      role: "Head of Product",
      bio: "Product visionary with a track record of building successful SaaS platforms.",
      avatar: "👨‍🎨",
      linkedin: "#"
    }
  ];

  const values = [
    {
      icon: "🎯",
      title: "Innovation First",
      description: "We constantly push the boundaries of AI technology to deliver the best possible user experience."
    },
    {
      icon: "🔒",
      title: "Security & Privacy",
      description: "Your documents and data are protected with enterprise-grade security and privacy measures."
    },
    {
      icon: "🤝",
      title: "Customer Success",
      description: "We're committed to your success and provide exceptional support every step of the way."
    },
    {
      icon: "🌍",
      title: "Global Accessibility",
      description: "Making AI-powered audio conversion accessible to users worldwide in multiple languages."
    }
  ];

  const handleContactUs = () => {
    alert('Contact form coming soon!');
    // Ici vous pourriez ouvrir un formulaire de contact
  };

  const handleJoinTeam = () => {
    alert('Careers page coming soon!');
    // Ici vous pourriez rediriger vers une page de carrières
  };

  return (
    <section id="about" className="py-20 bg-gradient-to-br from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About
            <span className="block text-blue-600">
              ReadCast
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're on a mission to revolutionize how people consume written content by making 
            it accessible through natural, AI-powered audio conversion.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
            <p className="text-gray-600 leading-relaxed">
              To democratize access to written content by transforming any document into 
              natural-sounding audio, making information accessible to everyone, everywhere, 
              regardless of reading ability or time constraints.
            </p>
          </div>
          
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
            <p className="text-gray-600 leading-relaxed">
              To become the world's leading platform for AI-powered document-to-audio 
              conversion, empowering millions of users to consume content in the most 
              natural and convenient way possible.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Values</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl mb-4">{value.icon}</div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h4>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">Meet Our Team</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200 text-center">
                <div className="text-6xl mb-4">{member.avatar}</div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h4>
                <p className="text-blue-600 font-medium mb-4">{member.role}</p>
                <p className="text-gray-600 mb-4">{member.bio}</p>
                <button 
                  onClick={() => alert(`LinkedIn profile for ${member.name} coming soon!`)}
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                >
                  View Profile →
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Story */}
        <div className="bg-blue-600 rounded-3xl p-12 text-white mb-20">
          <div className="text-center">
            <h3 className="text-3xl font-bold mb-6">Our Story</h3>
            <p className="text-xl mb-8 opacity-90 leading-relaxed">
              ReadCast was born from a simple observation: while the world produces an 
              incredible amount of written content, many people struggle to consume it 
              due to time constraints, reading difficulties, or simply preferring audio.
            </p>
            <p className="text-lg opacity-80 leading-relaxed">
              Founded in 2023 by a team of AI researchers and product experts, we've 
              developed cutting-edge technology that transforms any PDF into natural, 
              engaging audio content. Today, we serve thousands of users worldwide, 
              from students and professionals to accessibility advocates and content creators.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="bg-white rounded-3xl p-12 shadow-2xl border border-gray-200">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Want to Learn More?
            </h3>
            <p className="text-xl text-gray-600 mb-8">
              Get in touch with our team or explore career opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleContactUs}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300"
              >
                Contact Us
              </button>
              <button
                onClick={handleJoinTeam}
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300"
              >
                Join Our Team
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection; 