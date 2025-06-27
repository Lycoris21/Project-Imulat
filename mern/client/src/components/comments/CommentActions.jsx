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
        <svg className="w-4 h-4" fill={userReaction === 'like' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L9 7v13m-7-10h2m5-10h2m7 10h2" />
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
        <svg className="w-4 h-4" fill={userReaction === 'dislike' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L15 17V4M3 14h2m-2 0h2m13-10v2m-5-2H9m0 0v2m0-2h2" />
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
