import React, { useEffect, useState } from "react";

export default function ConfirmLogoutModal({ isOpen, onCancel, onConfirm }) {
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle animation states
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onCancel();
    }, 150); // Wait for animation to complete
  };
  // Prevent body scroll and handle ESC key when modal is open
  useEffect(() => {
    if (isOpen) {
      // Disable background scroll while keeping scrollbar visible
      // Calculate scrollbar width to prevent layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // Store original styles
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      
      // Apply styles to prevent scroll but keep scrollbar space
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      
      // Handle ESC key
      const handleEscKey = (event) => {
        if (event.key === 'Escape') {
          handleClose();
        }
      };
      
      document.addEventListener('keydown', handleEscKey);
      
      // Cleanup
      return () => {
        // Restore original styles
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
        document.removeEventListener('keydown', handleEscKey);
      };
    }
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  // Handle background click to close modal
  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div 
      className={`fixed inset-0 bg-[#00000080] z-50 flex items-center justify-center transition-opacity duration-150 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleBackgroundClick}
    >
      <div className={`bg-white rounded-lg shadow-lg max-w-sm w-full p-6 transition-all duration-150 ${
        isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Confirm Logout</h2>
        <p className="text-sm text-gray-600 mb-4">Are you sure you want to log out?</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors duration-150"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-[color:var(--color-dark)] text-white rounded-lg hover:bg-[color:var(--color-base)] cursor-pointer transition-colors duration-150"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
