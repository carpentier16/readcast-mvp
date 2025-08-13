import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

const AboutSection = () => {
  const { t } = useTranslation();
  
  const stats = [
    { number: "10,000+", label: t('about.stats.users'), icon: "👥" },
    { number: "50,000+", label: t('about.stats.documents'), icon: "📄" },
    { number: "99.9%", label: t('about.stats.uptime'), icon: "⚡" },
    { number: "24/7", label: t('about.stats.support'), icon: "🛟" }
  ];

  const team = [
    {
      name: "Alex Chen",
      role: t('about.team.alex.role'),
      bio: t('about.team.alex.bio'),
      avatar: "👨‍💼",
      linkedin: "#"
    },
    {
      name: "Sarah Johnson",
      role: t('about.team.sarah.role'),
      bio: t('about.team.sarah.bio'),
      avatar: "👩‍💻",
      linkedin: "#"
    },
    {
      name: "Marcus Rodriguez",
      role: t('about.team.marcus.role'),
      bio: t('about.team.marcus.bio'),
      avatar: "👨‍🎨",
      linkedin: "#"
    }
  ];

  const values = [
    {
      icon: "🎯",
      title: t('about.values.innovation.title'),
      description: t('about.values.innovation.desc')
    },
    {
      icon: "🔒",
      title: t('about.values.security.title'),
      description: t('about.values.security.desc')
    },
    {
      icon: "🤝",
      title: t('about.values.customer.title'),
      description: t('about.values.customer.desc')
    },
    {
      icon: "🌍",
      title: t('about.values.global.title'),
      description: t('about.values.global.desc')
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
            {t('about.title.line1')}
            <span className="block text-blue-600">
              {t('about.title.line2')}
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('about.description')}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-20">
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
            <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('about.mission.title')}</h3>
            <p className="text-gray-600 leading-relaxed">
              {t('about.mission.desc')}
            </p>
          </div>
          
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('about.vision.title')}</h3>
            <p className="text-gray-600 leading-relaxed">
              {t('about.vision.desc')}
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">{t('about.values.title')}</h3>
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
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">{t('about.team.title')}</h3>
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
            <h3 className="text-3xl font-bold mb-6">{t('about.story.title')}</h3>
            <p className="text-xl mb-8 opacity-90 leading-relaxed">
              {t('about.story.para1')}
            </p>
            <p className="text-lg opacity-80 leading-relaxed">
              {t('about.story.para2')}
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="bg-white rounded-3xl p-12 shadow-2xl border border-gray-200">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              {t('about.cta.title')}
            </h3>
            <p className="text-xl text-gray-600 mb-8">
              {t('about.cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleContactUs}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300"
              >
                {t('about.cta.contact')}
              </button>
              <button
                onClick={handleJoinTeam}
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300"
              >
                {t('about.cta.careers')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection; 