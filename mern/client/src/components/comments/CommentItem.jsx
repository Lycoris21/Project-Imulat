import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { formatTimeAgo } from '../../utils/time';
import CommentActions from './CommentActions';
import CommentForm from './CommentForm';
import AlertModal from '../modals/AlertModal';

export default function CommentItem({ 
  comment, 
  targetId,
  targetType,
  onAddComment,
  onLikeComment,
  onDislikeComment,
  onEditComment,
  onDeleteComment,
  level = 0 // For indentation
}) {
  const { user } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.commentContent);
  const dropdownRef = useRef(null);
  const [alert, setAlert] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'error'
  });
  
  const maxLevel = 3; // Maximum nesting level
  const baseIndent = window.innerWidth < 640 ? 15 : 20; // Base indent for mobile/desktop
  const maxIndent = window.innerWidth < 640 ? 60 : 80; // Max indent to prevent overflow
  const indentWidth = Math.min(level * baseIndent, maxIndent); // Responsive indent with max limit
  const avatarSize = Math.max(window.innerWidth < 640 ? 28 - (level * 2) : 32 - (level * 3), 20); // Responsive avatar size

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  const handleReply = () => {
    setShowReplyForm(!showReplyForm);
  };

  const handleSubmitReply = async (replyData) => {
    await onAddComment(replyData);
    setShowReplyForm(false);
  };

  const toggleReplies = () => {
    setShowReplies(!showReplies);
  };

  const handleEditSave = async () => {
    if (editText.trim() !== comment.commentContent) {
      try {
        await onEditComment(comment._id, editText.trim());
        setIsEditing(false);
        setShowDropdown(false);
      } catch (error) {
        console.error('Failed to edit comment:', error);
        // Reset the edit text on error
        setEditText(comment.commentContent);
        setAlert({
          isOpen: true,
          title: 'Edit Failed',
          message: 'Failed to edit comment. Please try again.',
          type: 'error'
        });
      }
    } else {
      setIsEditing(false);
      setShowDropdown(false);
    }
  };

  const handleEditCancel = () => {
    setEditText(comment.commentContent);
    setIsEditing(false);
    setShowDropdown(false);
  };

  const handleDelete = async () => {
    const confirmMessage = user && user.role === 'admin' && user._id !== comment.userId._id
      ? 'Are you sure you want to delete this comment as an admin?'
      : 'Are you sure you want to delete your comment?';
      
    if (window.confirm(confirmMessage)) {
      try {
        await onDeleteComment(comment._id);
        setShowDropdown(false);
      } catch (error) {
        console.error('Failed to delete comment:', error);
        setAlert({
          isOpen: true,
          title: 'Delete Failed',
          message: 'Failed to delete comment. Please try again.',
          type: 'error'
        });
        setShowDropdown(false);
      }
    } else {
      setShowDropdown(false);
    }
  };

  // Check if user can edit (own comment) or delete (own comment or admin)
  const canEdit = user && user._id === comment.userId._id;
  const canDelete = user && (user._id === comment.userId._id || user.role === 'admin');

  return (
    <div id={`comment-${comment._id}`} className="group relative">
      {/* Main Comment */}
      <div 
        className="flex space-x-2 sm:space-x-3 py-2 sm:py-3 pr-2 sm:pr-4"
        style={{ marginLeft: `${indentWidth}px` }}
      >
        {/* Left border for replies */}
        {level > 0 && (
          <div 
            className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200" 
            style={{ marginLeft: `${Math.max(indentWidth - 10, 5)}px` }} 
          />
        )}

        {/* User Avatar */}
        <div 
          className="bg-gray-300 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
          style={{ width: `${avatarSize}px`, height: `${avatarSize}px` }}
        >
          <Link to={`/profile/${comment.userId._id}`}>
            {comment.userId.profilePictureUrl ? (
              <img
                src={comment.userId.profilePictureUrl}
                alt={comment.userId.username}
                className="w-full h-full object-cover hover:opacity-80 transition-opacity"
              />
            ) : (
              <span className="text-gray-600 font-medium text-xs sm:text-sm hover:text-blue-600 transition-colors">
                {comment.userId.username?.charAt(0).toUpperCase() || "U"}
              </span>
            )}
          </Link>
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0 max-w-full overflow-hidden">
          {/* User Info and Timestamp */}
          <div className="flex items-center justify-between mb-1 flex-wrap sm:flex-nowrap gap-1">
            <div className="flex items-center space-x-1 sm:space-x-2 min-w-0 flex-shrink">
              <Link 
                to={`/profile/${comment.userId._id}`}
                className="font-medium text-gray-900 hover:text-blue-600 transition-colors text-sm sm:text-base truncate"
              >
                {comment.userId.username}
              </Link>
              <span className="text-gray-500 text-xs sm:text-sm flex-shrink-0">•</span>
              <span className="text-gray-500 text-xs sm:text-sm flex-shrink-0">
                {formatTimeAgo(comment.createdAt)}
              </span>
            </div>

            {/* Three-dot menu for edit/delete */}
            {(canEdit || canDelete) && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-gray-100 transition-all"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>

                {/* Dropdown menu */}
                {showDropdown && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[100px] sm:min-w-[120px]">
                    {canEdit && (
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setShowDropdown(false);
                        }}
                        className="w-full text-left px-2 py-2 sm:px-3 sm:py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-1 sm:gap-2"
                      >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={handleDelete}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Comment Text */}
          {isEditing ? (
            <div className="mb-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full max-w-full p-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                rows={window.innerWidth < 640 ? 2 : 3}
                autoFocus
                placeholder="Edit your comment..."
              />
              <div className="flex gap-1 sm:gap-2 mt-2 flex-wrap">
                <button
                  onClick={handleEditSave}
                  disabled={editText.trim().length === 0}
                  className="px-2 py-1 sm:px-3 sm:py-1 bg-[color:var(--color-dark)] text-white text-xs sm:text-sm rounded-lg hover:bg-[color:var(--color-base)] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Save
                </button>
                <button
                  onClick={handleEditCancel}
                  className="px-2 py-1 sm:px-3 sm:py-1 bg-gray-200 text-gray-700 text-xs sm:text-sm rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="text-gray-800 mb-2 whitespace-pre-wrap break-words text-sm sm:text-base overflow-wrap-anywhere">
              {comment.commentContent}
              {comment.updatedAt && new Date(comment.updatedAt) > new Date(comment.createdAt) && (
                <span className="text-gray-500 text-xs ml-2">(edited)</span>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <CommentActions
            commentId={comment._id}
            likes={comment.reactionCounts.like || 0}
            dislikes={comment.reactionCounts.dislike || 0}
            repliesCount={comment.replies?.length || 0}
            onLike={onLikeComment}
            onDislike={onDislikeComment}
            onReply={handleReply}
            userReaction={comment.userReaction} // This would come from backend
          />

          {/* Reply Form */}
          {showReplyForm && (
            <div className="mt-3 overflow-hidden">
              <CommentForm
                onSubmit={handleSubmitReply}
                placeholder={`Reply to ${comment.userId.username}...`}
                parentCommentId={comment._id}
                targetId={targetId}
                targetType={targetType}
                onCancel={() => setShowReplyForm(false)}
                buttonText="Post Reply"
              />
            </div>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-2">
              {/* Toggle Replies Button */}
              <button
                onClick={toggleReplies}
                className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 transition-colors mb-2 flex items-center space-x-1"
              >
                <svg 
                  className={`w-2 h-2 sm:w-3 sm:h-3 transition-transform ${showReplies ? 'rotate-90' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-xs sm:text-sm">
                  {showReplies ? 'Hide' : 'Show'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                </span>
              </button>

              {/* Render Replies */}
              {showReplies && (
                <div className="overflow-hidden">
                  {comment.replies.map((reply) => (
                    <CommentItem
                      key={reply._id}
                      comment={reply}
                      targetId={targetId}
                      targetType={targetType}
                      onAddComment={onAddComment}
                      onLikeComment={onLikeComment}
                      onDislikeComment={onDislikeComment}
                      onEditComment={onEditComment}
                      onDeleteComment={onDeleteComment}
                      level={level + 1}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

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
