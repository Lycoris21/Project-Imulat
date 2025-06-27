import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function CommentActions({ 
  commentId, 
  likes = 0, 
  dislikes = 0, 
  repliesCount = 0,
  onLike,
  onDislike,
  onReply,
  userReaction = null // 'like', 'dislike', or null
}) {
  const { user } = useAuth();
  const [isLiking, setIsLiking] = useState(false);
  const [isDisliking, setIsDisliking] = useState(false);

  const handleLike = async () => {
    if (!user || isLiking) return;
    setIsLiking(true);
    try {
      await onLike(commentId);
    } catch (error) {
      console.error('Error liking comment:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDislike = async () => {
    if (!user || isDisliking) return;
    setIsDisliking(true);
    try {
      await onDislike(commentId);
    } catch (error) {
      console.error('Error disliking comment:', error);
    } finally {
      setIsDisliking(false);
    }
  };

  return (
    <div className="flex items-center space-x-4 text-sm text-gray-500">
      {/* Like Button */}
      <button
        onClick={handleLike}
        disabled={!user || isLiking}
        className={`flex items-center space-x-1 hover:text-blue-600 transition-colors disabled:opacity-50 ${
          userReaction === 'like' ? 'text-blue-600' : ''
        }`}
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
        </svg>
        <span>{likes}</span>
      </button>

      {/* Dislike Button */}
      <button
        onClick={handleDislike}
        disabled={!user || isDisliking}
        className={`flex items-center space-x-1 hover:text-red-600 transition-colors disabled:opacity-50 ${
          userReaction === 'dislike' ? 'text-red-600' : ''
        }`}
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" transform="rotate(180)">
            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
        </svg>
        <span>{dislikes}</span>
      </button>

      {/* Reply Button */}
      <button
        onClick={onReply}
        disabled={!user}
        className="flex items-center space-x-1 hover:text-green-600 transition-colors disabled:opacity-50"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
        <span>Reply</span>
        {repliesCount > 0 && <span>({repliesCount})</span>}
      </button>
    </div>
  );
}
