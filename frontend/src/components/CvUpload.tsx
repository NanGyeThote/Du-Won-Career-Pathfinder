import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Chatbot from './Chatbot';
import Container from './ui/Container';
import { useModel } from '../contexts/ModelContext';

interface CvUploadProps {
  onBack: () => void;
}

const CvUpload = ({ onBack }: CvUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const { selectedModel } = useModel();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setRecommendation(null);

    try {
      // Step 1: Upload CV and get extracted text
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('http://localhost:8000/api/upload-cv', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload CV and extract text.');
      }
      const uploadData = await uploadResponse.json();
      const cvText = uploadData.text;

      // Step 2: Send extracted text for RAG analysis
      const analyzeResponse = await fetch('http://localhost:8000/api/analyze-cv-rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cv_text: cvText, model: selectedModel }),
      });

      if (!analyzeResponse.ok) {
        throw new Error('Failed to get CV analysis recommendation.');
      }
      const analyzeData = await analyzeResponse.json();
      setRecommendation(analyzeData.reply);

    } catch (error) {
      console.error("Error during CV analysis:", error);
      setRecommendation("Sorry, I couldn't analyze your CV at this time. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (recommendation) {
    const initialHistory = [{ text: recommendation, sender: 'bot' as const }];
    return <Chatbot initialHistory={initialHistory} onBack={onBack} />;
  }

  return (
    <div className="w-full text-white h-full flex flex-col px-2 sm:px-4 lg:px-6">
      <div className="mb-6 max-w-7xl mx-auto w-full">
        <Button 
          onClick={onBack} 
          variant="outline"
          className="border-white/40 text-white hover:bg-white/10 hover:border-white/60 hover:text-white transition-all duration-200"
        >
          ← Back
        </Button>
      </div>
      
      <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/20 flex flex-col max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-white">Upload Your CV</h2>
          <p className="text-white/80 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">Upload your CV to get a personalized career recommendation based on your experience and skills.</p>
        </div>
        
        <div className="max-w-2xl mx-auto w-full">
          <motion.div
            className={`relative w-full h-64 sm:h-72 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
              file 
                ? 'border-white/50 bg-white/10 hover:bg-white/15' 
                : 'border-white/30 bg-white/5 hover:border-white/50 hover:bg-white/10'
            }`}
            whileHover={{ scale: 1.01, y: -2 }}
            whileTap={{ scale: 0.99 }}
          >
            <Input 
              type="file" 
              accept=".pdf,.doc,.docx" 
              onChange={handleFileChange} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              id="cv-upload" 
            />
            <div className="text-center pointer-events-none">
              {file ? (
                <div>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-white/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-white font-semibold text-lg mb-1">{file.name}</p>
                  <p className="text-white/60 text-base">Click to change file</p>
                </div>
              ) : (
                <div>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-white/10 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-white text-lg font-medium mb-2">Click to upload your CV</p>
                  <p className="text-white/60 text-base">PDF, DOC, or DOCX files accepted</p>
                  <p className="text-white/50 text-sm mt-2">Maximum file size: 10MB</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
        
        <div className="max-w-md mx-auto w-full mt-8">
          <Button 
            onClick={handleAnalyze} 
            disabled={!file || isAnalyzing} 
            className={`w-full py-4 text-base font-medium rounded-xl transition-all duration-200 ${
              !file || isAnalyzing
                ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg'
            }`}
          >
            {isAnalyzing ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Analyzing your CV...</span>
              </div>
            ) : (
              'Analyze CV'
            )}
          </Button>
          
          {isAnalyzing && (
            <p className="text-white/60 text-sm mt-4 text-center">This may take a few moments while we process your document and extract insights.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CvUpload;
