import React from 'react';

interface GuidingStoneProps {
  lessonId: string;
  showPrompt: boolean;
}

const GuidingStone: React.FC<GuidingStoneProps> = ({ showPrompt }) => {
  return (
    <div 
      className="flex flex-col items-center group relative" 
      aria-label="Read Guiding Stone"
      style={{ width: 80, height: 80 }}
    >
      {showPrompt && (
        <div className="absolute -top-10 bg-white text-gray-800 font-bold px-3 py-1 rounded-full shadow-lg animate-bounce z-10">
          E
        </div>
      )}
      <div className="w-16 h-16 bg-slate-500 rounded-lg p-2 flex items-center justify-center border-4 border-slate-700 shadow-md transform transition-transform group-hover:scale-110 relative overflow-hidden">
        {/* Stone texture effect */}
        <div className="absolute inset-0 bg-black/10"></div>
        <span className="text-4xl text-yellow-300 animate-pulse font-bold">?</span>
      </div>
      <div className="mt-2 bg-black bg-opacity-50 text-white font-medium px-2 py-1 rounded-md text-sm">Guiding Stone</div>
    </div>
  );
};

export default GuidingStone;
