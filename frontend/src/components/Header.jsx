import React, { useState, useEffect } from 'react';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const handleLogin = () => {
    // Simuler la redirection vers la page de connexion
    alert('Redirection vers la page de connexion...');
    // Ici vous pourriez rediriger vers /login ou ouvrir un modal
  };

  const handleRegister = () => {
    // Simuler la redirection vers la page d'inscription
    alert('Redirection vers la page d\'inscription...');
    // Ici vous pourriez rediriger vers /register ou ouvrir un modal
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200' 
        : 'bg-white/90 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo avec animation */}
          <div className="flex items-center group cursor-pointer" onClick={() => scrollToSection('hero')}>
            <div className="relative">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <div className="absolute inset-0 bg-blue-400 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-gray-900">
                READCAST
              </span>
              <span className="text-xs text-gray-600 font-medium">AI-Powered Audio</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection('features')}
              className="relative group text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200"
            >
              Features
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
            </button>
            <button 
              onClick={() => scrollToSection('pricing')}
              className="relative group text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200"
            >
              Pricing
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
            </button>
            <button 
              onClick={() => scrollToSection('about')}
              className="relative group text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200"
            >
              About
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
            </button>
            
            {/* Language Selector */}
            <div className="relative group">
              <select className="appearance-none bg-transparent border-none text-gray-700 font-medium cursor-pointer pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-3 py-1">
                <option>🇺🇸 EN</option>
                <option>🇫🇷 FR</option>
                <option>🇪🇸 ES</option>
              </select>
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleLogin}
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                Sign In
              </button>
              <button 
                onClick={handleRegister}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                Get Started
              </button>
            </div>
          </nav>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
              aria-label="Toggle mobile menu"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white/95 backdrop-blur-md rounded-xl border border-gray-200 shadow-lg mb-4">
              <button 
                onClick={() => scrollToSection('features')}
                className="block w-full text-left px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('pricing')}
                className="block w-full text-left px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                Pricing
              </button>
              <button 
                onClick={() => scrollToSection('about')}
                className="block w-full text-left px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                About
              </button>
              <div className="border-t border-gray-200 my-2"></div>
              <button 
                onClick={handleLogin}
                className="block w-full text-left px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                Sign In
              </button>
              <button 
                onClick={handleRegister}
                className="block w-full text-left px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
