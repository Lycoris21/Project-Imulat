import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { capitalizeWords } from "../utils/stringUtils";
import { useAuth } from "../context/AuthContext";

export default function ReportDetail() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userReaction, setUserReaction] = useState(null); // 'like', 'dislike', or null
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(`http://localhost:5050/api/reports/${id}`);
        if (!response.ok) throw new Error("Failed to fetch report");

        const data = await response.json();
        data.truthVerdict = capitalizeWords(data.truthVerdict);
        setReport(data);
      } catch (err) {
        console.error("Error fetching report:", err);
        setReport(null); // ensure it's null so error message renders
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
    fetchComments();
  }, [id]);

  const getVerdictColor = (verdict) => {
    switch (verdict) {
      case "True": case "Verified": return "text-green-600 bg-green-100 border-green-200";
      case "False": case "Debunked": return "text-red-600 bg-red-100 border-red-200";
      case "Partially True": case "Misleading": return "text-yellow-600 bg-yellow-100 border-yellow-200";
      default: return "text-gray-600 bg-gray-100 border-gray-200";
    }
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

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const commentPayload = {
      userId: user?._id,
      targetId: id,
      targetType: "Report",
      commentContent: newComment
    };

    try {
      const res = await fetch("http://localhost:5050/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(commentPayload)
      });

      if (!res.ok) throw new Error("Failed to submit comment");
      const savedComment = await res.json();

      await fetchComments(); 
      setNewComment("");
    } catch (err) {
      console.error("Error submitting comment:", err);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`http://localhost:5050/api/comments/report/${id}`);
      if (!response.ok) throw new Error("Failed to fetch comments");

      const data = await response.json();
      const normalized = data.map((comment) => ({
        id: comment._id,
        username: comment.userId?.username || "Unknown",
        content: comment.commentContent,
        createdAt: comment.createdAt,
        likes: 0
      }));
      
      setComments(normalized);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-[linear-gradient(to_bottom,_#4B548B_0%,_#2F3558_75%,_#141625_100%)]  flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading report...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-[linear-gradient(to_bottom,_#4B548B_0%,_#2F3558_75%,_#141625_100%)]  flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Report Not Found</h1>
          <p className="text-gray-600 mb-4">The report you're looking for doesn't exist.</p>
          <Link to="/" className="text-blue-600 hover:underline">← Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[linear-gradient(to_bottom,_#4B548B_0%,_#2F3558_75%,_#141625_100%)]  py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium">
            ← Back to Home
          </Link>
        </div>        {/* Report Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          {/* Cover Image */}
          {report.reportCoverUrl && (
            <div className="mb-6">
              <img 
                src={report.reportCoverUrl} 
                alt={`Cover for ${report.reportTitle}`}
                className="w-full h-64 object-cover rounded-lg shadow-md"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
          
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{report.reportTitle}</h1>
              <p className="text-gray-600 mb-2">By <span className="font-medium">{report.adminUsername}</span></p>
              <p className="text-gray-500 text-sm">{formatRelativeTime(report.createdAt)}</p>
            </div>
            <div className={`px-4 py-2 rounded-lg border ${getVerdictColor(report.truthVerdict)}`}>
              <span className="font-semibold">{report.truthVerdict}</span>
            </div>
          </div>

          {/* Related Claims */}
          {report.claimTitle && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Related Claims</h3>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-gray-700">{report.claimTitle}</p>
                {report.claimLinks && report.claimLinks.length > 0 && (
                  <div className="mt-2 space-x-2">
                    {report.claimLinks.map((claim) => (
                      <Link 
                        key={claim.id} 
                        to={claim.url}
                        className="inline-block text-blue-600 hover:text-blue-800 text-sm underline"
                      >
                        {claim.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AI Summary */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">AI Report Summary</h3>
            <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
              <p className="text-gray-700">{report.aiReportSummary}</p>
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Full Report</h2>
          <div className="prose max-w-none">
            <div className="whitespace-pre-line text-gray-700 leading-relaxed">
              {report.reportContent}
            </div>
          </div>
        </div>

        {/* Report Conclustion */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Conclusion</h2>
          <p className="text-gray-700">{report.reportConclusion}</p>
        </div>

        {/* References */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">References</h2>
          <div className="whitespace-pre-line text-gray-700">
            {report.reportReferences}
          </div>
        </div>

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
                  <span>{report.likes}</span>
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
                  <span>{report.dislikes}</span>
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
              placeholder="Share your thoughts on this report..."
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
