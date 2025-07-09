import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LoginRequiredModal } from "../index";
import { useState } from "react";
import AlertModal from "../modals/AlertModal";
import ReviewReportModal from "../modals/ReviewReportModal";
import SuccessToast from "./SuccessToast";

export default function ReactionBar({
  likes,
  dislikes,
  isBookmarked,
  userReaction,
  onReact,
  onBookmark,
  onShare,
  onDelete,
  onEdit,
  canDelete = false,
  canEdit = false,
  handleOpenModal,
  pageType, // "claim" or "report"
  onReviewReport, // Function to handle review report action
}) {
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [alert, setAlert] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success'
  });

  const handleReaction = (reactionType) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    onReact(reactionType);
  };

  const handleBookmarkClick = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    onBookmark();
  };

  const handleDeleteClick = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    onDelete();
  };

  const handleEditClick = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    onEdit();
  };

  const canResearch = user?.role === "admin" || user?.role === "researcher";

  const handleReviewClick = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setShowReviewModal(true);
  };

  const handleApproveReport = () => {
    if (onReviewReport) {
      onReviewReport('approve');
    }
    setToastMessage("Approved Report Successfully");
    setShowSuccessToast(true);
  };

  const handleDisapproveReport = (reason) => {
    if (onReviewReport) {
      onReviewReport('disapprove', reason);
    }
    setToastMessage("Disapproved Report Successfully");
    setShowSuccessToast(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 md:p-5 lg:p-6 mb-4 sm:mb-6">
      <div className="flex items-center justify-between gap-1 sm:gap-2 md:gap-3 lg:gap-4 min-w-0">
        <div className="flex items-center gap-1 sm:gap-2 md:gap-2 lg:gap-4 flex-wrap sm:flex-nowrap min-w-0">
          {/* Like */}
          <button
            onClick={() => handleReaction("like")}
            className={`flex items-center space-x-1 px-3 py-2 sm:px-3 sm:py-2 md:px-3 md:py-2 rounded-lg transition text-xs md:text-sm lg:text-base ${
              userReaction === "like"
                ? "bg-green-100 text-green-600"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer"
            }`}
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-4 md:h-4 lg:w-5 lg:h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
            </svg>
            <span>{likes}</span>
            <span className="hidden md:inline">{likes === 1 ? "Like" : "Likes"}</span>
          </button>

          {/* Dislike */}
          <button
            onClick={() => handleReaction("dislike")}
            className={`flex items-center space-x-1 px-3 py-2 sm:px-3 sm:py-2 md:px-3 md:py-2 rounded-lg transition text-xs md:text-sm lg:text-base ${
              userReaction === "dislike"
                ? "bg-red-100 text-red-600"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer"
            }`}
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-4 md:h-4 lg:w-5 lg:h-5" fill="currentColor" viewBox="0 0 20 20" transform="rotate(180)">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
            </svg>
            <span>{dislikes}</span>
            <span className="hidden md:inline">{dislikes === 1 ? "Dislike" : "Dislikes"}</span>
          </button>

          {/* Bookmark */}
          <button
            onClick={handleBookmarkClick}
            className={`flex items-center space-x-1 px-3 py-2 sm:px-3 sm:py-2 md:px-3 md:py-2 rounded-lg transition text-xs md:text-sm lg:text-base ${
              isBookmarked
                ? "bg-yellow-100 text-yellow-600"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer"
            }`}
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-4 md:h-4 lg:w-5 lg:h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h14a1 1 0 011 1v16l-8-4-8 4V3z" />
            </svg>
            <span className="hidden md:inline">{isBookmarked ? "Bookmarked" : "Bookmark"}</span>
          </button>

          {/* Share */}
          <button
            onClick={
              onShare ||
              (() => {
                navigator.clipboard.writeText(window.location.href)
                  .then(() => setAlert({
                    isOpen: true,
                    title: 'Success',
                    message: 'Link copied to clipboard!',
                    type: 'success'
                  }))
                  .catch(() => setAlert({
                    isOpen: true,
                    title: 'Copy Failed',
                    message: 'Failed to copy link.',
                    type: 'error'
                  }));
              })
            }
            className="flex items-center space-x-1 px-3 py-2 sm:px-3 sm:py-2 md:px-3 md:py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition cursor-pointer text-xs md:text-sm lg:text-base"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-4 md:h-4 lg:w-5 lg:h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
            </svg>
            <span className="hidden md:inline">Share</span>
          </button>

          {/* Edit */}
          {canEdit && (
            <button
              onClick={handleEditClick}
              className="flex items-center space-x-1 px-3 py-2 sm:px-3 sm:py-2 md:px-3 md:py-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition cursor-pointer text-xs md:text-sm lg:text-base"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-4 md:h-4 lg:w-5 lg:h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.414 2.586a2 2 0 00-2.828 0L6 11.172V14h2.828l8.586-8.586a2 2 0 000-2.828zM4 16h12a1 1 0 010 2H4a1 1 0 010-2z" />
              </svg>
              <span className="hidden md:inline">Edit</span>
            </button>
          )}

          {/* Delete */}
          {canDelete && (
            <button
              onClick={handleDeleteClick}
              className="flex items-center space-x-1 px-3 py-2 sm:px-3 sm:py-2 md:px-3 md:py-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition cursor-pointer text-xs md:text-sm lg:text-base"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-4 md:h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="hidden md:inline">Delete</span>
            </button>
          )}
        </div>

        {/* Researcher-only report button (only on claim pages) */}
        {canResearch && pageType === "claim" && handleOpenModal && (
          <button
            onClick={handleOpenModal}
            className="px-2 py-2 sm:px-3 sm:py-2 md:px-3 md:py-2 lg:px-4 lg:py-2 bg-[color:var(--color-dark)] text-white font-semibold rounded-lg shadow-lg hover:bg-[#1E275E80] transition-all duration-200 flex items-center gap-1 cursor-pointer text-xs md:text-sm lg:text-base flex-shrink-0"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="sm:hidden">Report</span>
            <span className="hidden sm:inline">Report</span>
          </button>
        )}

        {/* Researcher-only review button (only on report pages) */}
        {canResearch && pageType === "report" && (
          <button
            onClick={handleReviewClick}
            className="px-2 py-2 sm:px-3 sm:py-2 md:px-3 md:py-2 lg:px-4 lg:py-2 bg-[color:var(--color-dark)] text-white font-semibold rounded-lg shadow-lg hover:bg-[#1E275E80] transition-all duration-200 flex items-center gap-1 cursor-pointer text-xs md:text-sm lg:text-base flex-shrink-0"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="sm:hidden">Review</span>
            <span className="hidden sm:inline">Review</span>
          </button>
        )}
      </div>

      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        action="like, dislike, bookmark, edit or delete content"
      />

      <ReviewReportModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onApprove={handleApproveReport}
        onDisapprove={handleDisapproveReport}
      />

      <SuccessToast
        message={toastMessage}
        isVisible={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
      />

      <AlertModal
        isOpen={alert.isOpen}
        onClose={() => setAlert(prev => ({ ...prev, isOpen: false }))}
        title={alert.title}
        message={alert.message}
        type={alert.type}
      />
    </div>
  );
}
