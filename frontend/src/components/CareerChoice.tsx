import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Container from './ui/Container';

interface CareerChoiceProps {
  onChoice: (choice: 'quiz' | 'cv') => void;
  onBack: () => void;
}

const CareerChoice = ({ onChoice, onBack }: CareerChoiceProps) => {
  return (
    <div className="w-full text-white h-full flex flex-col px-3 sm:px-4 lg:px-6 max-w-7xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <Button 
          onClick={onBack} 
          variant="outline"
          className="border-white/50 text-white/80 hover:bg-white/10 hover:border-white/80 text-sm sm:text-base"
        >
          ← Back
        </Button>
      </div>
      
      <div className="text-center mb-8 sm:mb-12 lg:mb-16">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 sm:mb-6 text-white">Choose Your Path</h2>
        <p className="text-white/80 text-base sm:text-lg lg:text-xl xl:text-2xl max-w-3xl mx-auto leading-relaxed px-4">How would you like to get your personalized career recommendations?</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto flex-1">
        <motion.button
          onClick={() => onChoice('quiz')}
          className="bg-white/10 backdrop-blur-sm p-6 sm:p-8 lg:p-10 text-left rounded-2xl sm:rounded-3xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:border-white/40 hover:shadow-xl group"
          whileHover={{ scale: 1.02, y: -6 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 mb-6 sm:mb-8 rounded-xl sm:rounded-2xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
            <svg className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-3 sm:mb-4 text-white group-hover:text-white transition-colors">Take Career Quiz</h3>
          <p className="text-white/70 text-sm sm:text-base lg:text-lg leading-relaxed">Answer a few questions about your interests, preferences, and goals to get personalized career recommendations</p>
        </motion.button>
        
        <motion.button
          onClick={() => onChoice('cv')}
          className="bg-white/10 backdrop-blur-sm p-6 sm:p-8 lg:p-10 text-left rounded-2xl sm:rounded-3xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:border-white/40 hover:shadow-xl group"
          whileHover={{ scale: 1.02, y: -6 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 mb-6 sm:mb-8 rounded-xl sm:rounded-2xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
            <svg className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-3 sm:mb-4 text-white group-hover:text-white transition-colors">Upload Your CV</h3>
          <p className="text-white/70 text-sm sm:text-base lg:text-lg leading-relaxed">Upload your resume for AI-powered analysis and personalized career insights based on your experience and skills</p>
        </motion.button>
      </div>
    </div>
  );
};

export default CareerChoice;