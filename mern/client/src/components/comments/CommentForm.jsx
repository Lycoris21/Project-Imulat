import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function CommentForm({ 
  onSubmit, 
  placeholder = "Write a comment...", 
  parentCommentId = null,
  targetId,
  targetType,
  onCancel = null,
  buttonText = "Post Comment"
}) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        userId: user._id,
        targetId,
        targetType,
        parentCommentId,
        commentContent: content.trim()
      });
      setContent('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="p-3 sm:p-4 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-600 text-sm sm:text-base">Please log in to comment</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-start space-x-2 sm:space-x-3">
        {/* User Avatar */}
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
          {user.profilePictureUrl ? (
            <img
              src={user.profilePictureUrl}
              alt={user.username}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-600 font-medium text-xs sm:text-sm">
              {user.username?.charAt(0).toUpperCase() || "U"}
            </span>
          )}
        </div>

        {/* Comment Input */}
        <div className="flex-1 min-w-0 max-w-full">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            className="w-full max-w-full px-2 py-2 sm:px-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none text-sm sm:text-base"
            rows={window.innerWidth < 640 ? 2 : 3}
            maxLength={1000}
            disabled={isSubmitting}
          />
          
          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-2 flex-wrap sm:flex-nowrap gap-1">
            <span className="text-xs text-gray-500 order-2 sm:order-1">
              {content.length}/1000 characters
            </span>
            
            <div className="flex space-x-1 sm:space-x-2 order-1 sm:order-2">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className="px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={!content.trim() || isSubmitting}
                className="px-3 py-1 sm:px-4 sm:py-1 text-xs sm:text-sm bg-[color:var(--color-dark)] text-white rounded hover:bg-[color:var(--color-base)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Posting...' : buttonText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
