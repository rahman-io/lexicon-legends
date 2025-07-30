import React from 'react';
import type { LessonData } from '../types';

interface LessonUIProps {
  lessonData: LessonData | null;
  isLoading: boolean;
  onClose: () => void;
  onCancel: () => void;
  onRefresh: () => void;
}

// A simple map to convert icon names from the API to displayable emojis.
const ICON_MAP: Record<string, string> = {
    'orange': '🍊', 'cat': '🐈', 'idea': '💡', 'apple': '🍎',
    'book': '📖', 'hat': '🎩', 'fox': '🦊', 'adventure': '🗺️',
    'owl': '🦉', 'egg': '🥚', 'house': '🏠', 'car': '🚗',
    'tree': '🌳', 'star': '⭐', 'sun': '☀️', 'moon': '🌙',
    'user': '👤', 'player': '👤', 'hero': '🦸', 'monster': '👹',
    'sword': '⚔️', 'shield': '🛡️', 'key': '🔑', 'chest': '📦',
    'game': '🎮', 'world': '🌍', 'hour': '⌛', 'umbrella': '☂️',
    'ice cream': '🍦', 'arrow': '➡️', 'error': '⚠️',
};
const FALLBACK_ICON = '❓';

const LessonUI: React.FC<LessonUIProps> = ({ lessonData, isLoading, onClose, onCancel, onRefresh }) => {

  const getIcon = (iconName: string) => {
    return ICON_MAP[iconName.toLowerCase().trim()] || FALLBACK_ICON;
  };

  const renderContent = () => {
    if (isLoading && !lessonData) {
      // This case is for the initial full-screen loading state
      return (
        <div className="bg-stone-800 border-4 border-stone-600 rounded-xl p-8 shadow-2xl text-center text-white w-full max-w-md">
          <h2 className="text-3xl font-bold mb-4 text-yellow-300 font-serif animate-pulse">
            A wise whisper is coming...
          </h2>
          <div className="w-16 h-16 border-4 border-t-transparent border-yellow-400 rounded-full animate-spin mx-auto mt-4"></div>
          <button
            onClick={onCancel}
            className="mt-6 px-6 py-2 bg-red-700 text-white font-bold text-lg rounded-lg hover:bg-red-600 transition-colors focus:outline-none focus:ring-4 focus:ring-red-500"
            aria-label="Cancel loading"
          >
              Cancel
          </button>
        </div>
      );
    }
    
    if (!lessonData) return null; // Should not happen if logic is correct, but a safeguard.

    // This is the main UI, which can have a loading overlay
    return (
        <div 
            className="relative bg-stone-800 border-4 border-stone-600 rounded-xl p-8 shadow-2xl text-white w-full max-w-2xl transform"
            role="dialog"
            aria-modal="true"
            aria-labelledby="lesson-title"
        >
            {isLoading && (
                <div className="absolute inset-0 bg-stone-900/70 backdrop-blur-sm flex flex-col justify-center items-center rounded-lg z-20">
                    <div className="w-16 h-16 border-4 border-t-transparent border-yellow-400 rounded-full animate-spin"></div>
                    <p className="mt-4 text-lg font-semibold text-yellow-300">Refreshing wisdom...</p>
                </div>
            )}
            <h2 id="lesson-title" className="text-3xl font-bold mb-4 text-yellow-300 text-center font-serif">{lessonData.title}</h2>
            <p className="text-stone-200 text-lg mb-6 leading-relaxed text-center">{lessonData.explanation}</p>
            
            <div className="border-t-2 border-stone-600 my-6"></div>

            <h3 className="text-2xl font-bold text-yellow-400 mb-4 font-serif text-center">Examples</h3>
            <div className="space-y-4">
            {lessonData.examples.map((example, index) => (
                <div key={index} className="flex items-center bg-stone-700/50 p-3 rounded-lg ring-1 ring-stone-600">
                <span className="text-4xl mr-4">{getIcon(example.icon_name)}</span>
                <code className="text-xl font-medium text-cyan-300 tracking-wide">{example.text}</code>
                </div>
            ))}
            </div>

            <div className="mt-8 flex justify-center items-center space-x-4">
                <button
                    onClick={onClose}
                    className="px-8 py-3 bg-gray-600 text-white font-bold text-xl rounded-lg hover:bg-gray-500 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-400 shadow-lg"
                    aria-label="Close lesson"
                >
                    Got It!
                </button>
                <button
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="px-8 py-3 bg-yellow-600 text-white font-bold text-xl rounded-lg hover:bg-yellow-500 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-yellow-400 shadow-lg disabled:bg-yellow-800 disabled:cursor-not-allowed"
                    aria-label="Explain again"
                >
                    Explain Again
                </button>
            </div>
        </div>
    );
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
       <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
            animation: fade-in 0.3s ease-out forwards;
        }
       `}</style>
      {renderContent()}
    </div>
  );
};

export default LessonUI;