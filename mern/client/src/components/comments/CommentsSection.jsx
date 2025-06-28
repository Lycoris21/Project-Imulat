import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';

export default function CommentsSection({ targetId, targetType }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to update comment reactions recursively
  const updateCommentReaction = (comments, targetId, updateFn) => {
    return comments.map(comment => {
      if (comment._id === targetId) {
        return updateFn(comment);
      }
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: updateCommentReaction(comment.replies, targetId, updateFn)
        };
      }
      return comment;
    });
  };

  // Fetch comments
  const fetchComments = async () => {
    // Don't fetch if targetId is not available
    if (!targetId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      let url = `http://localhost:5050/api/comments?targetId=${targetId}&targetType=${targetType}`;
      
      // Add userId to get user reaction status
      if (user?._id) {
        url += `&userId=${user._id}`;
      }
      
      const response = await fetch(url);
      
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

  // Like comment with optimistic update
  const handleLikeComment = async (commentId) => {
    if (!user) return;

    // Update UI immediately
    setComments(prevComments => 
      updateCommentReaction(prevComments, commentId, (comment) => {
        const currentReaction = comment.userReaction;
        const wasLiked = currentReaction === 'like';
        const wasDisliked = currentReaction === 'dislike';
        
        return {
          ...comment,
          likes: wasLiked ? comment.likes - 1 : comment.likes + 1,
          dislikes: wasDisliked ? comment.dislikes - 1 : comment.dislikes,
          userReaction: wasLiked ? null : 'like'
        };
      })
    );

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
        // Revert optimistic update on error
        await fetchComments();
      }
    } catch (err) {
      console.error('Error liking comment:', err);
      // Revert optimistic update on error
      await fetchComments();
    }
  };

  // Dislike comment with optimistic update
  const handleDislikeComment = async (commentId) => {
    if (!user) return;

    // Update UI immediately
    setComments(prevComments => 
      updateCommentReaction(prevComments, commentId, (comment) => {
        const currentReaction = comment.userReaction;
        const wasLiked = currentReaction === 'like';
        const wasDisliked = currentReaction === 'dislike';
        
        return {
          ...comment,
          likes: wasLiked ? comment.likes - 1 : comment.likes,
          dislikes: wasDisliked ? comment.dislikes - 1 : comment.dislikes + 1,
          userReaction: wasDisliked ? null : 'dislike'
        };
      })
    );

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
        // Revert optimistic update on error
        await fetchComments();
      }
    } catch (err) {
      console.error('Error disliking comment:', err);
      // Revert optimistic update on error
      await fetchComments();
    }
  };

  // Fetch comments on component mount
  useEffect(() => {
    fetchComments();
  }, [targetId, targetType, user?._id]);

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
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors cursor-pointer"
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
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
