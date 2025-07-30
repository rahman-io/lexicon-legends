import React from 'react';

const VISUALS: Record<string, Record<string, { icon: string, name: string }>> = {
  'bridge-01': {
    broken: { icon: '🚧', name: 'Collapsed Bridge' },
    whole: { icon: '🌉', name: 'Sturdy Bridge' },
  },
  'plant-01': {
    seed: { icon: '🌱', name: 'Dormant Seed' },
    grown: { icon: '🌳', name: 'Great Tree' },
  },
  'crystal-01': {
    phasing: { icon: '✨', name: 'Phasing Crystal' },
    stable: { icon: '💎', name: 'Stable Crystal' },
  },
};

interface TemporalObjectProps {
  id: string;
  currentState: string;
  onClick: () => void;
  isSolved: boolean;
}

const TemporalObject: React.FC<TemporalObjectProps> = ({ id, currentState, onClick, isSolved }) => {
  const visual = VISUALS[id]?.[currentState] || { icon: '?', name: 'Unknown Object' };

  const phasingClass = id === 'crystal-01' && currentState === 'phasing' ? 'animate-pulse' : '';
  const solvedClass = isSolved ? 'opacity-50 cursor-default' : 'cursor-pointer group';

  return (
    <div
      onClick={() => !isSolved && onClick()}
      className={`flex flex-col items-center transition-all duration-300 ${solvedClass}`}
      aria-label={isSolved ? `${visual.name} (stabilized)` : `Interact with ${visual.name}`}
    >
      <div className={`w-24 h-24 bg-indigo-200 rounded-lg p-2 flex items-center justify-center border-4 shadow-md transform transition-transform 
        ${isSolved ? 'border-green-500' : 'border-purple-400 group-hover:scale-110'} ${phasingClass}`}
      >
        <span className="text-6xl">{visual.icon}</span>
      </div>
      <span className="mt-2 bg-black bg-opacity-50 text-white font-medium px-2 py-1 rounded-md">{visual.name}</span>
    </div>
  );
};

export default TemporalObject;
