import React from 'react';
import { Button } from '@/components/ui/button';
import { useVoiceInput } from '../hooks/useVoiceInput';

interface VoiceInputButtonProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
  className?: string;
  restrictToCareerGuidance?: boolean;
  onError?: (message: string) => void;
}

const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscription,
  disabled = false,
  className = "",
  restrictToCareerGuidance = false,
  onError,
}) => {
  const { isListening, audioSupported, toggleRecording } = useVoiceInput({
    onTranscription,
    restrictToCareerGuidance,
    onError: (error) => {
      console.error('Voice input error:', error);
      // Clean error message - remove any localhost URLs
      const cleanError = error.replace(/http:\/\/localhost:\d+/g, 'the server');
      if (onError) {
        onError(cleanError);
      } else {
        alert(cleanError);
      }
    },
  });

  if (!audioSupported) {
    return null;
  }

  return (
    <div className="relative">
      {/* Animated ring around button when recording */}
      {isListening && (
        <div className="absolute inset-0 rounded-md">
          <div className="absolute inset-0 rounded-md bg-red-500/30 animate-ping"></div>
          <div className="absolute inset-0 rounded-md bg-red-500/20 animate-pulse"></div>
        </div>
      )}
      
      <Button
        onClick={toggleRecording}
        disabled={disabled}
        className={`relative p-2 h-8 w-8 rounded-md border-none transition-all duration-200 ${
          isListening 
            ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/50 scale-110' 
            : 'bg-white/10 hover:bg-white/20'
        } ${className}`}
        type="button"
      >
        {isListening ? (
          <div className="flex items-center justify-center">
            <svg className="w-4 h-4 text-white animate-bounce" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h12v12H6z"/>
            </svg>
          </div>
        ) : (
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
          </svg>
        )}
      </Button>
    </div>
  );
};

export default VoiceInputButton;
