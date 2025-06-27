import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatTimeAgo } from '../../utils/time';
import CommentActions from './CommentActions';
import CommentForm from './CommentForm';

export default function CommentItem({ 
  comment, 
  targetId,
  targetType,
  onAddComment,
  onLikeComment,
  onDislikeComment,
  level = 0 // For indentation
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  
  const maxLevel = 3; // Maximum nesting level
  const indentWidth = Math.min(level * 40, maxLevel * 40); // Cap indentation
  const avatarSize = Math.max(32 - (level * 4), 24); // Smaller avatars for deeper levels

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

  return (
    <div className="group">
      {/* Main Comment */}
      <div 
        className="flex space-x-3 py-3"
        style={{ marginLeft: `${indentWidth}px` }}
      >
        {/* Left border for replies */}
        {level > 0 && (
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200" style={{ marginLeft: `${indentWidth - 20}px` }} />
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
              <span className="text-gray-600 font-medium text-sm hover:text-blue-600 transition-colors">
                {comment.userId.username?.charAt(0).toUpperCase() || "U"}
              </span>
            )}
          </Link>
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          {/* User Info and Timestamp */}
          <div className="flex items-center space-x-2 mb-1">
            <Link 
              to={`/profile/${comment.userId._id}`}
              className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
            >
              {comment.userId.username}
            </Link>
            <span className="text-gray-500 text-sm">•</span>
            <span className="text-gray-500 text-sm">
              {formatTimeAgo(comment.createdAt)}
            </span>
          </div>

          {/* Comment Text */}
          <div className="text-gray-800 mb-2 whitespace-pre-wrap break-words">
            {comment.commentContent}
          </div>

          {/* Action Buttons */}
          <CommentActions
            commentId={comment._id}
            likes={comment.likes || 0}
            dislikes={comment.dislikes || 0}
            repliesCount={comment.replies?.length || 0}
            onLike={onLikeComment}
            onDislike={onDislikeComment}
            onReply={handleReply}
            userReaction={comment.userReaction} // This would come from backend
          />

          {/* Reply Form */}
          {showReplyForm && (
            <div className="mt-3">
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
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors mb-2 flex items-center space-x-1"
              >
                <svg 
                  className={`w-4 h-4 transition-transform ${showReplies ? 'rotate-90' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span>
                  {showReplies ? 'Hide' : 'Show'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                </span>
              </button>

              {/* Render Replies */}
              {showReplies && (
                <div>
                  {comment.replies.map((reply) => (
                    <CommentItem
                      key={reply._id}
                      comment={reply}
                      targetId={targetId}
                      targetType={targetType}
                      onAddComment={onAddComment}
                      onLikeComment={onLikeComment}
                      onDislikeComment={onDislikeComment}
                      level={level + 1}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
