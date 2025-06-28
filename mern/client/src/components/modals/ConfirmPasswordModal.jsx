import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export default function ConfirmPasswordModal({ isOpen, onClose, onConfirm }) {
  const { user } = useAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setPassword("");
      setError("");
      setIsVerifying(false);
    }
  }, [isOpen]);

  // Prevent body scroll and handle ESC key when modal is open
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      // Handle ESC key
      const handleEscKey = (event) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleEscKey);
      
      // Cleanup
      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleEscKey);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Handle background click to close modal
  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle password verification and confirmation
  const handleConfirm = async () => {
    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    if (!user?._id) {
      setError("User not found");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5050/api/users/verify-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user._id,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.verified) {
        // Password is correct, proceed with the original action
        onConfirm(password);
      } else {
        // Password is incorrect
        setError(data.error || "Incorrect password");
      }
    } catch (error) {
      console.error("Error verifying password:", error);
      setError("Failed to verify password. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isVerifying) {
      handleConfirm();
    }
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-[#00000080] z-50"
      onClick={handleBackgroundClick}
    >
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-lg font-bold mb-4">Confirm your password to save changes</h2>
        
        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (error) setError(""); // Clear error when user starts typing
          }}
          onKeyPress={handleKeyPress}
          placeholder="Enter your password"
          className={`w-full border p-2 rounded mb-2 ${error ? 'border-red-500' : 'border-gray-300'}`}
          disabled={isVerifying}
        />
        
        {/* Error message */}
        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}
        
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            disabled={isVerifying}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isVerifying || !password.trim()}
            className="px-4 py-2 bg-[#1E275E] text-white rounded hover:bg-[#4B548B] disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isVerifying ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </>
            ) : (
              'Confirm'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
