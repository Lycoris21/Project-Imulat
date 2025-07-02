import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatRelativeTime } from '../../utils/time';

export default function CommentCard({ comment, variant = "default" }) {
  if (!comment) return null;
  const navigate = useNavigate();
  const isCompact = variant === "compact";

  const handleClick = () => {
    const targetType = comment.targetType;
    const targetId = comment.targetId._id;
    const commentId = comment._id;
    navigate(`/${targetType}s/${targetId}?highlight=${commentId}`);
  };

  return (
    <div 
      onClick={handleClick}
      className={`bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-gray-100 hover:bg-[color:var(--color-background-hover)] group ${isCompact ? 'p-4' : 'p-6'}`}
    >
      <div className="flex items-start space-x-3">
        {/* User Avatar */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
            {comment.userId.profilePictureUrl ? (
              <img
                src={comment.userId.profilePictureUrl}
                alt={comment.userId.username}
                className="w-full h-full object-cover hover:opacity-80 transition-opacity"
              />
            ) : (
              <span className="text-gray-600 font-medium text-lg hover:text-blue-600 transition-colors">
                {comment.userId.username?.charAt(0).toUpperCase() || "U"}
              </span>
            )}
          </div>
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                {comment.userId.username}
              </span>
              <span className="text-gray-500 text-sm">•</span>
              <span className="text-gray-500 text-sm">
                {formatRelativeTime(comment.createdAt)}
              </span>
              {comment.updatedAt && new Date(comment.updatedAt) > new Date(comment.createdAt) && (
                <>
                  <span className="text-gray-500 text-sm">•</span>
                  <span className="text-gray-500 text-xs">edited</span>
                </>
              )}
            </div>
          </div>

          {/* Comment Text */}
          <div className={`text-gray-800 mb-3 whitespace-pre-wrap break-words ${isCompact ? 'text-sm' : ''}`}>
            {comment.commentContent}
          </div>

          {/* Comment on what? */}
          {comment.targetId && (
            <div className="mb-3">
              <p className="text-sm text-gray-600">
                Comment on {comment.targetType}:{" "}
                <span className="text-blue-600 group-hover:text-blue-800 font-medium">
                  {comment.targetId.title || comment.targetId.claimTitle || comment.targetId.reportTitle || 'View'}
                </span>
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L9 7m5 3v10M9 7H6m3 0l-3 3" />
              </svg>
              <span>{comment.reactionCounts?.like || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.737 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L15 17m-5-3H6m9 0l3-3" />
              </svg>
              <span>{comment.reactionCounts?.dislike || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.013 9.013 0 01-5-1.484L3 21l1.484-4A8.962 8.962 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{comment.commentCount || comment.replies?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
