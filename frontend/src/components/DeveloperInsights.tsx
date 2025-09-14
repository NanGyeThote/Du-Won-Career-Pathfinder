
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Plus, Send, Bot, User, Search, FileDown } from 'lucide-react';
import Container from './ui/Container';
import VoiceInputButton from './VoiceInputButton';

// --- Type Definitions ---
interface Topic {
  id: number;
  name: string;
  numSections: number;
  sections: string[];
}

interface DeveloperInsightsProps {
  onBack: () => void;
}

interface Message {
  sender: 'user' | 'bot';
  text: string;
  sources?: SourceDocument[];
}

interface SourceDocument {
  content: string;
  metadata: SourceMetadata;
}

interface SourceMetadata {
  topic: string;
  section: string;
}

interface KBSection {
  title: string;
  content: string;
}

interface KBEntry {
  title: string;
  sections: KBSection[];
}

// --- Main Component ---
const DeveloperInsights = ({ onBack }: DeveloperInsightsProps) => {
  const [view, setView] = useState('builder'); // builder, generated, testing
  const [topics, setTopics] = useState<Topic[]>([
    { id: 1, name: 'Software Engineer', numSections: 2, sections: ['Job description', 'Requirements'] },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedKb, setGeneratedKb] = useState<KBEntry[] | null>(null);

  const handleKbGenerated = (kb: KBEntry[]) => {
    setGeneratedKb(kb);
    setView('generated');
  };

  const handleStartTesting = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/kb/test-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generatedKb),
      });
      if (!response.ok) throw new Error('Failed to set up test environment');
      setView('testing');
    } catch (error) {
      console.error("Error setting up test environment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setView('builder');
    setGeneratedKb(null);
  };

  const renderView = () => {
    switch (view) {
      case 'generated':
        return <GeneratedView kb={generatedKb} onStartTesting={handleStartTesting} onReset={handleReset} isLoading={isLoading} />;
      case 'testing':
        return <TestingView onBack={() => setView('generated')} />;
      default:
        return <BuilderView onBack={onBack} onKbGenerated={handleKbGenerated} topics={topics} setTopics={setTopics} isLoading={isLoading} setIsLoading={setIsLoading} />;
    }
  };

  return (
    <div className="w-full text-white h-full flex flex-col bg-blue-950">
      {renderView()}
    </div>
  );
};

// --- View Components ---

