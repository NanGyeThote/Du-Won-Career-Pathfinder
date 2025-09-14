import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Footer from '../components/Footer';
import { useQuiz } from '../contexts/QuizContext';
import VoiceInputButton from '../components/VoiceInputButton';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}


const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI assistant. Feel free to ask me anything! You can type or use voice input.',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { quizData } = useQuiz();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const showError = (message: string) => {
    setErrorMessage(message);
  };

  const isCareerRelated = (text: string): boolean => {
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
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    // Check if message is career-related
    if (!isCareerRelated(inputMessage)) {
      showError('This chatbot is restricted to career guidance questions only. Please ask about careers, jobs, or professional development.');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Use dynamic quiz data from context if available, otherwise null
    const dynamicQuizData = quizData ? {
      GPA: quizData.GPA || '',
      Python: quizData.Python || '',
      SQL: quizData.SQL || '',
      Java: quizData.Java || '',
      Interested_Domain_1: quizData.Interested_Domain_1 || '',
      Interested_Domain_2: quizData.Interested_Domain_2 || '',
      Projects_1: quizData.Projects_1 || '',
      Projects_2: quizData.Projects_2 || '',
      Projects_3: quizData.Projects_3 || ''
    } : null;

    try {
      const response = await fetch('http://localhost:8000/api/chatbot/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          history: messages.map(msg => ({
            text: msg.text,
            sender: msg.sender
          })),
          quiz_data: dynamicQuizData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: '',
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'token') {
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === botMessage.id 
                      ? { ...msg, text: data.content }
                      : msg
                  )
                );
              } else if (data.error) {
                throw new Error(data.error);
              }
            } catch (e) {
              // Ignore JSON parse errors for incomplete chunks
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };


  return (
    <div className="min-h-screen flex flex-col bg-main-gradient text-white">
      <div className="flex-1">
        <div className="max-w-4xl mx-auto pt-20 sm:pt-28 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8">
          <motion.h1 
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            AI Chatbot
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 border border-white/20 flex flex-col max-w-7xl mx-auto w-full h-[75vh] sm:h-[70vh] max-h-[500px] sm:max-h-[600px]">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 text-white">AI Assistant</h2>
                <p className="text-sm sm:text-base text-white/70">Chat with our AI assistant about anything</p>
              </div>
              
              <div ref={messagesEndRef} className="flex-1 space-y-3 sm:space-y-4 lg:space-y-6 overflow-y-auto mb-3 sm:mb-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      className={`flex items-start gap-2 sm:gap-3 lg:gap-4 ${message.sender === 'user' ? 'justify-end' : ''}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {message.sender === 'bot' && (
                        <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                      )}
                      <div className={`p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-lg ${ 
                        message.sender === 'user' 
                          ? 'bg-blue-600/80 border border-blue-500 text-white ml-auto max-w-[85%] sm:max-w-[75%] lg:max-w-[70%]' 
                          : 'bg-gray-800/50 border border-white/20 text-white max-w-[85%] sm:max-w-[75%] lg:max-w-[70%]'
                      }`}>
                        {message.text === '' && message.sender === 'bot' ? (
                          <div className="flex items-center gap-1 sm:gap-2">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/60 rounded-full animate-pulse"></div>
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/60 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/60 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                            <span className="ml-1 sm:ml-2 text-xs sm:text-sm text-white/70">Thinking...</span>
                          </div>
                        ) : (
                          <p
                            className="leading-relaxed text-xs sm:text-sm lg:text-base break-words"
                            dangerouslySetInnerHTML={{ __html: message.text.replace(/\n/g, '<br />') }}
                          />
                        )}
                      </div>
                      {message.sender === 'user' && (
                        <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                
                <div className="flex items-end gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-white/10">
                  <div className="flex-1 relative">
                    <Input 
                      value={inputMessage} 
                      onChange={(e) => setInputMessage(e.target.value)} 
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message or use voice input..."
                      disabled={isLoading}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/60 focus:border-career-accent focus:ring-career-accent/20 resize-none text-sm sm:text-base h-10 sm:h-12 pr-12"
                    />
                    <div className="absolute right-1 top-1/2 transform -translate-y-1/2">
                      <VoiceInputButton
                        onTranscription={(text) => setInputMessage(text)}
                        disabled={isLoading}
                        className="bg-white/10 hover:bg-white/20"
                        restrictToCareerGuidance={true}
                        onError={showError}
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={sendMessage} 
                    disabled={isLoading || !inputMessage.trim()}
                    className="bg-career-accent hover:bg-career-accent/90 text-white px-3 sm:px-4 lg:px-6 py-2 sm:py-3 h-10 sm:h-12 min-w-[40px] sm:min-w-[48px]"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    )}
                  </Button>
                </div>
              </div>

              {/* Animated Error Message */}
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50"
                >
                  <div className="bg-red-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-lg shadow-lg border border-red-400/30 max-w-md mx-auto">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-red-200" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium">{errorMessage}</p>
                    </div>
                  </div>
                </motion.div>
              )}
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Chatbot;
