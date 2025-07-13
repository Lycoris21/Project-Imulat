import { useState, useEffect } from "react";

export default function ReviewReportModal({ isOpen, onClose, onApprove, onDisapprove }) {
  const [reviewComment, setReviewComment] = useState("");
  const [showError, setShowError] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Start animation when opened
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  // Animated close
  const handleAnimatedClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      handleClose(); // triggers onClose and clears state
    }, 150);
  };

  // ESC to close
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === "Escape") handleAnimatedClose();
    };
    if (isOpen) document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [isOpen]);

  // Click outside to close
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) handleAnimatedClose();
  };

  const handleClose = () => {
    onClose();
    setReviewComment("");
    setShowError(false);
  };

  const handleApprove = () => {
    onApprove(reviewComment.trim());
    handleAnimatedClose();
  };

  const handleDisapprove = () => {
    if (!reviewComment.trim()) {
      setShowError(true);
      return;
    }
    onDisapprove(reviewComment.trim());
    handleAnimatedClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-[#00000080] flex items-center justify-center z-50 transition-opacity duration-150 ${
        isAnimating ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 transition-all duration-150 ${
          isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">Review Report</h2>

        <p className="text-gray-600 mb-4">
          If you disapprove this report, a comment is required. Otherwise, comments are optional.
        </p>

        <textarea
          value={reviewComment}
          onChange={(e) => {
            setReviewComment(e.target.value);
            setShowError(false);
          }}
          placeholder="Add your comment (required if disapproving)..."
          className={`w-full p-3 border rounded-lg resize-none focus:ring-2 focus:outline-none ${
            showError ? "border-red-500 focus:ring-red-300" : "border-gray-300 focus:ring-blue-500"
          }`}
          rows={4}
        />
        {showError && (
          <p className="text-sm text-red-600 mt-2">Comment is required when disapproving.</p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <button
            onClick={handleDisapprove}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium cursor-pointer"
          >
            Disapprove
          </button>
          <button
            onClick={handleApprove}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium cursor-pointer"
          >
            Approve
          </button>
        </div>

        <button
          onClick={handleAnimatedClose}
          className="mt-4 w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
