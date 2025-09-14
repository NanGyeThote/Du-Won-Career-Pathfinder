import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Chatbot from './Chatbot';
import { useModel } from '../contexts/ModelContext';
import { useQuiz } from '../contexts/QuizContext';
import { Input } from './ui/input';

interface CareerQuizProps {
  onBack: () => void;
}

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

const csQuestions = [
  { id: 'GPA', question: 'What is your GPA?', type: 'number' },
  { id: 'Python', question: 'Rate your Python skills.', options: ['Strong', 'Intermediate', 'Weak'] },
  { id: 'SQL', question: 'Rate your SQL skills.', options: ['Strong', 'Intermediate', 'Weak'] },
  { id: 'Java', question: 'Rate your Java skills.', options: ['Strong', 'Intermediate', 'Weak'] },
  { id: 'Interested_Domain_1', question: 'What is your primary interested domain?', type: 'text' },
  { id: 'Interested_Domain_2', question: 'What is your secondary interested domain?', type: 'text' },
  { id: 'Projects_1', question: 'Describe a recent project.', type: 'text' },
  { id: 'Projects_2', question: 'Describe another project.', type: 'text' },
  { id: 'Projects_3', question: 'Describe a third project.', type: 'text' },
];

const genericQuestions = [
  {
    question: 'What are your main strengths or skills?',
    answers: ['Problem-solving', 'Creative thinking', 'Communication', 'Technical expertise', 'Leadership', 'Analytical thinking'],
  },
  {
    question: 'What industries or fields are you most interested in?',
    answers: ['Technology', 'Healthcare', 'Education', 'Finance', 'Marketing', 'Engineering', 'Arts and Design', 'Social Services'],
  },
  {
    question: 'What kind of work challenges do you enjoy the most?',
    answers: ['Troubleshooting and fixing problems', 'Designing and creating new things', 'Working with data and analysis', 'Managing teams and projects', 'Helping and supporting others'],
  },
  {
    question: 'What type of work do you want to be doing in the next 5 years?',
    answers: ['Leading a team', 'Starting my own business', 'Working in a specialized role', 'Contributing to a large project', 'Becoming an expert in my field'],
  },
  {
    question: 'Do you prefer to work in an office setting or remotely?',
    answers: ['In an office with a team', 'From home or any location', 'Hybrid setup', 'I prefer a flexible setup where I can choose'],
  },
  {
    question: 'How do you feel about taking on new responsibilities or roles?',
    answers: ['I enjoy learning and growing into new roles', 'I prefer to master one role before taking on more', 'I am open to change and challenges', 'I prefer stability in my responsibilities'],
  },
  {
    question: 'Do you prefer to work with a lot of structure, or do you prefer flexibility?',
    answers: ['I prefer a structured environment with clear guidelines', 'I enjoy flexibility and adapting to new situations', 'I like a mix of structure and flexibility'],
  },
  {
    question: 'What motivates you the most at work?',
    answers: ['Achieving goals and getting results', 'Being part of a team', 'Learning and growing professionally', 'Making a difference in people’s lives', 'Creating something new'],
  },
  {
    question: 'How important is salary compared to other factors in your career?',
    answers: ['Very important, I am focused on earning a good salary', 'Important, but not the only factor', 'I value work-life balance more than salary', 'Other factors like job satisfaction and growth matter more than salary'],
  },
  {
    question: 'What type of work environment do you feel most comfortable in?',
    answers: ['Collaborative and team-oriented', 'Independent and focused', 'Fast-paced and dynamic', 'Supportive and structured'],
  },
];

