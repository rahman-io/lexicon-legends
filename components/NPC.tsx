
import React from 'react';

interface NPCProps {
  name: string;
  showPrompt: boolean;
  onClick?: () => void; // Keep for static screens
}

const NPC: React.FC<NPCProps> = ({ name, showPrompt, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="flex flex-col items-center cursor-pointer group relative"
      aria-label={`Talk to ${name}`}
    >
      {showPrompt && (
        <div className="absolute -top-10 bg-white text-gray-800 font-bold px-3 py-1 rounded-full shadow-lg animate-bounce">
          E
        </div>
      )}
      <div className="w-24 h-24 bg-blue-300 rounded-full p-4 flex items-center justify-center border-4 border-blue-500 shadow-lg transform transition-transform group-hover:scale-110">
        <span className="text-blue-900 font-bold text-3xl">?</span>
      </div>
      <span className="mt-2 bg-black bg-opacity-50 text-white text-lg font-semibold px-3 py-1 rounded-md">{name}</span>
    </div>
  );
};

export default NPC;
