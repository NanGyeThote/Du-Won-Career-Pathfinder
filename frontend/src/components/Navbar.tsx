import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Container from './ui/Container';
import { useNavbar } from '../contexts/NavbarContext';
import { useModel } from '../contexts/ModelContext';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(true);
  const { isNavbarVisible, showNavbar, hideNavbar } = useNavbar();
  const { selectedModel, setSelectedModel } = useModel();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleNavbar = () => {
    if (isNavbarVisible) {
      hideNavbar();
    } else {
      showNavbar();
    }
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>

      {/* Main Navbar */}
      <AnimatePresence>
        {isNavbarVisible && (
          <motion.nav 
            className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Container size="lg">
              <div className="flex justify-between items-center h-16">
                {/* Logo */}
                <div className="flex items-center gap-2">
                  <Link 
                    to="/" 
                    className="text-lg sm:text-xl font-bold text-white hover:text-career-accent transition-colors duration-300 hidden sm:block"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-career-accent/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-career-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <span>Knowledge Engineering</span>
                    </div>
                  </Link>
                  
                  {/* Mobile Logo with Menu Toggle */}
                  <button
                    onClick={toggleMobileMenu}
                    className="sm:hidden text-lg font-bold text-white hover:text-career-accent transition-colors duration-300 flex items-center gap-2"
                  >
                    <div className="w-8 h-8 rounded-lg bg-career-accent/20 flex items-center justify-center">
                      <svg className="w-4 h-4 text-career-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <span>KE</span>
                  </button>
                </div>
                
                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6">
                  <Link 
                    to="/" 
                    className="text-white/80 hover:text-white transition-colors duration-300 px-3 py-2 rounded-lg hover:bg-white/10"
                  >
                    Home
                  </Link>
                  <Link 
                    to="/about" 
                    className="text-white/80 hover:text-white transition-colors duration-300 px-3 py-2 rounded-lg hover:bg-white/10"
                  >
                    About
                  </Link>
                  <Link 
                    to="/contact" 
                    className="text-white/80 hover:text-white transition-colors duration-300 px-3 py-2 rounded-lg hover:bg-white/10"
                  >
                    Chatbot
                  </Link>
                  <div className="relative">
                    <motion.select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="bg-black/20 border border-white/10 rounded-lg text-white/80 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 hover:bg-black/30 hover:border-white/20 cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <option value="gemini">Gemini</option>
                      <option value="custom_mistral">Qnizer</option>
                    </motion.select>
                  </div>
                </nav>
                
              </div>
            </Container>
            
            {/* Mobile Navigation */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                <motion.div 
                  className="md:hidden bg-black/40 backdrop-blur-sm border-t border-white/10"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Container size="lg">
                    <nav className="flex flex-col py-4 space-y-2">
                      <Link 
                        to="/" 
                        className="text-white/80 hover:text-white transition-colors px-4 py-3 rounded-lg hover:bg-white/10"
                        onClick={toggleMobileMenu}
                      >
                        Home
                      </Link>
                      <Link 
                        to="/about" 
                        className="text-white/80 hover:text-white transition-colors px-4 py-3 rounded-lg hover:bg-white/10"
                        onClick={toggleMobileMenu}
                      >
                        About
                      </Link>
                      <Link 
                        to="/contact" 
                        className="text-white/80 hover:text-white transition-colors px-4 py-3 rounded-lg hover:bg-white/10"
                        onClick={toggleMobileMenu}
                      >
                        Chatbot
                      </Link>
                      
                      {/* Mobile Model Selector */}
                      <div className="px-4 py-3">
                        <label className="block text-white/60 text-sm mb-2">AI Model</label>
                        <select
                          value={selectedModel}
                          onChange={(e) => setSelectedModel(e.target.value)}
                          className="w-full bg-black/20 border border-white/10 rounded-lg text-white/80 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 hover:bg-black/30 hover:border-white/20"
                        >
                          <option value="gemini">Gemini</option>
                          <option value="custom_mistral">Qnizer</option>
                        </select>
                      </div>
                    </nav>
                  </Container>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
