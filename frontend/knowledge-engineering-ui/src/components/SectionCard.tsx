import { useState } from 'react';
import { cn } from '@/lib/utils';

interface SectionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  variant: 'career' | 'developer';
  isExpanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
}

const SectionCard = ({ 
  title, 
  description, 
  icon, 
  variant, 
  isExpanded, 
  onExpand, 
  onCollapse 
}: SectionCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (isExpanded) {
      onCollapse();
    } else {
      onExpand();
    }
  };

  if (isExpanded) {
    return (
      <div className="fixed inset-0 z-[9999] animate-expand bg-black/10 backdrop-blur-sm">
        <div className={cn(
          "h-full w-full p-8",
          variant === 'career' ? 'bg-career-gradient' : 'bg-developer-gradient'
        )}>
          <div className="max-w-4xl mx-auto h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "p-3 rounded-xl",
                  variant === 'career' ? 'bg-career-accent/20' : 'bg-developer-accent/20'
                )}>
                  {icon}
                </div>
                <h1 className="text-4xl font-bold text-white">{title}</h1>
              </div>
              <button
                onClick={onCollapse}
                className="p-3 rounded-xl bg-white/20 hover:bg-white/30 transition-colors duration-200"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className={cn(
                    "w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center",
                    variant === 'career' ? 'bg-career-accent' : 'bg-developer-accent'
                  )}>
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    Chat Interface Coming Soon
                  </h2>
                  <p className="text-white/80 text-lg">
                    The interactive chat interface for {variant === 'career' ? 'career guidance' : 'developer insights'} will be implemented here.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative h-full rounded-2xl p-8 cursor-pointer transition-all duration-500 overflow-hidden group",
        "border border-white/10 backdrop-blur-sm",
        variant === 'career' ? 'bg-career-gradient hover:shadow-career' : 'bg-developer-gradient hover:shadow-developer',
        isHovered && "scale-[1.02] -translate-y-2"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-white/20 blur-xl" />
        <div className="absolute bottom-4 left-4 w-24 h-24 rounded-full bg-white/10 blur-xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        <div className={cn(
          "w-16 h-16 rounded-xl mb-6 flex items-center justify-center transition-all duration-300",
          variant === 'career' ? 'bg-career-accent/20' : 'bg-developer-accent/20',
          isHovered && "animate-float"
        )}>
          {icon}
        </div>

        <h2 className="text-3xl font-bold text-white mb-4 transition-all duration-300">
          {title}
        </h2>

        <p className="text-white/80 text-lg leading-relaxed mb-8 flex-1">
          {description}
        </p>

        <div className="flex items-center text-white/60 group-hover:text-white transition-colors duration-300">
          <span className="mr-2">Click to explore</span>
          <svg 
            className={cn(
              "w-5 h-5 transition-transform duration-300",
              isHovered && "translate-x-1"
            )} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>

      {/* Hover glow effect */}
      <div className={cn(
        "absolute inset-0 opacity-0 transition-opacity duration-500 rounded-2xl",
        variant === 'career' ? 'bg-career-accent/10' : 'bg-developer-accent/10',
        isHovered && "opacity-100 animate-glow"
      )} />
    </div>
  );
};

export default SectionCard;