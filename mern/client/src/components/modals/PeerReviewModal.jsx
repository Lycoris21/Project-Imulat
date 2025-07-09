import React, { useState, useEffect } from "react";

export default function PeerReviewModal({ isOpen, onClose, onSubmit, reportId = null }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Animate modal on open
  useEffect(() => {
    if (isOpen) setIsAnimating(true);
  }, [isOpen]);

  // ESC to close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen) handleClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      return () => {
        document.removeEventListener("keydown", handleEsc);
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
      setReviewText("");
      setError("");
    }, 150);
  };

  const handleSubmit = async () => {
    if (!reviewText.trim()) {
      setError("Review cannot be empty.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await onSubmit({ reportId, reviewText });
      handleClose();
    } catch (err) {
      console.error(err);
      setError("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#00000080] transition-opacity duration-150 ${isAnimating ? "opacity-100" : "opacity-0"}`}>
      {/* Submitting Spinner Overlay */}
      {submitting && (
        <div className="absolute inset-0 bg-[#00000080] flex items-center justify-center z-10">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-gray-700 font-medium">Submitting review...</p>
          </div>
        </div>
      )}

      {/* Modal Box */}
      <div className={`bg-white rounded-2xl shadow-2xl max-w-xl w-full flex flex-col overflow-hidden relative transform transition-all duration-150 ${isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Submit Peer Review</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Write your peer review..."
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none resize-vertical"
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 flex gap-4">
          <button
            onClick={handleClose}
            disabled={submitting}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex-1 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`px-6 py-2 rounded-lg transition-colors flex-1 ${submitting
              ? "bg-gray-400 text-gray-600 cursor-not-allowed"
              : "cursor-pointer bg-[color:var(--color-base)] text-white hover:bg-[color:var(--color-dark)]"
            }`}
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
}
