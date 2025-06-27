// CreateReportModal.js
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export default function SubmitClaimModal({ isOpen, onClose, onSubmitFinish, claimId = null }) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for create report modal
  const [claimFormData, setClaimFormData] = useState({
    claimTitle: "",
    claimContent: "",
    claimSources: ""
  });

  // Handle claim submission
  const handleSubmitClaim = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        userId: user._id,
        claimTitle: claimFormData.claimTitle,
        claimContent: claimFormData.claimContent,
        claimSources: claimFormData.claimSources
      };

      const response = await fetch("http://localhost:5050/api/claims", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create claim");
      }

      // Clear form and close modal
      setClaimFormData({
        claimTitle: "",
        claimContent: "",
        claimSources: "",
      });
      
      onClose();
      alert("Claim submitted successfully!");

      if (onSubmitFinish) {
          await onSubmitFinish();
      }
    } catch (error) {
      console.error("Error submitting claim:", error);
      alert(error.message || "Error submitting claim. Please try again.");
    }
  };

  // Handle claim form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClaimFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Reset form
  useEffect(() => {
    if (!isOpen) {
      setClaimFormData({
        claimTitle: "",
        claimContent: "",
        claimSources: ""
      });
    }
  }, [isOpen]);

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-[#00000080]">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header - Fixed */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Submit New Claim</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Modal Form */}
            <form id="claim-form" onSubmit={handleSubmitClaim} className="space-y-4">
              {/* Claim Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Claim Title
                </label>
                <input
                  type="text"
                  name="claimTitle"
                  value={claimFormData.claimTitle}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  placeholder="Enter claim title..."
                />
              </div>

              {/* Claim Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Claim Content
                </label>
                <textarea
                  name="claimContent"
                  value={claimFormData.claimContent}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none resize-vertical"
                  placeholder="Enter detailed claim content..."
                />
              </div>

              {/* Sources */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sources (Optional)
                </label>
                <textarea
                  name="sources"
                  value={claimFormData.claimSources}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none resize-vertical"
                  placeholder="Enter sources and references (URLs, citations, etc.)..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Provide sources to support your claim
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Modal Actions - Fixed */}
        <div className="p-6 border-t border-gray-200 flex-shrink-0">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="claim-form"
              className="px-6 py-2 bg-base text-white rounded-lg hover:bg-dark transition-colors flex-1"
            >
              Submit Claim
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};