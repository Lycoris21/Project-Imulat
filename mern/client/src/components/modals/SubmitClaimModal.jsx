import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import AlertModal from "../modals/AlertModal";

export default function SubmitClaimModal({ isOpen, onClose, onSubmitFinish, claim = null }) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const [claimFormData, setClaimFormData] = useState({
    claimTitle: "",
    claimContent: "",
    claimSources: ""
  });

  const [alert, setAlert] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "error",
  });

  // Autofill form when editing an existing claim
  useEffect(() => {
    if (isOpen && claim) {
      setClaimFormData({
        claimTitle: claim.claimTitle || "",
        claimContent: claim.claimContent || "",
        claimSources: claim.claimSources || ""
      });
    }
  }, [isOpen, claim]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setClaimFormData({
        claimTitle: "",
        claimContent: "",
        claimSources: ""
      });
      setIsAnimating(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 150);
  };

  // Submit handler
  const handleSubmitClaim = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        userId: user._id,
        claimTitle: claimFormData.claimTitle,
        claimContent: claimFormData.claimContent,
        claimSources: claimFormData.claimSources,
      };

      const method = claim ? "PATCH" : "POST";
      const endpoint = claim ? `http://localhost:5050/api/claims/${claim._id}` : `http://localhost:5050/api/claims`;

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        let message = "Validation failed.";
        if (Array.isArray(errorData.details)) {
          message = errorData.details.map((e) => `• ${e.msg}`).join("\n");
        } else if (errorData.error) {
          message = errorData.error;
        }
        throw new Error(message);
      }

      // Clear and close
      setClaimFormData({
        claimTitle: "",
        claimContent: "",
        claimSources: ""
      });

      handleClose();

      if (onSubmitFinish) {
        await onSubmitFinish(claim ? "claimUpdated" : "claimSubmitted");
      }
    } catch (error) {
      console.error("Error submitting claim:", error);
      setAlert({
        isOpen: true,
        title: "Submission Failed",
        message: error.message || "Something went wrong. Please try again.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClaimFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (isOpen) setIsAnimating(true);
  }, [isOpen]);

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
      
      // Disable background scroll while keeping scrollbar visible
      // Calculate scrollbar width to prevent layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // Store original styles
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      
      // Apply styles to prevent scroll but keep scrollbar space
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;

      return () => {
        document.removeEventListener("keydown", handleEscKey);
        // Restore original styles
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 bg-[#00000080] transition-opacity duration-150 ${isAnimating ? "opacity-100" : "opacity-0"}`}>
      {isSubmitting && (
        <div className="absolute inset-0 bg-[#00000080] flex items-center justify-center z-10">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-700 font-medium">Submitting claim...</p>
          </div>
        </div>
      )}

      <div className={`bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden relative transform transition-all duration-150 ${isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}>
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">{claim ? "Edit Claim" : "Submit New Claim"}</h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <form id="claim-form" onSubmit={handleSubmitClaim} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Claim Title</label>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Claim Content (Min: 250 Characters)</label>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sources (Optional)</label>
                <textarea
                  name="claimSources"
                  value={claimFormData.claimSources}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none resize-vertical"
                  placeholder="Enter sources and references (URLs, citations, etc.)..."
                />
                <p className="text-xs text-gray-500 mt-1">Optional: Provide sources to support your claim</p>
              </div>
            </form>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex-shrink-0">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex-1 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="claim-form"
              disabled={isSubmitting}
              className={`px-6 py-2 rounded-lg transition-colors flex-1 ${isSubmitting ? "bg-gray-400 text-gray-600 cursor-not-allowed" : "bg-[color:var(--color-base)] text-white hover:bg-[color:var(--color-dark)] cursor-pointer"}`}
            >
              {isSubmitting ? "Submitting..." : (claim ? "Update Claim" : "Submit Claim")}
            </button>
          </div>
        </div>
      </div>

      <AlertModal
        isOpen={alert.isOpen}
        onClose={() => setAlert((prev) => ({ ...prev, isOpen: false }))}
        title={alert.title}
        message={alert.message}
        type={alert.type}
      />
    </div>
  );
}
