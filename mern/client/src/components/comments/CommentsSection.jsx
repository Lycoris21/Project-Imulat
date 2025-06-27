import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';

export default function CommentsSection({ targetId, targetType }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch comments
  const fetchComments = async () => {
    // Don't fetch if targetId is not available
    if (!targetId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5050/api/comments?targetId=${targetId}&targetType=${targetType}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      
      const data = await response.json();
      setComments(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  // Add new comment
  const handleAddComment = async (commentData) => {
    try {
      const response = await fetch('http://localhost:5050/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentData),
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      // Refresh comments to get the updated list
      await fetchComments();
    } catch (err) {
      console.error('Error adding comment:', err);
      throw err; // Re-throw to let CommentForm handle the error
    }
  };

  // Like comment
  const handleLikeComment = async (commentId) => {
    try {
      const response = await fetch(`http://localhost:5050/api/comments/${commentId}/like`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user._id }),
      });

      if (!response.ok) {
        throw new Error('Failed to like comment');
      }

      // Refresh comments to get updated counts
      await fetchComments();
    } catch (err) {
      console.error('Error liking comment:', err);
      throw err;
    }
  };

  // Dislike comment
  const handleDislikeComment = async (commentId) => {
    try {
      const response = await fetch(`http://localhost:5050/api/comments/${commentId}/dislike`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user._id }),
      });

      if (!response.ok) {
        throw new Error('Failed to dislike comment');
      }

      // Refresh comments to get updated counts
      await fetchComments();
    } catch (err) {
      console.error('Error disliking comment:', err);
      throw err;
    }
  };

  // Fetch comments on component mount
  useEffect(() => {
    fetchComments();
  }, [targetId, targetType]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Comments</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading comments...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Comments</h3>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchComments}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const topLevelComments = comments.filter(comment => !comment.parentCommentId);

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Comments ({comments.length})
        </h3>
      </div>

      {/* Add Comment Form */}
      <div className="p-6 border-b border-gray-200">
        <CommentForm
          onSubmit={handleAddComment}
          targetId={targetId}
          targetType={targetType}
          placeholder="What are your thoughts?"
        />
      </div>

      {/* Comments List */}
      <div className="divide-y divide-gray-200">
        {topLevelComments.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-2.126-.275c-1.667-.52-3.06-1.91-3.579-3.579C6.973 15.955 6 14.418 6 12s.973-3.955 1.295-4.146c.52-1.667 1.912-3.06 3.579-3.579A8.955 8.955 0 0112 4c4.418 0 8 3.582 8 8z" />
            </svg>
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="p-6">
            {topLevelComments.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                targetId={targetId}
                targetType={targetType}
                onAddComment={handleAddComment}
                onLikeComment={handleLikeComment}
                onDislikeComment={handleDislikeComment}
                level={0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
