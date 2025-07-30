import React from 'react';
import type { CombatState, ArticleChallenge, VerbChallenge } from '../types';

interface CombatUIProps {
  combatState: CombatState;
  onResolve: (answer: string) => void;
  isFetchingQuiz: boolean;
}

const CombatUI: React.FC<CombatUIProps> = ({ combatState, onResolve, isFetchingQuiz }) => {

  if (isFetchingQuiz || !combatState.challenge) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
        <div className="bg-gray-800 border-2 border-yellow-400 rounded-xl p-8 shadow-2xl text-center text-white w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-yellow-300 animate-pulse">
            Preparing challenge...
          </h2>
          <div className="w-12 h-12 border-4 border-t-transparent border-blue-400 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  const handleAnswerClick = (answer: string) => {
    onResolve(answer);
  };

  const challenge = combatState.challenge;

  const renderChallenge = () => {
    if (challenge.type === 'article') {
      const { sentence, options } = challenge as ArticleChallenge;
      const parts = sentence.split('___');
      return (
        <>
          <p className="text-3xl lg:text-4xl mb-6">
            {parts[0]}<span className="text-4xl lg:text-5xl font-bold mx-2 text-cyan-400">___</span>{parts[1]}
          </p>
          <div className="flex justify-center space-x-4">
            {options.map(option => (
              <button
                key={option}
                onClick={() => handleAnswerClick(option)}
                className="px-8 py-4 bg-blue-600 text-white font-bold text-2xl rounded-lg hover:bg-blue-500 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-400"
              >
                {option}
              </button>
            ))}
          </div>
        </>
      );
    }

    if (challenge.type === 'verb_tense') {
      const { sentence, options } = challenge as VerbChallenge;
      const parts = sentence.split('___');
      return (
        <>
          <p className="text-3xl mb-6">
            {parts[0]}<span className="text-4xl font-bold mx-2 text-cyan-400">___</span>{parts[1]}
          </p>
          <div className="flex justify-center space-x-4">
            {options.map(verb => (
              <button
                key={verb}
                onClick={() => handleAnswerClick(verb)}
                className="px-8 py-4 bg-fuchsia-600 text-white font-bold text-2xl rounded-lg hover:bg-fuchsia-500 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-fuchsia-400"
              >
                {verb}
              </button>
            ))}
          </div>
        </>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className={`bg-gray-800 border-2 border-yellow-400 rounded-xl p-8 shadow-2xl text-center text-white w-full max-w-lg`}>
        <h2 className="text-2xl font-bold mb-4 text-yellow-300">
          {challenge.type === 'article' ? 'Article Attack!' : 'Tense Terror!'}
        </h2>
        {renderChallenge()}
      </div>
    </div>
  );
};

export default CombatUI;