const CareerQuiz = ({ onBack }: CareerQuizProps) => {
  const [major, setMajor] = useState('');
  const [majorSelected, setMajorSelected] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const { selectedModel } = useModel();
  const { setQuizData } = useQuiz();

  const isCsMajor = major.toLowerCase() === 'computer science';
  const questions = isCsMajor ? csQuestions : genericQuestions;

  useEffect(() => {
    setSelectedAnswer(null);
  }, [currentQuestion]);

  useEffect(() => {
    if (quizFinished && !recommendation && !isLoadingRecommendation) {
      const fetchRecommendation = async () => {
        setIsLoadingRecommendation(true);
        try {
          let response;
          const history: Message[] = [];
          let userMessage = '';

          if (isCsMajor) {
            const csAnswers = {
                GPA: parseFloat(answers['GPA'] || '0'),
                Major: 'Computer Science',
                Python: answers['Python'] || '',
                SQL: answers['SQL'] || '',
                Java: answers['Java'] || '',
                Interested_Domain_1: answers['Interested_Domain_1'] || '',
                Interested_Domain_2: answers['Interested_Domain_2'] || '',
                Projects_1: answers['Projects_1'] || '',
                Projects_2: answers['Projects_2'] || '',
                Projects_3: answers['Projects_3'] || '',
                model: selectedModel,
                history,
            };

            // Store quiz data in context for chatbot use
            setQuizData({
              GPA: answers['GPA'] || '',
              Python: answers['Python'] || '',
              SQL: answers['SQL'] || '',
              Java: answers['Java'] || '',
              Interested_Domain_1: answers['Interested_Domain_1'] || '',
              Interested_Domain_2: answers['Interested_Domain_2'] || '',
              Projects_1: answers['Projects_1'] || '',
              Projects_2: answers['Projects_2'] || '',
              Projects_3: answers['Projects_3'] || '',
              Major: 'Computer Science'
            });

            userMessage = "Here are my quiz answers:\n" + Object.entries(answers).map(([key, value]) => `${key}: ${value}`).join('\n');
            response = await fetch('http://localhost:8000/api/career-quiz/cs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(csAnswers),
            });
          } else {
            userMessage = "Here are my quiz answers: " + Object.values(answers).join(', ');
            response = await fetch('http://localhost:8000/api/career-quiz', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ answers: Object.values(answers), model: selectedModel, history }),
            });
          }

          if (!response.ok) throw new Error('Failed to get career recommendation');
          const data = await response.json();
          setRecommendation(data.reply);
          setChatHistory([
            { text: userMessage, sender: 'user' },
            { text: data.reply, sender: 'bot' },
          ]);
        } catch (error) {
          console.error("Error fetching recommendation:", error);
          setRecommendation("Sorry, I couldn't generate a recommendation at this time.");
        } finally {
          setIsLoadingRecommendation(false);
        }
      };
      fetchRecommendation();
    }
  }, [quizFinished, answers, recommendation, isLoadingRecommendation, selectedModel, isCsMajor]);

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNext = () => {
    if (selectedAnswer) {
      const question = questions[currentQuestion];
      const questionId = (question as any).id || question.question;
      const newAnswers = { ...answers, [questionId]: selectedAnswer };
      setAnswers(newAnswers);
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setQuizFinished(true);
      }
    }
  };

  if (!majorSelected) {
    return (
      <div className="w-full text-white h-full flex flex-col px-3 sm:px-4 lg:px-6">
        <div className="mb-4 sm:mb-6 max-w-7xl mx-auto w-full">
          <Button 
            onClick={onBack} 
            variant="outline"
            className="border-white/40 text-white hover:bg-white/10 hover:border-white/60 hover:text-white transition-all duration-200 text-sm sm:text-base"
          >
            ← Back
          </Button>
        </div>
        
        <div className="flex-1 flex items-center justify-center px-4">
          <Card className="w-full max-w-sm sm:max-w-md bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl sm:text-2xl text-center">What is your major?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input 
                type="text" 
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                placeholder="e.g., Computer Science"
                className="bg-white/5 border-white/20 text-white placeholder:text-white/60 text-sm sm:text-base h-10 sm:h-12"
              />
              <Button onClick={() => setMajorSelected(true)} className="w-full bg-career-accent hover:bg-career-primary text-sm sm:text-base h-10 sm:h-12">Start Quiz</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoadingRecommendation) {
    return (
      <div className="w-full text-white h-full flex flex-col px-2 sm:px-4 lg:px-6">
        <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/20 flex flex-col max-w-7xl mx-auto w-full items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-white/20 rounded-xl flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">Generating Your Career Recommendation</h3>
            <p className="text-white/70 text-lg">Our AI is analyzing your responses to provide personalized insights...</p>
            <p className="text-white/50 text-sm mt-2">This might take a moment.</p>
          </div>
        </div>
      </div>
    );
  }

  if (quizFinished && recommendation) {
    return <Chatbot initialHistory={chatHistory} onBack={onBack} />;
  }

  const currentQ = questions[currentQuestion] as any;

  return (
    <div className="w-full text-white h-full flex flex-col px-2 sm:px-4 lg:px-6">
      <div className="mb-4 sm:mb-6 max-w-7xl mx-auto w-full">
        <Button 
          onClick={onBack} 
          variant="outline"
          className="border-white/40 text-white hover:bg-white/10 hover:border-white/60 hover:text-white transition-all duration-200 text-sm sm:text-base"
        >
          ← Back
        </Button>
      </div>
      
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 sm:gap-0">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Career Quiz</h2>
            <span className="text-white bg-career-accent/20 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold border border-career-accent/30 self-start sm:self-auto">
              Question {currentQuestion + 1} of {questions.length}
            </span>
          </div>
          
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full px-2 sm:px-0">
          <h3 className="text-lg sm:text-xl lg:text-2xl mb-6 sm:mb-8 text-white font-medium leading-relaxed">{currentQ.question}</h3>
          
          {isCsMajor ? (
            currentQ.options ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-8 sm:mb-10">
                {currentQ.options.map((option:string) => (
                  <motion.button
                    key={option}
                    className={`p-4 sm:p-5 lg:p-6 rounded-lg sm:rounded-xl text-left border-2 transition-all duration-200 ${selectedAnswer === option 
                        ? 'border-career-accent bg-career-accent/10 text-white shadow-lg' 
                        : 'border-white/20 bg-white/5 text-white/80 hover:bg-white/10 hover:border-white/40'
                    }`}
                    onClick={() => handleAnswer(option)}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-sm sm:text-base leading-relaxed">{option}</span>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="mb-8 sm:mb-10">
                <Input 
                  type={currentQ.type}
                  value={selectedAnswer || ''} 
                  onChange={(e) => handleAnswer(e.target.value)} 
                  className="bg-white/5 border-white/20 text-white text-sm sm:text-base h-10 sm:h-12"
                  placeholder="Enter your answer..."
                />
              </div>
            )
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-8 sm:mb-10">
              {currentQ.answers.map((answer:string) => (
                <motion.button
                  key={answer}
                  className={`p-4 sm:p-5 lg:p-6 rounded-lg sm:rounded-xl text-left border-2 transition-all duration-200 ${selectedAnswer === answer 
                      ? 'border-career-accent bg-career-accent/10 text-white shadow-lg' 
                      : 'border-white/20 bg-white/5 text-white/80 hover:bg-white/10 hover:border-white/40'
                  }`}
                  onClick={() => handleAnswer(answer)}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-sm sm:text-base leading-relaxed">{answer}</span>
                </motion.button>
              ))}
            </div>
          )}
          
          <Button 
            onClick={handleNext} 
            disabled={!selectedAnswer} 
            className={`w-full py-3 sm:py-4 text-sm sm:text-base font-medium rounded-lg sm:rounded-xl transition-all duration-200 mt-6 sm:mt-8 lg:mt-10 ${!selectedAnswer 
                ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white shadow-lg hover:shadow-blue-500/25'
            }`}
          >
            {currentQuestion < questions.length - 1 ? 'Next Question →' : 'Get My Results 🎯'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CareerQuiz;
