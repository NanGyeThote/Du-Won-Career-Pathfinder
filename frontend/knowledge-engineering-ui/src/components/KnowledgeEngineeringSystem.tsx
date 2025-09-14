import { useState } from 'react';
import SectionCard from './SectionCard';

const KnowledgeEngineeringSystem = () => {
  const [expandedSection, setExpandedSection] = useState<'career' | 'developer' | null>(null);

  const handleExpand = (section: 'career' | 'developer') => {
    setExpandedSection(section);
  };

  const handleCollapse = () => {
    setExpandedSection(null);
  };

  return (
    <div className="min-h-screen bg-main-gradient flex flex-col overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-career-accent/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-developer-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-glow" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-20 bg-black/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <a href="#" className="text-2xl font-bold text-white">UIT-KE</a>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-white/80 hover:text-white">Home</a>
              <a href="#" className="text-white/80 hover:text-white">About</a>
              <a href="#" className="text-white/80 hover:text-white">Contact</a>
            </nav>

            {/* CTA */}
            <a href="#" className="px-6 py-2 bg-accent text-white font-semibold rounded-full hover:bg-accent-dark transition-colors">
              Get Started
            </a>
          </div>
        </div>
      </header>

      {/* Main sections */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pb-8 flex-grow">
        <div className="grid md:grid-cols-2 gap-8">
          <SectionCard
            title="Career Guidance"
            description="Discover your ideal career path with personalized recommendations. Get insights into required skills, education pathways, and industry trends tailored to your interests and goals."
            icon={
              <svg className="w-8 h-8 text-career-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
              </svg>
            }
            variant="career"
            isExpanded={expandedSection === 'career'}
            onExpand={() => handleExpand('career')}
            onCollapse={handleCollapse}
          />

          <SectionCard
            title="Developer Insights"
            description="Access comprehensive knowledge base datasets and technical documentation. Perfect for developers who need detailed information about career data structures and system capabilities."
            icon={
              <svg className="w-8 h-8 text-developer-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            }
            variant="developer"
            isExpanded={expandedSection === 'developer'}
            onExpand={() => handleExpand('developer')}
            onCollapse={handleCollapse}
          />
        </div>
      </div>

    </div>
  );
};

export default KnowledgeEngineeringSystem;
