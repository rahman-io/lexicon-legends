import React, { useState } from 'react';
import type { World, MapLocation, WorldProgress } from '../types';

interface WorldMapProps {
  unlockedWorlds: World[];
  onTravel: (location: MapLocation) => void;
  worldProgress: Record<World, WorldProgress>;
  onResetRequest: (world: World) => void;
}

const WorldMap: React.FC<WorldMapProps> = ({ unlockedWorlds, onTravel, worldProgress, onResetRequest }) => {
  const [selectedWorld, setSelectedWorld] = useState<World | null>(null);

  const locations: { id: World, name: string, description: string }[] = [
    { id: 'noun_meadows', name: 'The Noun Meadows', description: 'A peaceful land of items and articles.' },
    { id: 'verb_volcanoes', name: 'The Verb Volcanoes', description: 'A fiery realm of action and tense choices.' },
    { id: 'adjective_isles', name: 'The Adjective Isles', description: 'A colorful archipelago of descriptive puzzles.' },
    { id: 'tense_tangled_forest', name: 'Tense-Tangled Forest', description: 'A misty wood where time itself is broken.' },
  ];

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center bg-gray-900 p-4 pt-20">
      <h1 className="text-5xl font-bold text-yellow-400 mb-2">World Map</h1>
      <p className="text-gray-300 mb-8">Select your destination, Traveler.</p>
      
      <div className="w-full max-w-6xl mb-8">
        <button
          onClick={() => onTravel('hub_main')}
          className="w-full p-6 rounded-xl text-center border-4 transition-all duration-300 transform bg-yellow-600 border-yellow-400 hover:bg-yellow-500 hover:scale-105 cursor-pointer shadow-lg"
        >
          <h2 className="text-3xl font-bold text-white mb-1">The Traveler's Hub</h2>
          <p className="text-yellow-200">Your central base for all adventures.</p>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
        {locations.map(loc => {
          const isUnlocked = unlockedWorlds.includes(loc.id);
          const isCompleted = worldProgress[loc.id]?.status === 'completed';

          const handleClick = () => {
            if (!isUnlocked) return;
            if (isCompleted) {
              setSelectedWorld(loc.id);
            } else {
              onTravel(loc.id);
            }
          };

          return (
            <div key={loc.id} className="relative">
              <button
                onClick={handleClick}
                disabled={!isUnlocked}
                className={`p-6 rounded-xl text-left border-4 transition-all duration-300 transform h-full w-full flex flex-col justify-between
                  ${isUnlocked 
                    ? 'bg-gray-800 border-purple-500 hover:border-yellow-400 hover:scale-105 cursor-pointer' 
                    : 'bg-gray-700 border-gray-600 opacity-50 cursor-not-allowed'
                  }`}
              >
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{loc.name}</h2>
                  <p className="text-gray-400 mb-4 text-sm">{loc.description}</p>
                </div>
                {!isUnlocked && <span className="font-bold text-red-400 self-start mt-auto">LOCKED</span>}
                {isCompleted && (
                  <div className="absolute top-2 right-2 text-2xl text-yellow-300" title="Quest Completed!">✓</div>
                )}
              </button>

              {isCompleted && selectedWorld === loc.id && (
                <div 
                  className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center space-y-3 p-4 z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                    <button 
                      onClick={() => { onTravel(loc.id); setSelectedWorld(null); }}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >Visit World</button>
                    <button 
                      onClick={() => { onResetRequest(loc.id); setSelectedWorld(null); }}
                      className="w-full bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >Replay Quest</button>
                     <button 
                      onClick={() => setSelectedWorld(null)}
                      className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors mt-2"
                    >Cancel</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorldMap;
