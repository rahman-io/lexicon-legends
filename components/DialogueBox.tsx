import React, { useState, useEffect } from 'react';
import type { DialogueChoice } from '../types';

interface DialogueBoxProps {
  message: string;
  onClose?: () => void;
  choices?: DialogueChoice[] | null;
}

const DialogueBox: React.FC<DialogueBoxProps> = ({ message, onClose, choices }) => {
  const [typedMessage, setTypedMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setTypedMessage('');
    setIsTyping(true);
    if (message) {
      let i = 0;
      const interval = setInterval(() => {
        setTypedMessage(prev => prev + message.charAt(i));
        i++;
        if (i >= message.length) {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, 30);
      return () => clearInterval(interval);
    }
  }, [message]);
  
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 z-40">
      <div className="bg-white bg-opacity-90 backdrop-blur-sm border-2 border-gray-800 p-6 rounded-lg shadow-2xl max-w-3xl mx-auto text-gray-900">
        <p className="text-lg font-serif min-h-[4.5rem]">{typedMessage}</p>
        
        {onClose && !choices && (
          <button 
            onClick={onClose} 
            className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Close dialogue"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {choices && !isTyping && (
            <div className="border-t border-gray-300 mt-4 pt-4 flex justify-end space-x-3">
                {choices.map((choice) => (
                    <button
                        key={choice.text}
                        onClick={choice.onSelect}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-md text-base"
                    >
                        {choice.text}
                    </button>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default DialogueBox;