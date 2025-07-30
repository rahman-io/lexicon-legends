import React from 'react';
import type { MapLocation, PlayerCollection } from '../types';

interface TravelersHubProps {
  onNavigate: (location: MapLocation) => void;
  collection: PlayerCollection;
  equippedOutfit: string;
  equippedCompanion: string;
}

const COMPANION_ICONS: Record<string, string> = {
    'None': '',
    'Book Owl': '🦉',
    'Grammar Gremlin': '👺'
};

const NavButton: React.FC<{onClick: () => void, title: string, description: string, icon: string}> = ({ onClick, title, description, icon }) => (
    <button
        onClick={onClick}
        className="w-full bg-slate-700 p-4 rounded-lg border-2 border-slate-600 hover:border-yellow-400 hover:bg-slate-600 transition-all text-left flex items-center space-x-4"
    >
        <div className="text-4xl">{icon}</div>
        <div>
            <h3 className="font-bold text-xl text-yellow-300">{title}</h3>
            <p className="text-slate-300">{description}</p>
        </div>
    </button>
);

const TravelersHub: React.FC<TravelersHubProps> = ({ onNavigate, collection, equippedOutfit, equippedCompanion }) => {
  return (
    <div className="w-full h-screen flex flex-col justify-center items-center bg-slate-800 p-4 pt-20 text-white">
        <h1 className="text-5xl font-bold text-yellow-400 mb-4">Traveler's Hub</h1>
        <p className="text-gray-300 mb-10">Your sanctuary, a place to rest and prepare.</p>
        
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Player Character Display */}
            <div className="md:col-span-1 flex flex-col items-center justify-center bg-slate-700/50 rounded-lg p-6 border-2 border-slate-600">
                <div className="relative w-32 h-32 bg-blue-300 rounded-full flex items-center justify-center border-4 border-blue-500 shadow-lg mb-4">
                    <span className="text-blue-900 font-bold text-6xl">T</span>
                    <div className="absolute -bottom-2 -right-2 text-5xl">
                        {COMPANION_ICONS[equippedCompanion] || ''}
                    </div>
                </div>
                <h2 className="text-xl font-bold">{equippedOutfit}</h2>
                {equippedCompanion !== 'None' && <p className="text-md text-cyan-300">{equippedCompanion}</p>}

                 <div className="mt-6 text-center">
                    <h3 className="font-semibold text-yellow-400 border-b border-yellow-400/30 mb-2">Decorations</h3>
                    <div className="text-slate-300">
                        {collection.hubDecorations.length > 0 ? (
                            collection.hubDecorations.map(d => <div key={d}>- {d}</div>)
                        ) : (
                            <div className="italic text-slate-400">None yet</div>
                        )}
                    </div>
                 </div>
            </div>

            {/* Navigation Options */}
            <div className="md:col-span-2 flex flex-col space-y-4">
                <NavButton 
                    onClick={() => onNavigate('well_of_words')}
                    title="The Well of Words"
                    description="Spend Lingo Gems to draw new knowledge and items."
                    icon="💧"
                />
                 <NavButton 
                    onClick={() => onNavigate('endless_tower')}
                    title="The Endless Tower"
                    description="Face daily challenges to earn rewards."
                    icon="🗼"
                />
                 <NavButton 
                    onClick={() => onNavigate('collection_screen')}
                    title="My Collection"
                    description="View your unlocked outfits, companions, and more."
                    icon="📦"
                />
                 <NavButton 
                    onClick={() => onNavigate('map')}
                    title="Venture Out"
                    description="Return to the World Map to continue your quests."
                    icon="🗺️"
                />
            </div>
        </div>
    </div>
  );
};

export default TravelersHub;
