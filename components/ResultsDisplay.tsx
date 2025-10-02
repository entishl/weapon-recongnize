import React, { useState, useMemo } from 'react';
import type { WeaponCount } from '../types';

interface ResultsDisplayProps {
  results: WeaponCount | null;
}

const WEAPON_MAP: Record<string, string> = {
  "0,0": "SG",
  "0,1": "RL",
  "0,2": "undefined",
  "0,3": "square",
  "0,4": "i2",
  "0,5": "dot",
  "1,0": "SG",
  "1,1": "ar",
  "1,2": "until",
  "1,3": "until",
  "1,4": "i31",
  "1,5": "square",
  "2,0": "sr",
  "2,1": "fire",
  "2,2": "laser",
  "2,3": "i3",
  "2,4": "i31",
  "2,5": "i3"
};


export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
    const [copied, setCopied] = useState(false);
    const [isRawOutputVisible, setIsRawOutputVisible] = useState(false);

    const aggregatedResults = useMemo(() => {
        if (!results) return null;

        const aggregated: Record<string, number> = {};
        for (const [coord, count] of Object.entries(results)) {
            const weaponName = WEAPON_MAP[coord];
            // Only process if count > 0 and the weapon name is not 'undefined'
            // FIX: Cast `count` to number as it is inferred as `unknown`.
            if ((count as number) > 0 && weaponName && weaponName !== 'undefined') {
                // FIX: Cast `count` to number for arithmetic operation.
                aggregated[weaponName] = (aggregated[weaponName] || 0) + (count as number);
            }
        }
        return aggregated;
    }, [results]);

    if (!results || !aggregatedResults) {
        return (
            <div className="flex-grow flex flex-col items-center justify-center text-center">
                <p className="text-slate-400">Upload an image and click "Analyze" to see results here.</p>
            </div>
        );
    }

    const handleCopy = (dataToCopy: object) => {
        navigator.clipboard.writeText(JSON.stringify(dataToCopy, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const foundWeapons = Object.entries(aggregatedResults);
    // FIX: Cast `count` to number as it is inferred as `unknown`.
    const totalCount = foundWeapons.reduce((sum, [, count]) => sum + (count as number), 0);

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setIsRawOutputVisible(!isRawOutputVisible);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-slate-300">Processed Results</h3>
                <button 
                    onClick={() => handleCopy(aggregatedResults)}
                    className="text-sm font-semibold bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-md transition-colors duration-200"
                    aria-label="Copy processed results to clipboard"
                >
                    {copied ? 'Copied!' : 'Copy JSON'}
                </button>
            </div>
            <div className="flex-grow overflow-y-auto pr-2 space-y-3 mb-4">
                {foundWeapons.length > 0 ? (
                    <>
                        <p className="text-sm text-slate-400 mb-2">
                            Found a total of {totalCount} weapon instance{totalCount !== 1 ? 's' : ''} across {foundWeapons.length} unique weapon type{foundWeapons.length !== 1 ? 's' : ''}.
                        </p>
                        {foundWeapons.map(([name, count]) => (
                            <div key={name} className="bg-slate-700/50 p-3 rounded-md flex items-center justify-between">
                                <span className="font-mono text-cyan-300 bg-slate-900 px-2 py-1 rounded">
                                    {name}
                                </span>
                                <span className="font-semibold text-slate-100">{count as number} found</span>
                            </div>
                        ))}
                    </>
                ) : (
                    <div className="flex-grow flex flex-col items-center justify-center text-center h-full">
                         <p className="text-slate-400">No matching weapons were identified in the screenshot.</p>
                    </div>
                )}
            </div>
            
            <div className="mt-auto pt-4 border-t border-slate-700">
                 <div 
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => setIsRawOutputVisible(!isRawOutputVisible)}
                    onKeyDown={handleKeyDown}
                    role="button"
                    tabIndex={0}
                    aria-expanded={isRawOutputVisible}
                    aria-controls="raw-output-details"
                >
                    <h3 className="text-lg font-semibold text-slate-300">Raw AI Output</h3>
                     <svg
                        className={`w-5 h-5 text-slate-400 transition-transform transform ${isRawOutputVisible ? 'rotate-180' : ''}`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                    >
                        <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                        />
                    </svg>
                </div>
                {isRawOutputVisible && (
                    <pre id="raw-output-details" className="bg-slate-900 p-3 rounded-md text-sm text-slate-200 overflow-x-auto max-h-40 mt-2">
                        <code>{JSON.stringify(results, null, 2)}</code>
                    </pre>
                )}
            </div>
        </div>
    );
};