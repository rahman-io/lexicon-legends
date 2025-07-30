import React from 'react';
import type { DescriptivePuzzleState } from '../types';

interface PuzzleUIProps {
  puzzleState: DescriptivePuzzleState;
  onSelectAdjective: (adjective: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

const PuzzleUI: React.FC<PuzzleUIProps> = ({ puzzleState, onSelectAdjective, onSubmit, onClose }) => {
  const { targetObject, selectedAdjectives, availableAdjectives, requiredAdjectives } = puzzleState;
  const numRequired = requiredAdjectives.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="relative bg-white border-2 border-cyan-400 rounded-xl p-8 shadow-2xl text-center text-gray-800 w-full max-w-2xl transform">
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-800 transition-colors"
          aria-label="Close puzzle"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="text-2xl font-bold mb-2 text-cyan-700">A Splash of Color!</h2>
        <p className="text-xl mb-4">
          Describe the <span className="font-bold text-purple-600">{targetObject}</span>.
        </p>
        
        <div className="bg-gray-100 rounded-lg p-3 my-4 min-h-[5rem] flex items-center justify-center flex-wrap gap-4">
            {Array.from({ length: numRequired }).map((_, index) => {
                const adjective = selectedAdjectives[index];
                return (
                    <div 
                        key={index}
                        className="w-32 h-12 flex items-center justify-center border-2 border-dashed border-gray-400 rounded-md bg-white"
                    >
                        {adjective ? (
                            <span className="bg-blue-500 text-white font-semibold px-3 py-1 rounded-full text-lg">{adjective}</span>
                        ) : (
                            <span className="text-gray-400"></span>
                        )}
                    </div>
                );
            })}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {availableAdjectives.map(adj => {
            const isSelected = selectedAdjectives.includes(adj);
            return (
              <button
                key={adj}
                onClick={() => onSelectAdjective(adj)}
                disabled={!isSelected && selectedAdjectives.length >= numRequired}
                className={`px-4 py-3 font-bold text-lg rounded-lg transform transition-all duration-200 focus:outline-none focus:ring-4
                  ${isSelected 
                    ? 'bg-blue-500 text-white ring-blue-300 scale-105' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 ring-gray-400 disabled:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
              >
                {adj}
              </button>
            )
          })}
        </div>

        <button
            onClick={onSubmit}
            disabled={selectedAdjectives.length === 0}
            className="w-full px-8 py-4 bg-green-600 text-white font-bold text-2xl rounded-lg hover:bg-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-green-400"
        >
            Submit Description
        </button>
      </div>
    </div>
  );
};

export default PuzzleUI;