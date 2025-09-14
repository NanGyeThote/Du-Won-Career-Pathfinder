import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useModel } from '../contexts/ModelContext';

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

interface ChatbotProps {
  initialHistory: Message[];
  onBack?: () => void;
}

const Chatbot = ({ initialHistory, onBack }: ChatbotProps) => {
  const [messages, setMessages] = useState<Message[]>(initialHistory);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { selectedModel } = useModel();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputValue.trim() && !isLoading) {
      setIsLoading(true);
      const userMessage: Message = { text: inputValue, sender: 'user' };
      const currentMessages = [...messages, userMessage];
      setMessages(currentMessages);
      setInputValue('');

      try {
        const response = await fetch('http://localhost:8000/api/chat/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userMessage.text, history: messages, model: selectedModel }),
        });

        if (!response.body) {
          throw new Error('No response body');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let botResponse = '';

        setMessages(prev => [...prev, { text: '', sender: 'bot' }]);

        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          const chunk = decoder.decode(value, { stream: !done });
          
          const lines = chunk.split('\n\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonStr = line.substring(6);
              if (jsonStr === '[DONE]') {
                done = true;
                break;
              }
              try {
                const parsed = JSON.parse(jsonStr);
                if (parsed.type === 'token') {
                  botResponse = parsed.content;
                  setMessages(prev => {
                      const lastMsgIndex = prev.length - 1;
                      const updatedMessages = [...prev];
                      updatedMessages[lastMsgIndex] = { ...updatedMessages[lastMsgIndex], text: botResponse };
                      return updatedMessages;
                  });
                }
              } catch (e) {
                // Ignore parsing errors for incomplete JSON chunks
              }
            }
          }
        }
      } catch (error) {
        console.error("Error sending message:", error);
        setMessages(prev => {
            const lastMsgIndex = prev.length - 1;
            const updatedMessages = [...prev];
            updatedMessages[lastMsgIndex] = { ...updatedMessages[lastMsgIndex], text: 'Sorry, something went wrong. Please try again.' };
            return updatedMessages;
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="w-full text-white h-full flex flex-col px-2 sm:px-4 lg:px-6">
      {onBack && (
        <div className="mb-4 max-w-7xl mx-auto w-full">
          <Button 
            onClick={onBack} 
            variant="outline"
            className="border-white/40 text-white hover:bg-white/10 hover:border-white/60 hover:text-white transition-all duration-200"
          >
            ← Back
          </Button>
        </div>
      )}
      <div className="mb-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-white">Career Assistant</h2>
            <p className="text-white/70">Chat with our AI assistant about your career path and opportunities</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/20 flex flex-col max-w-7xl mx-auto w-full h-[70vh] max-h-[600px]">
        <div ref={scrollAreaRef} className="flex-1 space-y-6 overflow-y-auto mb-4">
          {messages.map((message, index) => (
            <motion.div
              key={index}
              className={`flex items-start gap-4 ${message.sender === 'user' ? 'justify-end' : ''}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {message.sender === 'bot' && (
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              )}
              <div className={`p-4 rounded-xl shadow-lg ${ 
                message.sender === 'user' 
                  ? 'bg-orange-600/80 border border-orange-500 text-white ml-auto max-w-[70%]' 
                  : 'bg-gray-800/50 border border-white/20 text-white max-w-[70%]'
              }`}>
                {message.text === '' && message.sender === 'bot' ? (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    <span className="ml-2 text-sm text-white/70">Thinking...</span>
                  </div>
                ) : (
                  <p
                    className="leading-relaxed text-sm sm:text-base"
                    dangerouslySetInnerHTML={{ __html: message.text.replace(/\n/g, '<br />') }}
                  />
                )}
              </div>
              {message.sender === 'user' && (
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </motion.div>
          ))}
        </div>
        
        <div className="flex items-end gap-3 pt-6 border-t border-white/10">
          <div className="flex-1">
            <Input 
              value={inputValue} 
              onChange={(e) => setInputValue(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              placeholder={isLoading ? "AI is thinking..." : "Ask about career opportunities... (Press Enter to send, Shift+Enter for new line)"}
              className="input-base w-full text-base py-4 px-4 min-h-[52px] resize-none"
              disabled={isLoading}
            />
          </div>
          <Button 
            onClick={handleSendMessage} 
            disabled={!inputValue.trim() || isLoading}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-4 h-[52px] rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
