import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

export default function ClaimDetail() {
  const { id } = useParams();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userReaction, setUserReaction] = useState(null); // 'like', 'dislike', or null
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  // Mock data - replace with actual API call
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockClaim = {
        id: id,
        claimTitle: `Detailed Claim ${id}: Important Statement Requiring Fact-Check`,
        submitterUsername: "ClaimSubmitter_User",
        reportId: id % 2 === 0 ? `report_${id}` : null, // Some claims have reports, some don't
        aiTruthIndex: Math.floor(Math.random() * 101),
        aiClaimSummary: "AI analysis indicates this claim contains elements that require careful verification. Multiple sources suggest mixed evidence supporting different aspects of the statement.",
        claimContent: `
This claim addresses important issues that have been circulating in various media outlets and social platforms. The statement in question makes several assertions that need to be examined:

1. **Primary Assertion**: The main claim being made and its context
2. **Supporting Evidence**: What evidence, if any, is provided with the original claim
3. **Contradictory Information**: Information that challenges or contradicts the claim
4. **Context and Background**: Historical or situational context that affects the validity

The claim originated from [source] and has been shared widely across different platforms. Understanding the accuracy of this information is crucial for public awareness and informed decision-making.

Key points that require verification:
• Specific statistics or numbers mentioned
• Attribution of quotes or statements to individuals
• Timeline of events as described
• Cause-and-effect relationships claimed
        `,
        claimSources: `
• Original Social Media Post - Platform X, June 2025
• News Article Reference - News Outlet Y
• Statistical Database - Government Source Z
• Expert Opinion - Dr. John Expert, University ABC
        `,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        likes: 28,
        dislikes: 7,
        bookmarks: 15
      };
      
      const mockComments = [
        {
          id: 1,
          username: "FactChecker99",
          content: "This claim definitely needs more investigation. I've seen conflicting information.",
          createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
          likes: 12
        },
        {
          id: 2,
          username: "ResearcherJane",
          content: "The AI Truth Index seems reasonable given the mixed evidence available.",
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
          likes: 6
        }
      ];

      setClaim(mockClaim);
      setComments(mockComments);
      setLoading(false);
    }, 1000);
  }, [id]);

  const getTruthIndexColor = (index) => {
    if (index >= 80) return "text-green-600 bg-green-100 border-green-200";
    if (index >= 60) return "text-yellow-600 bg-yellow-100 border-yellow-200";
    if (index >= 40) return "text-orange-600 bg-orange-100 border-orange-200";
    return "text-red-600 bg-red-100 border-red-200";
  };

  const formatRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days === 1 ? '' : 's'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleReaction = (type) => {
    setUserReaction(userReaction === type ? null : type);
    // TODO: API call to save reaction
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // TODO: API call to save bookmark
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      const comment = {
        id: comments.length + 1,
        username: "CurrentUser", // Get from auth context
        content: newComment,
        createdAt: new Date(),
        likes: 0
      };
      setComments([...comments, comment]);
      setNewComment("");
      // TODO: API call to save comment
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-5rem)] bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading claim...</p>
        </div>
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Claim Not Found</h1>
          <p className="text-gray-600 mb-4">The claim you're looking for doesn't exist.</p>
          <Link to="/" className="text-blue-600 hover:underline">← Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium">
            ← Back to Home
          </Link>
        </div>

        {/* Claim Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{claim.claimTitle}</h1>
              <p className="text-gray-600 mb-2">Submitted by <span className="font-medium">{claim.submitterUsername}</span></p>
              <p className="text-gray-500 text-sm">{formatRelativeTime(claim.createdAt)}</p>
            </div>
            <div className={`px-4 py-2 rounded-lg border ${getTruthIndexColor(claim.aiTruthIndex)}`}>
              <span className="font-semibold">AI Truth Index: {claim.aiTruthIndex}%</span>
            </div>
          </div>

          {/* Report Link */}
          {claim.reportId && (
            <div className="mb-4">
              <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  <span className="text-blue-800 font-medium">Fact-Check Report Available</span>
                </div>
                <Link 
                  to={`/reports/${claim.reportId.replace('report_', '')}`}
                  className="text-blue-600 hover:text-blue-800 underline mt-1 inline-block"
                >
                  View Full Fact-Check Report →
                </Link>
              </div>
            </div>
          )}

          {/* AI Summary */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">AI Claim Summary</h3>
            <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
              <p className="text-gray-700">{claim.aiClaimSummary}</p>
            </div>
          </div>
        </div>

        {/* Claim Content */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Full Claim Details</h2>
          <div className="prose max-w-none">
            <div className="whitespace-pre-line text-gray-700 leading-relaxed">
              {claim.claimContent}
            </div>
          </div>
        </div>

        {/* Claim Sources */}
        {claim.claimSources && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Claim Sources</h2>
            <div className="whitespace-pre-line text-gray-700">
              {claim.claimSources}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Like/Dislike */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleReaction('like')}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition ${
                    userReaction === 'like' 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                  <span>{claim.likes}</span>
                </button>
                <button
                  onClick={() => handleReaction('dislike')}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition ${
                    userReaction === 'dislike' 
                      ? 'bg-red-100 text-red-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" transform="rotate(180)">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                  <span>{claim.dislikes}</span>
                </button>
              </div>

              {/* Bookmark */}
              <button
                onClick={handleBookmark}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition ${
                  isBookmarked 
                    ? 'bg-yellow-100 text-yellow-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h14a1 1 0 011 1v16l-8-4-8 4V3z" />
                </svg>
                <span>Bookmark</span>
              </button>

              {/* Share */}
              <button className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Comments ({comments.length})</h2>
          
          {/* Add Comment Form */}
          <form onSubmit={handleCommentSubmit} className="mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts on this claim..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none"
              rows="3"
            />
            <button
              type="submit"
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Post Comment
            </button>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-gray-800">{comment.username}</span>
                  <span className="text-sm text-gray-500">{formatRelativeTime(comment.createdAt)}</span>
                </div>
                <p className="text-gray-700 mb-2">{comment.content}</p>
                <button className="text-sm text-gray-500 hover:text-blue-600">
                  👍 {comment.likes}
                </button>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
