import React from 'react';

interface DescribableObjectProps {
  objectName: string;
  icon: string;
  onClick: () => void;
  isPuzzleSolved: boolean;
  isTarget?: boolean;
}

const DescribableObject: React.FC<DescribableObjectProps> = ({ objectName, icon, onClick, isPuzzleSolved, isTarget }) => {
  const handleClick = () => {
    if (!isPuzzleSolved) {
      onClick();
    }
  };
  
  const targetClasses = isTarget ? 'animate-pulse ring-4 ring-yellow-300 ring-offset-4 ring-offset-cyan-200' : '';

  return (
    <div
      onClick={handleClick}
      className={`flex flex-col items-center transition-all duration-300 ${isPuzzleSolved ? 'opacity-50 cursor-default' : 'cursor-pointer group'}`}
      aria-label={isPuzzleSolved ? `${objectName} (puzzle solved)`: `Interact with ${objectName}`}
    >
        <div className={`w-20 h-20 bg-yellow-200 rounded-lg p-2 flex items-center justify-center border-4 shadow-md transform transition-transform 
          ${isPuzzleSolved 
            ? 'border-green-500' 
            : `border-yellow-400 group-hover:scale-110 ${targetClasses}`
          }`}
        >
            <span className={`text-5xl transition-transform duration-500 ${isPuzzleSolved ? 'saturate-100' : 'saturate-0'}`}>{icon}</span>
        </div>
      <span className="mt-2 bg-black bg-opacity-50 text-white font-medium px-2 py-1 rounded-md">{isPuzzleSolved ? 'Restored!' : objectName}</span>
    </div>
  );
};

export default DescribableObject;