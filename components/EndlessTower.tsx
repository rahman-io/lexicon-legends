import React from 'react';

interface EndlessTowerProps {
  onBack: () => void;
  onStart: () => void;
  isAvailable: boolean;
}

const EndlessTower: React.FC<EndlessTowerProps> = ({ onBack, onStart, isAvailable }) => {
  return (
    <div className="w-full h-screen flex flex-col justify-center items-center bg-gray-800 p-4 pt-20 text-white">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-red-400 mb-2">The Endless Tower</h1>
        <p className="text-gray-300 mb-12 max-w-lg">A new challenge forms each day. Test your mastery of language and climb as high as you can.</p>
      </div>

      <div className="w-full max-w-md bg-gray-900 rounded-xl shadow-2xl p-8 border-2 border-red-500/50">
        {isAvailable ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-green-400 mb-4">Today's Challenge Awaits!</h2>
            <p className="text-gray-400 mb-6">Complete a series of trials to earn valuable Lingo Gems.</p>
            <button 
              onClick={onStart}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-lg text-xl transition-colors transform hover:scale-105"
            >
              Begin Trial
            </button>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">Challenges Completed!</h2>
            <p className="text-gray-400">You have proven your skills for today. The tower's energies will realign tomorrow, presenting new trials.</p>
            <p className="mt-4 font-semibold text-lg">Come back tomorrow!</p>
          </div>
        )}
      </div>

      <button onClick={onBack} className="absolute top-20 left-4 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
        &larr; Back to Hub
      </button>
    </div>
  );
};

export default EndlessTower;
