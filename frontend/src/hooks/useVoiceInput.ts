import { useState, useRef, useCallback } from 'react';

interface UseVoiceInputOptions {
  onTranscription?: (text: string) => void;
  onError?: (error: string) => void;
  restrictToCareerGuidance?: boolean;
}

interface UseVoiceInputReturn {
  isListening: boolean;
  audioSupported: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  toggleRecording: () => void;
}

export const useVoiceInput = (options: UseVoiceInputOptions = {}): UseVoiceInputReturn => {
  const [isListening, setIsListening] = useState(false);
  const [audioSupported, setAudioSupported] = useState(
    !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
  );
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const isCareerRelated = useCallback((text: string): boolean => {
    const careerKeywords = [
      // General career terms
      'career', 'job', 'work', 'profession', 'employment', 'salary', 'interview', 'resume', 'cv',
      'skills', 'experience', 'qualification', 'education', 'training', 'internship', 'company',
      'industry', 'position', 'role', 'promotion', 'development', 'growth', 'opportunity',
      'field', 'sector', 'workplace', 'colleague', 'manager', 'boss', 'employee', 'freelance',
      'business', 'startup', 'corporate', 'office', 'remote', 'hybrid', 'full-time', 'part-time',
      'contract', 'temporary', 'permanent', 'benefits', 'pension', 'vacation', 'leave',
      'networking', 'linkedin', 'portfolio', 'certification', 'degree', 'diploma', 'course',
      'study', 'learn', 'skill', 'talent', 'ability', 'expertise', 'knowledge', 'background',
      
      // Technical career fields
      'software', 'engineering', 'developer', 'programmer', 'coding', 'programming', 'technology',
      'computer', 'it', 'tech', 'data', 'science', 'analyst', 'scientist', 'engineer',
      'web', 'mobile', 'app', 'application', 'database', 'system', 'network', 'security',
      'cybersecurity', 'ai', 'artificial intelligence', 'machine learning', 'ml', 'devops',
      'frontend', 'backend', 'fullstack', 'ui', 'ux', 'design', 'designer', 'architect',
      
      // Other professional fields
      'marketing', 'sales', 'finance', 'accounting', 'management', 'consulting', 'consultant',
      'project manager', 'product manager', 'analyst', 'research', 'healthcare', 'medical',
      'nurse', 'doctor', 'teacher', 'education', 'law', 'lawyer', 'legal', 'architecture',
      'construction', 'manufacturing', 'logistics', 'supply chain', 'operations', 'hr',
      'human resources', 'recruitment', 'recruiting', 'talent acquisition'
    ];
    
    // Common greetings and polite phrases that should always be allowed
    const greetingKeywords = [
      'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'good night',
      'goodbye', 'bye', 'see you', 'thanks', 'thank you', 'please', 'excuse me',
      'how are you', 'nice to meet you', 'have a good day', 'take care'
    ];
    
    const lowerText = text.toLowerCase();
    
    // Allow greetings and polite phrases
    const isGreeting = greetingKeywords.some(keyword => lowerText.includes(keyword));
    if (isGreeting) return true;
    
    // Check for career-related content
    return careerKeywords.some(keyword => lowerText.includes(keyword));
  }, []);

  const sendAudioToBackend = useCallback(async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio_file', audioBlob, 'recording.wav');
      
      const response = await fetch('http://localhost:8000/api/speech-to-text', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to transcribe audio');
      }
      
      const result = await response.json();
      const transcribedText = result.text;
      
      // Check if restriction is enabled and content is not career-related
      if (options.restrictToCareerGuidance && !isCareerRelated(transcribedText)) {
        const errorMessage = 'Voice input is restricted to career guidance questions only. Please ask about careers, jobs, or professional development.';
        options.onError?.(errorMessage);
        return;
      }
      
      options.onTranscription?.(transcribedText);
    } catch (error) {
      console.error('Error transcribing audio:', error);
      const errorMessage = 'Failed to transcribe audio. Please try again.';
      options.onError?.(errorMessage);
    }
  }, [options, isCareerRelated]);

  const startRecording = useCallback(async () => {
    if (!audioSupported || isListening) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await sendAudioToBackend(audioBlob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsListening(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      const errorMessage = 'Could not access microphone. Please check permissions.';
      options.onError?.(errorMessage);
    }
  }, [audioSupported, isListening, sendAudioToBackend, options]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const toggleRecording = useCallback(() => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isListening, startRecording, stopRecording]);

  return {
    isListening,
    audioSupported,
    startRecording,
    stopRecording,
    toggleRecording,
  };
};
