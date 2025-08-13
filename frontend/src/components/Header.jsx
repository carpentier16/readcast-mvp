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

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo avec animation */}
          <div className="flex items-center group">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-400 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                READCAST
              </span>
              <span className="text-xs text-gray-500 font-medium">AI-Powered Audio</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <a href="#features" className="relative group text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200">
              Features
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#pricing" className="relative group text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200">
              Pricing
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#about" className="relative group text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200">
              About
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 group-hover:w-full transition-all duration-300"></span>
            </a>
            
            {/* Language Selector */}
            <div className="relative group">
              <select className="appearance-none bg-transparent border-none text-gray-700 font-medium cursor-pointer pr-8 focus:outline-none">
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
              <a href="#login" className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200">
                Sign In
              </a>
              <a href="#register" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                Get Started
              </a>
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
              <a href="#features" className="block px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                Features
              </a>
              <a href="#pricing" className="block px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                Pricing
              </a>
              <a href="#about" className="block px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                About
              </a>
              <div className="border-t border-gray-200 my-2"></div>
              <a href="#login" className="block px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                Sign In
              </a>
              <a href="#register" className="block px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium">
                Get Started
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
