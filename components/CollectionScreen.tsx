import React, { useState } from 'react';
import type { PlayerCollection } from '../types';

interface CollectionScreenProps {
  collection: PlayerCollection;
  onBack: () => void;
  onEquip: (type: 'outfit' | 'companion', name: string) => void;
  equippedOutfit: string;
  equippedCompanion: string;
}

type Tab = 'Outfits' | 'Companions' | 'Decorations' | 'Sages';

const CollectionScreen: React.FC<CollectionScreenProps> = ({ collection, onBack, onEquip, equippedOutfit, equippedCompanion }) => {
  const [activeTab, setActiveTab] = useState<Tab>('Outfits');

  const renderContent = () => {
    let items: string[] = [];
    let equippedItem: string | undefined;
    let type: 'outfit' | 'companion' | undefined;

    switch (activeTab) {
      case 'Outfits':
        items = collection.outfits;
        equippedItem = equippedOutfit;
        type = 'outfit';
        break;
      case 'Companions':
        items = collection.companions;
        equippedItem = equippedCompanion;
        type = 'companion';
        break;
      case 'Decorations':
        items = collection.hubDecorations;
        break;
      case 'Sages':
        items = collection.sages;
        break;
    }

    if (items.length === 0) {
        return <div className="text-center italic text-gray-400 mt-8">Nothing collected in this category yet.</div>;
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map(item => {
                const isEquipped = item === equippedItem;
                return (
                    <div key={item} className={`p-4 rounded-lg border-2 text-center transition-all ${isEquipped ? 'bg-green-800 border-green-400' : 'bg-gray-700 border-gray-600'}`}>
                        <p className="font-bold text-lg">{item}</p>
                        {isEquipped && <p className="text-sm text-green-300 font-semibold">Equipped</p>}
                        {type && !isEquipped && (
                            <button onClick={() => onEquip(type, item)} className="mt-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-1 px-3 rounded-md">
                                Equip
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );
  };
  
  const TABS: Tab[] = ['Outfits', 'Companions', 'Decorations', 'Sages'];

  return (
    <div className="w-full min-h-screen bg-gray-900 p-4 pt-24 text-white">
        <button onClick={onBack} className="absolute top-20 left-4 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors z-10">
            &larr; Back to Hub
        </button>

        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-5xl font-bold text-yellow-300">My Collection</h1>
                <p className="text-gray-400">A record of your travels and treasures.</p>
            </div>
            
            <div className="border-b border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-6 justify-center">
                    {TABS.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors
                                ${activeTab === tab 
                                    ? 'border-yellow-400 text-yellow-300' 
                                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="bg-gray-800/50 p-6 rounded-lg">
                {renderContent()}
            </div>
        </div>
    </div>
  );
};

export default CollectionScreen;
