import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

const ConfirmationModal = ({ onConfirm, onCancel }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full"
      >
        <div className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              Stop Timer?
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to stop the timer? You'll be able to save session details next.
            </p>
            
            <div className="flex gap-4 w-full">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Continue Timer
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Stop & Save
              </button>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              Press Escape to cancel or Enter to confirm
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ConfirmationModal;