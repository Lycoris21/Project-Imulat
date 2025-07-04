import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LoginRequiredModal } from "../index";
import { useState } from "react";

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
}) {
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

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

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-wrap gap-4">
          {/* Like */}
          <button
            onClick={() => handleReaction("like")}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition ${
              userReaction === "like"
                ? "bg-green-100 text-green-600"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer"
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
            </svg>
            <span>{likes} {likes === 1 ? "Like" : "Likes"}</span>
          </button>

          {/* Dislike */}
          <button
            onClick={() => handleReaction("dislike")}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition ${
              userReaction === "dislike"
                ? "bg-red-100 text-red-600"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer"
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" transform="rotate(180)">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
            </svg>
            <span>{dislikes} {dislikes === 1 ? "Dislike" : "Dislikes"}</span>
          </button>

          {/* Bookmark */}
          <button
            onClick={handleBookmarkClick}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition ${
              isBookmarked
                ? "bg-yellow-100 text-yellow-600"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer"
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h14a1 1 0 011 1v16l-8-4-8 4V3z" />
            </svg>
            <span>{isBookmarked ? "Bookmarked" : "Bookmark"}</span>
          </button>

          {/* Share */}
          <button
            onClick={
              onShare ||
              (() => {
                navigator.clipboard.writeText(window.location.href)
                  .then(() => alert("Link copied to clipboard!"))
                  .catch(() => alert("Failed to copy link."));
              })
            }
            className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition cursor-pointer"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
            </svg>
            <span>Share</span>
          </button>

          {/* Edit */}
          {canEdit && (
            <button
              onClick={handleEditClick}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition cursor-pointer"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.414 2.586a2 2 0 00-2.828 0L6 11.172V14h2.828l8.586-8.586a2 2 0 000-2.828zM4 16h12a1 1 0 010 2H4a1 1 0 010-2z" />
              </svg>
              <span>Edit</span>
            </button>
          )}

          {/* Delete */}
          {canDelete && (
            <button
              onClick={handleDeleteClick}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Delete</span>
            </button>
          )}
        </div>

        {/* Researcher-only report button (only on claim pages) */}
        {canResearch && pageType === "claim" && handleOpenModal && (
          <button
            onClick={handleOpenModal}
            className="px-4 py-2 bg-[color:var(--color-dark)] text-white font-semibold rounded-lg shadow-lg hover:bg-[#1E275E80] transition-all duration-200 flex items-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Make A Report
          </button>
        )}
      </div>

      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        action="like, dislike, bookmark, edit or delete content"
      />
    </div>
  );
}
