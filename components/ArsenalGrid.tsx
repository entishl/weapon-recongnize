import React from 'react';

interface ArsenalGridProps {
  imageUrl?: string;
  isLoading: boolean;
}

export const ArsenalGrid: React.FC<ArsenalGridProps> = ({ imageUrl, isLoading }) => {
  return (
    <div className="bg-slate-800/50 p-4 rounded-lg ring-1 ring-slate-700">
      <h2 className="text-xl font-semibold mb-3 text-cyan-300">Weapon Arsenal (6x3 Grid)</h2>
      <div className="aspect-[2/1] bg-slate-700 rounded-md overflow-hidden flex items-center justify-center">
        {isLoading ? (
          <div className="text-slate-400">Loading Arsenal Data...</div>
        ) : (
          <img 
            src={imageUrl} 
            alt="Weapon Arsenal Grid" 
            className="w-full h-full object-cover"
          />
        )}
      </div>
    </div>
  );
};