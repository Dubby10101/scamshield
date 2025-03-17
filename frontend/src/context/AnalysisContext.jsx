import React, { createContext, useState, useContext } from 'react';

// Create the analysis context
const AnalysisContext = createContext();

// Custom hook to use the analysis context
export const useAnalysis = () => {
  return useContext(AnalysisContext);
};

// Provider component that makes analysis state available to any child component that calls useAnalysis()
export function AnalysisProvider({ children }) {
  // State to track when a URL analysis has been completed
  const [analysisCompleted, setAnalysisCompleted] = useState(false);
  const [lastAnalyzedUrl, setLastAnalyzedUrl] = useState('');
  const [lastAnalysisResult, setLastAnalysisResult] = useState(null);
  
  // Function to notify components that a new analysis has been completed
  const notifyAnalysisCompleted = (url, result) => {
    setLastAnalyzedUrl(url);
    setLastAnalysisResult(result);
    setAnalysisCompleted(true);
    
    // Reset the flag after a short delay to allow components to react
    setTimeout(() => {
      setAnalysisCompleted(false);
    }, 100);
  };

  // Create value object to be provided to consumers
  const value = {
    analysisCompleted,
    lastAnalyzedUrl,
    lastAnalysisResult,
    notifyAnalysisCompleted
  };

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
}