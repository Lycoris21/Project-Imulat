import React, { useState, useEffect } from "react";

export default function ReviewReportModal({ isOpen, onClose, onReviewAction }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showDisapprovalReason, setShowDisapprovalReason] = useState(false);
  const [disapprovalReason, setDisapprovalReason] = useState("");

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    } else {
      // Reset state when modal closes
      setShowDisapprovalReason(false);
      setDisapprovalReason("");
    }
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
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;

      return () => {
        document.removeEventListener("keydown", handleEscKey);
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 150);
  };

  const handleApprove = () => {
    onReviewAction('approve');
  };

  const handleDisapproveClick = () => {
    if (!showDisapprovalReason) {
      setShowDisapprovalReason(true);
    } else if (disapprovalReason.trim()) {
      onReviewAction('disapprove', disapprovalReason);
    }
  };

  const handleCancel = () => {
    if (showDisapprovalReason) {
      setShowDisapprovalReason(false);
      setDisapprovalReason("");
    } else {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 bg-[#00000080] transition-opacity duration-150 ${isAnimating ? "opacity-100" : "opacity-0"}`}>
      <div className={`bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative transform transition-all duration-150 ${isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Review Report</h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <div className="mb-6">
            <p className="text-gray-600 text-center mb-4">
              Do you approve or disapprove this report?
            </p>

            {showDisapprovalReason && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Disapproval <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={disapprovalReason}
                  onChange={(e) => setDisapprovalReason(e.target.value)}
                  placeholder="Please provide a reason for disapproving this report..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none resize-vertical"
                  rows={4}
                  required
                />
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex-1"
            >
              Cancel
            </button>
            
            {!showDisapprovalReason ? (
              <>
                <button
                  type="button"
                  onClick={handleDisapproveClick}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex-1"
                >
                  Disapprove
                </button>
                <button
                  type="button"
                  onClick={handleApprove}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex-1"
                >
                  Approve
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleDisapproveClick}
                disabled={!disapprovalReason.trim()}
                className={`px-4 py-2 rounded-lg transition-colors flex-1 ${
                  disapprovalReason.trim() 
                    ? "bg-red-600 text-white hover:bg-red-700 cursor-pointer" 
                    : "bg-gray-400 text-gray-600 cursor-not-allowed"
                }`}
              >
                Disapprove
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
