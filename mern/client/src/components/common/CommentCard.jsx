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
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
              </svg>
              <span>{comment.reactionCounts?.like || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" transform="rotate(180)">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
              </svg>
              <span>{comment.reactionCounts?.dislike || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>{comment.commentCount || comment.replies?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
