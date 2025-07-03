// DeleteUserModal.jsx
import React, { useEffect, useState, useCallback } from "react";
import { ConfirmPasswordModal } from "../index";

export default function DeleteUserModal({ isOpen, onClose, onConfirm }) {
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Escape') {
      if (showConfirmPassword) {
        setShowConfirmPassword(false);
      } else {
        onClose();
      }
    }
  }, [onClose, showConfirmPassword]);

  useEffect(() => {
    if ((isOpen || showConfirmPassword) && !showConfirmPassword) {
      // Prevent body scroll when either modal should be showing
      document.body.style.overflow = 'hidden';
      
      // Add ESC key listener
      document.addEventListener('keydown', handleKeyPress);
      
      return () => {
        // Only restore body scroll if no modals are showing
        if (!isOpen && !showConfirmPassword) {
          document.body.style.overflow = 'unset';
        }
        
        // Remove ESC key listener
        document.removeEventListener('keydown', handleKeyPress);
      };
    }
  }, [isOpen, showConfirmPassword, handleKeyPress]);

  const handleOutsideClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleDeleteClick = () => {
    setShowConfirmPassword(true);
  };

  const handlePasswordConfirmed = () => {
    setShowConfirmPassword(false);
    onConfirm();
  };

  const handlePasswordModalClose = () => {
    setShowConfirmPassword(false);
  };

  return (
    <>
      {isOpen && !showConfirmPassword && (
        <div 
          className="fixed inset-0 bg-[#00000080] flex justify-center items-center z-50"
          onClick={handleOutsideClick}
        >
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full text-center">
            <h2 className="text-xl font-semibold mb-4 text-red-600">Confirm Account Deletion</h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete your account? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteClick}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmPasswordModal 
        isOpen={showConfirmPassword}
        onClose={handlePasswordModalClose}
        onConfirm={handlePasswordConfirmed}
        title="Confirm Account Deletion"
        message="Please enter your password to confirm account deletion."
      />
    </>
  );
}
