import React from 'react';

const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-black/20 backdrop-blur-sm mt-auto">
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="text-center">
          <p className="text-white/60 mb-2">
            University of Information Technology - Knowledge Engineering Project
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-white/40">
            <span>AI-Powered Career Intelligence</span>
            <span>•</span>
            <span>Real-time Knowledge Base</span>
            <span>•</span>
            <span>Personalized Recommendations</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
