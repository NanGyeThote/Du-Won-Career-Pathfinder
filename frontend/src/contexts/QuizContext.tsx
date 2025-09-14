import React, { createContext, useContext, useState, ReactNode } from 'react';

interface QuizData {
  GPA?: string;
  Python?: string;
  SQL?: string;
  Java?: string;
  Interested_Domain_1?: string;
  Interested_Domain_2?: string;
  Projects_1?: string;
  Projects_2?: string;
  Projects_3?: string;
  Major?: string;
}

interface QuizContextType {
  quizData: QuizData | null;
  setQuizData: (data: QuizData | null) => void;
  hasCompletedQuiz: boolean;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const QuizProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [quizData, setQuizDataState] = useState<QuizData | null>(null);

  const setQuizData = (data: QuizData | null) => {
    setQuizDataState(data);
  };

  const hasCompletedQuiz = quizData !== null;

  return (
    <QuizContext.Provider value={{ quizData, setQuizData, hasCompletedQuiz }}>
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};
