import React from 'react';

interface GameOverScreenProps {
  onRetry: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ onRetry }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col justify-center items-center z-[100] text-white">
      <h1 className="text-6xl font-bold text-red-500 mb-4 animate-pulse">You Were Silenced!</h1>
      <p className="text-xl mb-8">Your journey has come to a premature end.</p>
      <button
        onClick={onRetry}
        className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold py-3 px-8 rounded-lg text-2xl transition-colors transform hover:scale-105"
      >
        Try Again
      </button>
    </div>
  );
};

export default GameOverScreen;
