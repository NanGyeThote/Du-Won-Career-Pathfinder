import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SectionCard from './SectionCard';
import Footer from './Footer';
import Container from './ui/Container';
import { useNavbar } from '../contexts/NavbarContext';

interface KnowledgeEngineeringSystemProps {
  hideFooter?: boolean;
}

const KnowledgeEngineeringSystem = ({ hideFooter = false }: KnowledgeEngineeringSystemProps) => {
  const [expandedSection, setExpandedSection] = useState<'career' | 'developer' | null>(null);
  const [careerChoice, setCareerChoice] = useState<'quiz' | 'cv' | null>(null);
  const { showNavbar, hideNavbar } = useNavbar();

  useEffect(() => {
    if (expandedSection) {
      hideNavbar();
    } else {
      showNavbar();
    }
  }, [expandedSection, showNavbar, hideNavbar]);

  const handleExpand = (section: 'career' | 'developer') => {
    setExpandedSection(section);
  };

  const handleCollapse = () => {
    setExpandedSection(null);
    setCareerChoice(null);
  };

  const handleCareerChoice = (choice: 'quiz' | 'cv') => {
    setCareerChoice(choice);
  };

  const handleBackFromCareerChoice = () => {
    setCareerChoice(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-main-gradient relative">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-career-accent/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-developer-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-glow" />
      </div>

      {/* Header */}
      <motion.header
        className="relative z-10 section border-b border-white/10 pt-20 sm:pt-24"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Container size="lg" className="text-center px-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-white mb-4 sm:mb-6">
            AI-Powered Career
            <span className="block text-career-accent">Guidance Platform</span>
          </h1>
          
          <p className="text-base sm:text-lg lg:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed px-4">
            Explore career paths and development opportunities through our intelligent knowledge base. 
            Choose your journey below to get personalized insights and recommendations.
          </p>
        </Container>
      </motion.header>

      {/* How It Works Section */}
      <motion.section
        className="relative z-10 section border-b border-white/10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Container size="lg">
          <div className="text-center px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto">
              Our platform is designed to be simple and intuitive. Here's how you can get started on your career journey:
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mt-8 sm:mt-12 text-center px-4">
            <motion.div
              className="bg-white/5 p-4 sm:p-6 rounded-lg"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-lg sm:text-xl font-bold text-career-accent mb-2">1. Take the Quiz</h3>
              <p className="text-sm sm:text-base text-white/80">Answer a few simple questions to help us understand your interests and skills.</p>
            </motion.div>
            <motion.div
              className="bg-white/5 p-4 sm:p-6 rounded-lg"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-lg sm:text-xl font-bold text-career-accent mb-2">2. Upload Your CV</h3>
              <p className="text-sm sm:text-base text-white/80">For a more in-depth analysis, upload your CV and let our AI do the rest.</p>
            </motion.div>
            <motion.div
              className="bg-white/5 p-4 sm:p-6 rounded-lg"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-lg sm:text-xl font-bold text-career-accent mb-2">3. Get Recommendations</h3>
              <p className="text-sm sm:text-base text-white/80">Receive personalized career recommendations and insights based on your profile.</p>
            </motion.div>
          </div>
        </Container>
      </motion.section>

      {/* Featured Career Paths Section */}
      <motion.section
        className="relative z-10 section border-b border-white/10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Container size="lg">
          <div className="text-center px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Featured Career Paths</h2>
            <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto">
              Explore some of the popular career paths that our platform can help you with:
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mt-8 sm:mt-12 px-4">
            <motion.div
              className="bg-white/5 p-4 sm:p-6 rounded-lg"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-lg sm:text-xl font-bold text-developer-accent mb-2">Software Engineer</h3>
              <p className="text-sm sm:text-base text-white/80">Build and maintain software applications. A highly in-demand role with great career prospects.</p>
            </motion.div>
            <motion.div
              className="bg-white/5 p-4 sm:p-6 rounded-lg"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-lg sm:text-xl font-bold text-developer-accent mb-2">Data Scientist</h3>
              <p className="text-sm sm:text-base text-white/80">Analyze and interpret complex data to help organizations make better decisions.</p>
            </motion.div>
            <motion.div
              className="bg-white/5 p-4 sm:p-6 rounded-lg"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-lg sm:text-xl font-bold text-developer-accent mb-2">UX/UI Designer</h3>
              <p className="text-sm sm:text-base text-white/80">Create user-friendly and visually appealing interfaces for websites and applications.</p>
            </motion.div>
          </div>
        </Container>
      </motion.section>

      {/* Main sections */}
      <motion.main
        className="flex-1 relative z-10 section-sm flex flex-col"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Container size="lg" className="flex-1 flex flex-col">
          {expandedSection ? (
            <SectionCard
              title={expandedSection === 'career' ? 'Career Guidance' : 'Database Builder'}
              description={expandedSection === 'career' ? 'Discover your ideal career path with personalized recommendations. Get insights into required skills, education pathways, and industry trends tailored to your interests and goals.' : 'Build and manage your knowledge base with ease. Create comprehensive datasets, generate structured content, and test your knowledge base with our intelligent RAG system for optimal performance.'}
              icon={
                expandedSection === 'career' ? (
                  <svg className="w-10 h-10 text-career-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                  </svg>
                ) : (
                  <svg className="w-10 h-10 text-developer-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                )
              }
              variant={expandedSection}
              isExpanded={true}
              onExpand={() => {}}
              onCollapse={handleCollapse}
              careerChoice={careerChoice}
              onCareerChoice={handleCareerChoice}
              onBack={handleBackFromCareerChoice}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 px-4">
              <SectionCard
                title="Career Guidance"
                description="Discover your ideal career path with personalized recommendations. Get insights into required skills, education pathways, and industry trends tailored to your interests and goals."
                icon={
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                  </svg>
                }
                variant="career"
                isExpanded={expandedSection === 'career'}
                onExpand={() => handleExpand('career')}
                onCollapse={handleCollapse}
                careerChoice={careerChoice}
                onCareerChoice={handleCareerChoice}
                onBack={handleBackFromCareerChoice}
              />

              <SectionCard
                title="Database Builder"
                description="Build and manage your knowledge base with ease. Create comprehensive datasets, generate structured content, and test your knowledge base with our intelligent RAG system for optimal performance."
                icon={
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                }
                variant="developer"
                isExpanded={expandedSection === 'developer'}
                onExpand={() => handleExpand('developer')}
                onCollapse={handleCollapse}
                careerChoice={null}
                onCareerChoice={() => {}}
                onBack={() => {}}
              />
            </div>
          )}
        </Container>
      </motion.main>

      {!hideFooter && <Footer />}
    </div>
  );
};

export default KnowledgeEngineeringSystem;