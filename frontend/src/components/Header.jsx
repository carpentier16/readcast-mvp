import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation.jsx';
import supabaseAuthService from '../services/supabaseAuth.js';
import AuthModal from './auth/AuthModal.jsx';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { t } = useTranslation();

  // État d'authentification
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Vérifier l'état d'authentification au démarrage
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const result = await supabaseAuthService.checkAuthStatus();
    setIsAuthenticated(result.isAuthenticated);
    setCurrentUser(result.user);
  };

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

  const handleAuthSuccess = (data) => {
    setIsAuthenticated(true);
    setCurrentUser(data.user);
    setIsAuthModalOpen(false);
  };

  const handleLogout = async () => {
    await supabaseAuthService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setIsUserMenuOpen(false);
  };

  return (
    <>
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
                {t('nav.features')}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
              </button>
              <button 
                onClick={() => scrollToSection('pricing')}
                className="relative group text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200"
              >
                {t('nav.pricing')}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
              </button>
              <button 
                onClick={() => scrollToSection('about')}
                className="relative group text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200"
              >
                {t('nav.about')}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
              </button>
              

            </nav>

            {/* Actions d'authentification */}
            <div className="hidden lg:flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">
                        {currentUser?.full_name?.[0] || currentUser?.username?.[0] || 'U'}
                      </span>
                    </div>
                    <span className="text-gray-700 font-medium">
                      {currentUser?.full_name || currentUser?.username}
                    </span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Menu utilisateur */}
                  {isUserMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{currentUser?.full_name || currentUser?.username}</p>
                        <p className="text-xs text-gray-500">{currentUser?.email}</p>
                      </div>
                      
                      <button
                        onClick={() => scrollToSection('projects')}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Mes Projets
                      </button>
                      
                      <button
                        onClick={() => {/* TODO: Ouvrir modal profil */}}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Mon Profil
                      </button>
                      
                      <div className="border-t border-gray-100 my-1"></div>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Se déconnecter
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200"
                  >
                    {t('nav.signIn')}
                  </button>
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                  >
                    {t('nav.getStarted')}
                  </button>
                </>
              )}
            </div>

            {/* Bouton menu mobile */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Menu mobile */}
          {isMobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-gray-200">
              <nav className="space-y-2">
                <button 
                  onClick={() => scrollToSection('features')}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {t('nav.features')}
                </button>
                <button 
                  onClick={() => scrollToSection('pricing')}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {t('nav.pricing')}
                </button>
                <button 
                  onClick={() => scrollToSection('about')}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {t('nav.about')}
                </button>
                
                {/* Actions d'authentification mobile */}
                {isAuthenticated ? (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="px-4 py-2">
                      <p className="text-sm font-medium text-gray-900">{currentUser?.full_name || currentUser?.username}</p>
                      <p className="text-xs text-gray-500">{currentUser?.email}</p>
                    </div>
                    <button
                      onClick={() => scrollToSection('projects')}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      Mes Projets
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Se déconnecter
                    </button>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-gray-200 space-y-2">
                    <button
                      onClick={() => setIsAuthModalOpen(true)}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      {t('nav.signIn')}
                    </button>
                    <button
                      onClick={() => setIsAuthModalOpen(true)}
                      className="block w-full text-left px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      {t('nav.getStarted')}
                    </button>
                  </div>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Modal d'authentification */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default Header;
