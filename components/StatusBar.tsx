
import React from 'react';

interface StatusBarProps {
  xp: number;
  gems: number;
  inventory: string[];
  onShowMap: () => void;
  hp: number;
  maxHp: number;
}

const StatusBar: React.FC<StatusBarProps> = ({ xp, gems, inventory, onShowMap, hp, maxHp }) => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-gray-800 bg-opacity-80 backdrop-blur-sm text-white p-3 flex justify-between items-center z-50 shadow-lg border-b border-gray-700">
      <div className="flex items-center space-x-6">
        <h1 className="text-xl font-bold text-yellow-400">Lexicon Legends</h1>
        <div className="flex items-center space-x-2">
            {Array.from({ length: maxHp }).map((_, i) => (
                <span key={i} className={`text-2xl transition-all duration-300 ${i < hp ? 'text-red-500' : 'text-gray-600'}`}>
                    ♥
                </span>
            ))}
        </div>
        <div className="flex items-center space-x-4">
          <span className="font-semibold">XP: <span className="text-green-400">{xp}</span></span>
          <span className="font-semibold">Gems: <span className="text-blue-400">{gems}</span></span>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
            <span className="font-semibold hidden sm:inline">Inventory:</span>
            {inventory.length > 0 ? (
            <div className="flex space-x-2">
                {inventory.map(item => (
                <div key={item} className="bg-gray-700 px-2 py-1 rounded-md text-sm shadow-inner whitespace-nowrap">
                    {item}
                </div>
                ))}
            </div>
            ) : (
            <span className="text-gray-400 italic">Empty</span>
            )}
        </div>
        <button 
            onClick={onShowMap}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-md"
        >
            World Map
        </button>
      </div>
    </header>
  );
};

export default StatusBar;