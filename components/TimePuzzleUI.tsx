import React from 'react';
import type { TimePuzzleState, Tense } from '../types';

interface TimePuzzleUIProps {
  puzzleState: TimePuzzleState;
  onSelectTense: (tense: Tense) => void;
  onClose: () => void;
}

const TimePuzzleUI: React.FC<TimePuzzleUIProps> = ({ puzzleState, onSelectTense, onClose }) => {
  if (!puzzleState.challenge) return null;
  const { prompt, challenge } = puzzleState;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="relative bg-scroll-pattern bg-yellow-50 border-4 border-yellow-800 rounded-xl p-8 shadow-2xl text-center text-gray-800 w-full max-w-2xl transform">
        <style>{`
          .bg-scroll-pattern {
            background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABOSURBVFhH7c5BDQAwEASh+je9N2gD42gC3TIGNnJk/Xp/7QghhBBCCCGEEEIIIYQQQgjpp1xJCCGEEEIIIYQQQgghhBBCCHkGAHGU7Bv8Hn3HAAAAAElFTkSuQmCC');
            box-shadow: inset 0 0 20px #000;
          }
        `}</style>
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-yellow-900 hover:text-black transition-colors"
          aria-label="Close puzzle"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        
        <h2 className="text-2xl font-bold mb-2 text-yellow-900 font-serif">A Rift in Time...</h2>
        <p className="text-lg italic mb-6 text-gray-600">"{prompt}"</p>
        
        <div className="bg-white/50 rounded-lg p-4 my-6 text-2xl font-serif">
          {challenge.subject} <span className="text-4xl font-bold mx-2 text-purple-700">[ _____ ]</span> {challenge.complement}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['past', 'present', 'future'] as Tense[]).map(tense => (
            <button
              key={tense}
              onClick={() => onSelectTense(tense)}
              className="px-4 py-3 font-bold text-xl rounded-lg transform transition-all duration-200 focus:outline-none focus:ring-4 text-white bg-purple-700 hover:bg-purple-600 ring-purple-400"
            >
              <span className="block">{challenge.verbOptions[tense]}</span>
              <span className="text-sm font-normal uppercase opacity-75">{tense}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimePuzzleUI;
