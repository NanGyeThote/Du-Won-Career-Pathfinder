import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the shape of the context
interface ModelContextType {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
}

// Create the context
const ModelContext = createContext<ModelContextType | undefined>(undefined);

// Create a provider component
export const ModelProvider = ({ children }: { children: ReactNode }) => {
  const [selectedModel, setSelectedModel] = useState('gemini'); // Default model

  return (
    <ModelContext.Provider value={{ selectedModel, setSelectedModel }}>
      {children}
    </ModelContext.Provider>
  );
};

// Create a custom hook to use the model context
export const useModel = () => {
  const context = useContext(ModelContext);
  if (context === undefined) {
    throw new Error('useModel must be used within a ModelProvider');
  }
  return context;
};
