
import React from 'react';
import type { ItemName } from '../types';

interface QuestItemProps {
  itemName: string;
  showPrompt: boolean;
}

const ICONS: Record<string, string> = {
  apple: '🍎',
  book: '📖',
  hat: '🎩',
  map: '🗺️',
  key: '🔑',
  fire_rune: '🔥',
  lava_stone: '☄️',
  obsidian_shard: '⛏️',
  magma_core: '🌋',
};

const QuestItem: React.FC<QuestItemProps> = ({ itemName, showPrompt }) => {
  const icon = ICONS[itemName] || '❓';

  return (
    <div
      className="flex flex-col items-center group relative"
      aria-label={`Collect ${itemName}`}
    >
      {showPrompt && (
        <div className="absolute -top-10 bg-white text-gray-800 font-bold px-3 py-1 rounded-full shadow-lg animate-bounce">
          E
        </div>
      )}
      <div className="w-16 h-16 bg-yellow-200 rounded-full p-2 flex items-center justify-center border-4 border-yellow-400 shadow-md transform transition-transform group-hover:scale-110">
        <span className="text-4xl">{icon}</span>
      </div>
      <span className="mt-2 bg-black bg-opacity-50 text-white font-medium px-2 py-1 rounded-md capitalize">{itemName}</span>
    </div>
  );
};

export default QuestItem;
