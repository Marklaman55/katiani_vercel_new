import React from 'react';
import { motion } from 'motion/react';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, loading = false }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl"
      >
        <h3 className="text-xl sm:text-2xl font-serif font-bold mb-4">{title}</h3>
        <p className="text-gray-600 mb-4">{message}</p>
        <div className="flex gap-4">
          <button onClick={onCancel} className="btn-secondary flex-1 py-2 text-sm">Cancel</button>
          <button 
            onClick={onConfirm} 
            disabled={loading}
            className="btn-primary flex-1 py-2 text-sm bg-red-500 hover:bg-red-600 border-red-500 hover:border-red-600 flex items-center justify-center gap-2"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Confirm'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ConfirmModal;