const BuilderView = ({ onBack, onKbGenerated, topics, setTopics, isLoading, setIsLoading }) => {
  const addTopic = () => setTopics([...topics, { id: Date.now(), name: '', numSections: 1, sections: ['Job description', 'Requirements'] }]);
  const removeTopic = (id: number) => setTopics(topics.filter(t => t.id !== id));
  const updateTopic = (id: number, updatedFields: Partial<Topic>) => {
    setTopics(topics.map(t => t.id === id ? { ...t, ...updatedFields } : t));
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    const payload = { topics: topics.map(({ name, sections, numSections }) => ({ name, sections, num_entries: numSections })) };
    try {
      const response = await fetch('http://localhost:8000/api/kb/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      onKbGenerated(data);
    } catch (error) {
      console.error("Error generating knowledge base:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex-shrink-0 bg-blue-950/80 backdrop-blur-sm border-b border-blue-900/50 z-10">
        <Container size="lg" className="py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Database Builder</h2>
              <p className="text-slate-400 text-xs sm:text-sm">Define topics to generate a knowledge base for the RAG system.</p>
            </div>
            <Button onClick={onBack} variant="outline" className="bg-transparent border-slate-600 hover:bg-slate-800 hover:border-slate-500 text-sm sm:text-base self-start sm:self-auto">
              &larr; Back
            </Button>
          </div>
        </Container>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Container size="lg" className="py-4 sm:py-6">
          <div className="grid gap-4 sm:gap-6">
            {topics.map(topic => (
              <TopicCard key={topic.id} topic={topic} onUpdate={updateTopic} onRemove={removeTopic} />
            ))}
             {topics.length === 0 && (
              <div className="text-center py-12 sm:py-16 border-2 border-dashed border-blue-800 rounded-lg mx-4 sm:mx-0">
                <h3 className="text-lg sm:text-xl font-semibold text-slate-300">No Topics Yet</h3>
                <p className="text-slate-500 mt-2 text-sm sm:text-base">Click "Add Topic" to get started.</p>
              </div>
            )}
          </div>
        </Container>
      </main>

      {/* Footer */}
      <footer className="flex-shrink-0 bg-blue-950/80 backdrop-blur-sm border-t border-blue-900/50">
        <Container size="lg" className="py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
            <div className="text-xs sm:text-sm text-slate-400">
              {topics.length} {topics.length === 1 ? 'topic' : 'topics'}
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <Button variant="outline" onClick={addTopic} className="bg-transparent border-blue-800 hover:bg-blue-800 text-sm sm:text-base w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add Topic
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={isLoading || topics.length === 0 || topics.some(t => !t.name.trim())}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm sm:text-base w-full sm:w-auto"
              >
                {isLoading ? 'Generating...' : 'Generate Database'}
              </Button>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
};


const GeneratedView = ({ kb, onStartTesting, onReset, isLoading }) => {
  const downloadJson = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(kb, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "knowledge_base.json";
    link.click();
  };

  return (
    <div className="flex flex-col h-full p-3 sm:p-4 lg:p-6 xl:p-8">
      <div className="text-center mb-4 sm:mb-6 flex-shrink-0">
        <h2 className="text-2xl sm:text-3xl font-bold text-white">Database Generated Successfully!</h2>
        <p className="text-slate-300 mt-2 text-sm sm:text-base">Your knowledge base has been created. You can download it or test it with our RAG system.</p>
      </div>
      
      <div className="flex-1 flex flex-col min-h-0">
        <Card className="flex-1 flex flex-col bg-blue-900/50 border-blue-800">
          <CardContent className="flex-1 p-0">
            <pre className="h-full overflow-auto p-3 sm:p-4 text-xs sm:text-sm whitespace-pre-wrap text-slate-200">{JSON.stringify(kb, null, 2)}</pre>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-4 sm:mt-6 flex-shrink-0">
        <Button onClick={onReset} variant="outline" className="bg-transparent border-slate-600 hover:bg-slate-800 text-sm sm:text-base">
          &larr; Create Another
        </Button>
        <Button onClick={downloadJson} className="bg-transparent border-slate-600 hover:bg-slate-800 text-sm sm:text-base">
          <FileDown className="w-4 h-4 mr-2"/>Download JSON
        </Button>
        <Button onClick={onStartTesting} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm sm:text-base">
          {isLoading ? 'Preparing...' : 'Test with RAG'}
        </Button>
      </div>
    </div>
  );
};

const KBEntryCard = ({ entry }) => {
  return (
    <Card className="bg-black/30 border-gray-700 text-left">
      <CardHeader>
        <CardTitle className="text-lg">{entry.title} (ID: {entry.generate_id})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {entry.sections.map((section, index) => (
          <div key={index}>
            <h4 className="font-semibold text-gray-300">{section.title}</h4>
            <p className="text-gray-400 whitespace-pre-wrap">{section.content}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

const TestingView = ({ onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatContainerRef.current?.scrollTo(0, chatContainerRef.current.scrollHeight);
  }, [messages]);

  const handleSendMessage = async () => {
    if (input.trim() === '' || isLoading) return;
    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage, { text: '', sender: 'bot' }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/kb/test-chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

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
                  setMessages(prev => {
                      const lastMsgIndex = prev.length - 1;
                      const updatedMessages = [...prev];
                      updatedMessages[lastMsgIndex] = { ...updatedMessages[lastMsgIndex], text: parsed.content };
                      return updatedMessages;
                  });
              } else if (parsed.type === 'sources') {
                setMessages(prev => {
                    const lastMsgIndex = prev.length - 1;
                    const updatedMessages = [...prev];
                    updatedMessages[lastMsgIndex] = { ...updatedMessages[lastMsgIndex], sources: parsed.sources };
                    return updatedMessages;
                });
              }
            } catch (e) {
              // Ignore parsing errors
            }
          }
        }
      }
    } catch (error) {
      console.error("Test chat error:", error);
      setMessages(prev => {
        const lastMsgIndex = prev.length - 1;
        const updatedMessages = [...prev];
        updatedMessages[lastMsgIndex] = { ...updatedMessages[lastMsgIndex], text: 'Sorry, something went wrong.' };
        return updatedMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-3 sm:p-4 lg:p-6 xl:p-8">
      <div className="mb-4 sm:mb-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Test Your Database</h2>
            <p className="text-slate-300 text-sm sm:text-base">Chat with your knowledge base using our RAG system to test its performance.</p>
          </div>
          <Button onClick={onBack} variant="outline" className="bg-transparent border-slate-600 hover:bg-slate-800 text-sm sm:text-base self-start sm:self-auto">
            &larr; Back to Result
          </Button>
        </div>
      </div>
      
      <div className="flex-1 bg-blue-900/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 xl:p-8 border border-blue-800 flex flex-col max-w-7xl mx-auto w-full">
        <div ref={chatContainerRef} className="flex-1 space-y-4 sm:space-y-6 overflow-y-auto mb-3 sm:mb-4">
          {messages.length === 0 && (
            <div className="text-center text-slate-400 py-12">
              <Bot className="w-16 h-16 mx-auto mb-6 opacity-50" />
              <p className="text-lg">Start a conversation to test your knowledge base!</p>
              <p className="text-sm text-slate-500 mt-2">Ask questions about your job topics and requirements</p>
            </div>
          )}
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-2 sm:gap-3 lg:gap-4 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
              {msg.sender === 'bot' && <Bot className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-indigo-400 flex-shrink-0 mt-1" />}
              <div className={`max-w-[85%] sm:max-w-[75%] lg:max-w-4xl p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-lg ${
                msg.sender === 'user' 
                  ? 'bg-indigo-600/80 border border-indigo-500 text-white ml-auto' 
                  : 'bg-blue-800/50 border border-blue-700 text-slate-200'
              }`}>
                {msg.text === '' && msg.sender === 'bot' ? (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    <span className="ml-2 text-sm text-slate-400">Thinking...</span>
                  </div>
                ) : (
                  <p className="leading-relaxed text-xs sm:text-sm lg:text-base whitespace-pre-wrap break-words">{msg.text}</p>
                )}
              </div>
              {msg.sender === 'user' && <User className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-slate-400 flex-shrink-0 mt-1" />}
            </div>
          ))}
        </div>
        
        <div className="flex items-end gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-blue-800">
          <div className="flex-1 relative">
            <Input 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendMessage()} 
              placeholder="Ask about your knowledge base or use voice input..."
              className="bg-blue-800 border-blue-700 text-white placeholder-slate-400 focus:border-indigo-500 text-sm sm:text-base h-10 sm:h-12 pr-12"
              disabled={isLoading}
            />
            <div className="absolute right-1 top-1/2 transform -translate-y-1/2">
              <VoiceInputButton
                onTranscription={(text) => setInput(text)}
                disabled={isLoading}
                className="bg-blue-700 hover:bg-blue-600"
              />
            </div>
          </div>
          <Button 
            onClick={handleSendMessage} 
            disabled={isLoading || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg h-10 sm:h-12 min-w-[40px] sm:min-w-[48px]"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const TopicCard = ({ topic, onUpdate, onRemove }) => {
  const [newSection, setNewSection] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAddSection = () => {
    if (newSection.trim() === '') return;
    onUpdate(topic.id, { sections: [...topic.sections, newSection.trim()] });
    setNewSection('');
  };

  const handleRemoveSection = (index: number) => {
    onUpdate(topic.id, { sections: topic.sections.filter((_, i) => i !== index) });
  };

  return (
    <Card className="bg-blue-900/50 border-blue-800 overflow-hidden transition-all duration-300 hover:border-indigo-500/50">
      <div className="p-5">
        <div className="flex justify-between items-start gap-4">
          {/* Left Side: Title and Sections */}
          <div className="flex-1">
            <Input
              placeholder="e.g., Software Engineer, Product Manager"
              value={topic.name}
              onChange={e => onUpdate(topic.id, { name: e.target.value })}
              className="text-lg font-semibold bg-transparent border-0 border-b-2 border-blue-800 rounded-none px-1 focus:ring-0 focus:border-indigo-500"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {topic.sections.map((section, index) => (
                <span key={index} className="bg-blue-800 text-blue-200 px-2.5 py-1 rounded-full text-xs font-medium">
                  {section}
                </span>
              ))}
            </div>
          </div>

          {/* Right Side: Controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
             <div className="flex items-center gap-2">
                <label htmlFor={`numSections-${topic.id}`} className="text-sm text-slate-400">Entries:</label>
                <Input
                id={`numSections-${topic.id}`}
                type="number"
                min="1"
                max="10"
                value={topic.numSections}
                onChange={e => onUpdate(topic.id, { numSections: parseInt(e.target.value, 10) || 1 })}
                className="w-16 text-center bg-blue-800 border-blue-700"
                title="Number of entries to generate for this topic"
                />
            </div>
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              variant="ghost"
              size="sm"
              className="text-blue-300 hover:text-white hover:bg-blue-800"
            >
              {isExpanded ? 'Collapse' : 'Manage'}
            </Button>
            <Button
              onClick={() => onRemove(topic.id)}
              variant="ghost"
              size="sm"
              className="text-blue-400 hover:text-red-500 hover:bg-red-500/10"
              title="Delete Topic"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Expandable Section Management */}
      {isExpanded && (
        <div className="bg-blue-900/60 mt-2 p-5 border-t border-blue-800">
           <h4 className="text-md font-semibold text-slate-200 mb-3">Manage Sections</h4>
          <div className="max-h-60 overflow-y-auto space-y-2 pr-2 mb-4">
            {topic.sections.map((section, index) => (
              <div key={index} className="flex items-center justify-between bg-blue-800/50 p-2 rounded-md">
                <span className="text-slate-300 text-sm">{section}</span>
                <Button
                  onClick={() => handleRemoveSection(index)}
                  variant="ghost"
                  size="sm"
                  className="text-blue-400 hover:text-red-500"
                  disabled={topic.sections.length <= 1}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 pt-4 border-t border-slate-700/50">
            <Input
              placeholder="Add a new section (e.g., Skills)"
              value={newSection}
              onChange={e => setNewSection(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddSection()}
              className="bg-blue-800 border-blue-700"
            />
            <Button onClick={handleAddSection} disabled={!newSection.trim()} className="bg-indigo-600 hover:bg-indigo-700">
              Add
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};


export default DeveloperInsights;
