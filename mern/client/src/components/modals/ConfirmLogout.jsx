import React, { useEffect } from "react";

export default function ConfirmLogout({ isOpen, onCancel, onConfirm }) {
  // Prevent body scroll and handle ESC key when modal is open
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      // Handle ESC key
      const handleEscKey = (event) => {
        if (event.key === 'Escape') {
          onCancel();
        }
      };
      
      document.addEventListener('keydown', handleEscKey);
      
      // Cleanup
      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleEscKey);
      };
    }
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  // Handle background click to close modal
  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-[#00000080] z-50 flex items-center justify-center"
      onClick={handleBackgroundClick}
    >
      <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Confirm Logout</h2>
        <p className="text-sm text-gray-600 mb-4">Are you sure you want to log out?</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-[#1E275E] text-white rounded-lg hover:bg-[#4B548B] cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
