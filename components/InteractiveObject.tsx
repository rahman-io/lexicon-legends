
import React from 'react';

interface InteractiveObjectProps {
  name: string;
  icon: string;
  isCollected: boolean;
  showPrompt: boolean;
  onClick?: (name: string) => void; // Keep for static screens
}

const InteractiveObject: React.FC<InteractiveObjectProps> = ({ name, icon, isCollected, showPrompt, onClick }) => {
  
  return (
    <div
      onClick={() => onClick && !isCollected && onClick(name)}
      className={`flex flex-col items-center transition-all duration-300 relative ${isCollected ? 'opacity-30 cursor-default' : 'cursor-pointer group'}`}
      aria-label={isCollected ? `${name} (collected)`: `Interact with ${name}`}
    >
        {showPrompt && !isCollected && (
            <div className="absolute -top-10 bg-white text-gray-800 font-bold px-3 py-1 rounded-full shadow-lg animate-bounce">
                E
            </div>
        )}
        <div className="w-20 h-20 bg-yellow-200 rounded-lg p-2 flex items-center justify-center border-4 border-yellow-400 shadow-md transform transition-transform group-hover:scale-110">
            <span className="text-5xl">{icon}</span>
        </div>
      <span className="mt-2 bg-black bg-opacity-50 text-white font-medium px-2 py-1 rounded-md">{name}</span>
    </div>
  );
};

export default InteractiveObject;
