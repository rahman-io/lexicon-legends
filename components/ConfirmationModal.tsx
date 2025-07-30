import React from 'react';

interface ConfirmationModalProps {
  message: string;
  detail: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ message, detail, onConfirm, onCancel }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-[100] text-white p-4"
      aria-modal="true"
      role="dialog"
      onClick={onCancel}
    >
      <div 
        className="bg-gray-800 border-2 border-yellow-400 rounded-xl p-8 shadow-2xl text-center w-full max-w-md transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-yellow-300 mb-3 capitalize">{message}</h2>
        <p className="text-gray-300 mb-6">{detail}</p>
        <div className="flex justify-center space-x-4">
          <button 
            onClick={onCancel} 
            className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-8 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-8 rounded-lg transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
