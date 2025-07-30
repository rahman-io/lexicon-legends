import React, { useState } from 'react';
import type { GachaItem } from '../types';

interface WellOfWordsProps {
  gems: number;
  onDraw: (amount: 1 | 10) => void;
  onBack: () => void;
  results: GachaItem[] | null;
  onCloseResults: () => void;
}

const RARITY_CLASSES: Record<GachaItem['rarity'], string> = {
    Common: 'border-gray-400 bg-gray-700 text-white',
    Rare: 'border-blue-400 bg-blue-800 text-white animate-pulse-slow',
    Epic: 'border-purple-500 bg-purple-900 text-white animate-pulse-fast shadow-purple-500/50 shadow-lg',
};

const ResultsModal: React.FC<{results: GachaItem[], onClose: () => void}> = ({ results, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4" onClick={onClose}>
        <div className="bg-slate-800 border-2 border-yellow-400 rounded-xl p-6 shadow-2xl text-center w-full max-w-3xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-3xl font-bold mb-4 text-yellow-300">Your Rewards!</h2>
            <div className={`grid gap-4 ${results.length > 1 ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5' : 'grid-cols-1'}`}>
                {results.map((item, index) => (
                    <div key={index} className={`p-4 rounded-lg border-2 flex flex-col justify-center items-center ${RARITY_CLASSES[item.rarity]}`}>
                        <div className="font-bold text-lg">{item.name}</div>
                        <div className={`text-sm font-semibold`}>{item.rarity}</div>
                    </div>
                ))}
            </div>
            <button onClick={onClose} className="mt-6 bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                Close
            </button>
        </div>
    </div>
);

const WellOfWords: React.FC<WellOfWordsProps> = ({ gems, onDraw, onBack, results, onCloseResults }) => {
  return (
    <div className="w-full h-screen flex flex-col justify-center items-center bg-slate-900 p-4 pt-20 text-white">
        <style>{`
            @keyframes pulse-slow { 50% { opacity: .7; } }
            .animate-pulse-slow { animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
            @keyframes pulse-fast { 50% { opacity: .8; } }
            .animate-pulse-fast { animation: pulse-fast 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        `}</style>
        
        {results && <ResultsModal results={results} onClose={onCloseResults} />}

        <div className="text-center">
            <h1 className="text-5xl font-bold text-cyan-300 mb-2">The Well of Words</h1>
            <p className="text-gray-300 mb-8 max-w-md">Cast your Lingo Gems into the depths and see what knowledge bubbles to the surface.</p>
            <div className="bg-slate-800 rounded-lg p-4 mb-8 inline-block shadow-lg">
                <span className="text-2xl font-bold">Your Gems: <span className="text-blue-400">{gems}</span></span>
            </div>
        </div>
      
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
            <button onClick={() => onDraw(1)} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-lg transition-colors shadow-md transform hover:scale-105">
                <span className="text-xl">Draw 1 Word</span>
                <span className="block text-sm opacity-80">Cost: 10 Gems</span>
            </button>
            <button onClick={() => onDraw(10)} className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 px-8 rounded-lg transition-colors shadow-md transform hover:scale-105">
                <span className="text-xl">Draw 10 Words</span>
                 <span className="block text-sm opacity-80">Cost: 100 Gems</span>
            </button>
        </div>

        <button onClick={onBack} className="absolute top-20 left-4 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
            &larr; Back to Hub
        </button>
    </div>
  );
};

export default WellOfWords;
