import React, { useCallback, useState, useEffect } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface ImageUploaderProps {
  onImageUpload: (image: { preview: string; base64: string } | null) => void;
  onAnalyze: () => void;
  isProcessing: boolean;
  userImagePreview?: string;
  isReady: boolean;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
  });
};


export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, onAnalyze, isProcessing, userImagePreview, isReady }) => {
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback(async (file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      try {
        const base64 = await fileToBase64(file);
        const preview = URL.createObjectURL(file);
        onImageUpload({ preview, base64 });
      } catch (error) {
        console.error("Error processing file:", error);
        onImageUpload(null);
      }
    } else if (file) {
      console.warn("Invalid file type. Please upload an image.", file.type);
      onImageUpload(null);
    }
  }, [onImageUpload]);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  }, [processFile]);
    
  // --- Drag and Drop Handlers ---
  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);
      if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
        await processFile(event.dataTransfer.files[0]);
        event.dataTransfer.clearData();
      }
  }, [processFile]);

  // --- Clipboard Paste Handler ---
  useEffect(() => {
      const handlePaste = async (event: ClipboardEvent) => {
          const items = event.clipboardData?.items;
          if (!items) return;

          for (let i = 0; i < items.length; i++) {
              if (items[i].type.indexOf('image') !== -1) {
                  const file = items[i].getAsFile();
                  if (file) {
                    await processFile(file);
                    // Stop after finding the first image
                    return;
                  }
              }
          }
      };

      window.addEventListener('paste', handlePaste);
      return () => {
          window.removeEventListener('paste', handlePaste);
      };
  }, [processFile]);

  return (
    <div className="bg-slate-800/50 p-4 rounded-lg flex flex-col gap-4 ring-1 ring-slate-700">
      <h2 className="text-xl font-semibold text-cyan-300">Upload Screenshot</h2>
      
      <div 
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragging ? 'border-cyan-500 bg-slate-700/50' : 'border-slate-600 hover:border-cyan-500'}`}
        aria-live="polite"
      >
        <UploadIcon className="mx-auto h-12 w-12 text-slate-400 pointer-events-none" />
        <label htmlFor="file-upload" className="relative cursor-pointer mt-2 block">
          <span className="text-cyan-400 font-semibold">Choose a file</span>
          <span className="text-slate-400">, drag and drop, or paste</span>
          <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP up to 10MB</p>
          <input 
            id="file-upload" 
            name="file-upload" 
            type="file" 
            className="sr-only"
            accept="image/png, image/jpeg, image/webp"
            onChange={handleFileChange}
            disabled={isProcessing}
          />
        </label>
      </div>

      {userImagePreview && (
        <div className="mt-2">
            <h3 className="text-md font-medium text-slate-300 mb-2">Image Preview:</h3>
            <img src={userImagePreview} alt="User screenshot preview" className="rounded-md max-h-48 w-auto mx-auto"/>
        </div>
      )}

      <button
        onClick={onAnalyze}
        disabled={isProcessing || !userImagePreview || !isReady}
        className="w-full bg-cyan-600 text-white font-bold py-3 px-4 rounded-md hover:bg-cyan-500 transition-all duration-200 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isProcessing ? 'Analyzing...' : 'Analyze Image'}
      </button>
      {!isReady && <p className="text-xs text-center text-amber-400">Waiting for Arsenal data to load...</p>}
    </div>
  );
};