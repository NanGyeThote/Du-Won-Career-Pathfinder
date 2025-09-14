import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import CareerQuiz from './CareerQuiz';
import DeveloperInsights from './DeveloperInsights';
import CareerChoice from './CareerChoice';
import CvUpload from './CvUpload';

interface SectionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  variant: 'career' | 'developer';
  isExpanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
  careerChoice: 'quiz' | 'cv' | null;
  onCareerChoice: (choice: 'quiz' | 'cv') => void;
  onBack: () => void;
}

const SectionCard = ({ 
  title, 
  description, 
  icon, 
  variant, 
  isExpanded, 
  onExpand, 
  onCollapse,
  careerChoice,
  onCareerChoice,
  onBack
}: SectionCardProps) => {
  return (
    <>
      <motion.div
        layoutId={`card-container-${title}`}
        className={cn(
          "relative h-full rounded-lg sm:rounded-xl p-4 sm:p-6 cursor-pointer overflow-hidden min-h-[240px] sm:min-h-[280px]",
          "border border-white/10 backdrop-blur-sm",
          variant === 'career' ? 'bg-career-gradient hover:shadow-career' : 'bg-developer-gradient hover:shadow-developer'
        )}
        onClick={onExpand}
        whileHover={{ scale: 1.02, y: -5 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div className="relative z-10 h-full flex flex-col">
          <motion.div
            className={cn(
              "w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl mb-4 sm:mb-6 flex items-center justify-center",
              variant === 'career' ? 'bg-career-accent/20' : 'bg-developer-accent/20'
            )}
            whileHover={{ rotate: 15 }}
          >
            {icon}
          </motion.div>

          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2 sm:mb-3">{title}</h2>

          <p className="text-white/80 text-sm sm:text-base leading-relaxed mb-4 sm:mb-6 flex-1">
            {description}
          </p>

          <div className="flex items-center text-white/70 group-hover:text-white transition-colors duration-300">
            <span className="mr-2 text-xs sm:text-sm">Click to explore</span>
            <motion.svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              whileHover={{ x: 5 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </motion.svg>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            layoutId={`card-container-${title}`}
            className="fixed inset-0 z-[99999] overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className={cn(
                "min-h-screen w-full p-4 sm:p-6 lg:p-8",
                variant === "career"
                  ? "bg-career-gradient"
                  : "bg-developer-gradient"
              )}
            >
              <div className="w-full min-h-[calc(100vh-2rem)] sm:min-h-[calc(100vh-3rem)] lg:min-h-[calc(100vh-4rem)] flex flex-col">

                {/* Header with title */}
                <motion.div
                  className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 mt-2"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div
                    className={cn(
                      "p-2 sm:p-3 rounded-lg sm:rounded-xl self-start",
                      variant === "career"
                        ? "bg-career-accent/20"
                        : "bg-developer-accent/20"
                    )}
                  >
                    {icon}
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">{title}</h1>
                </motion.div>

                <motion.div
                  className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/20"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="h-full flex flex-col">
                    {variant === "career" ? (
                      <div className="flex-1 flex items-center justify-center">
                        {careerChoice === 'quiz' ? (
                          <CareerQuiz onBack={onBack} />
                        ) : careerChoice === 'cv' ? (
                          <CvUpload onBack={onBack} />
                        ) : (
                          <CareerChoice onChoice={onCareerChoice} onBack={onCollapse} />
                        )}
                      </div>
                    ) : (
                      <div className="flex-1 flex">
                        <DeveloperInsights onBack={onCollapse} />
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SectionCard;
