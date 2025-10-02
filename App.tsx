
import React, { useState, useEffect, useCallback } from 'react';
import { ArsenalGrid } from './components/ArsenalGrid';
import { ImageUploader } from './components/ImageUploader';
import { ResultsDisplay } from './components/ResultsDisplay';
import { identifyWeapons } from './services/geminiService';
import type { WeaponCount } from './types';
import { Loader } from './components/Loader';

const ARSENAL_IMAGE_URL = 'weaponsss.png';

const App: React.FC = () => {
  const [arsenalImage, setArsenalImage] = useState<{ dataUrl: string; base64: string } | null>(null);
  const [userImage, setUserImage] = useState<{ preview: string; base64: string } | null>(null);
  const [results, setResults] = useState<WeaponCount | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArsenalImage = async () => {
      try {
        const response = await fetch(ARSENAL_IMAGE_URL);
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const blob = await response.blob();
        
        const fileReaderResult = await new Promise<{ dataUrl: string; base64: string }>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;
                const base64 = dataUrl.split(',')[1];
                resolve({ dataUrl, base64 });
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });

        setArsenalImage(fileReaderResult);
      } catch (err) {
        console.error("Failed to load arsenal image:", err);
        setError("Could not load the core weapon data. Please check if 'weaponsss.png' is accessible and refresh the page.");
      }
    };
    fetchArsenalImage();
  }, []);

  const handleAnalysis = useCallback(async () => {
    if (!userImage || !arsenalImage) {
      setError("Please upload an image first.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResults(null);

    try {
      const identified = await identifyWeapons(arsenalImage.base64, userImage.base64);
      setResults(identified);
    } catch (err) {
      console.error(err);
      setError("An error occurred during analysis. The AI model might be unavailable. Please try again later.");
    } finally {
      setIsProcessing(false);
    }
  }, [userImage, arsenalImage]);

  return (
    <div className="min-h-screen container mx-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-cyan-400 tracking-tight">
          Weapon Recognition AI
        </h1>
        <p className="text-slate-400 mt-2 max-w-2xl mx-auto">
          Upload your game screenshot to count weapon occurrences based on our arsenal.
        </p>
      </header>

      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-8">
          <ArsenalGrid imageUrl={arsenalImage?.dataUrl} isLoading={!arsenalImage} />
          <ImageUploader 
            onImageUpload={setUserImage}
            onAnalyze={handleAnalysis}
            isProcessing={isProcessing}
            userImagePreview={userImage?.preview}
            isReady={!!arsenalImage}
          />
        </div>
        
        <div className="bg-slate-800/50 rounded-lg p-6 flex flex-col ring-1 ring-slate-700">
          <h2 className="text-2xl font-semibold mb-4 text-cyan-300">Analysis Results</h2>
          {isProcessing && (
            <div className="flex-grow flex flex-col items-center justify-center">
              <Loader />
              <p className="mt-4 text-slate-300">AI is analyzing your screenshot...</p>
            </div>
          )}
          {!isProcessing && error && (
            <div className="flex-grow flex flex-col items-center justify-center text-center">
              <p className="text-rose-400 bg-rose-900/50 p-4 rounded-md">{error}</p>
            </div>
          )}
          {!isProcessing && !error && (
            <ResultsDisplay results={results} />
          )}
        </div>
      </main>

       <footer className="text-center mt-12 text-slate-500 text-sm">
        <p>Powered by Gemini AI. All images are for demonstration purposes only.</p>
      </footer>
    </div>
  );
};

export default App;
