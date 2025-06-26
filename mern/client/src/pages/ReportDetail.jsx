import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { parseTruthVerdict } from "../utils/strings";
import { useAuth } from "../context/AuthContext";
import { formatRelativeTime } from '../utils/time.js';
import { getVerdictColor } from '../utils/colors.js';

// Components
import { LoadingScreen, ErrorScreen, ReactionBar } from '../components'

export default function ReportDetail() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userReaction, setUserReaction] = useState(null); // 'like', 'dislike', or null
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
  const fetchInitialData = async () => {
    setLoading(true);

    const reportPromise = fetch(`http://localhost:5050/api/reports/${id}`);
    const reactionPromise = user?._id
      ? fetch(`http://localhost:5050/api/reactions/user/report/${id}/${user._id}`)
      : null;

    try {
        const [reportRes, reactionRes] = await Promise.all([
          reportPromise,
          reactionPromise
        ]);

        if (reportRes.ok) {
          const reportData = await reportRes.json();
          setReport(reportData);
        } else {
          throw new Error("Failed to fetch report");
        }

        if (reactionRes?.ok) {
          const { reactionType } = await reactionRes.json();
          setUserReaction(reactionType || null);
        } else {
          setUserReaction(null);
        }

        await fetchComments();

        setLoading(false);
      } catch (err) {
        console.error("Error loading data:", err);
        setReport(null);
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [id, user?._id]);

  const handleReaction = async (type) => {
    const newReaction = userReaction === type ? null : type;

    try {
      if (newReaction) {
        await fetch("http://localhost:5050/api/reactions", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user?._id,
            targetId: id,
            targetType: "report",
            reactionType: type,
          }),
        });
      } else {
        await fetch(`http://localhost:5050/api/reactions/report/${id}/${user?._id}`, {
          method: "DELETE",
        });
      }

      // ✅ Update user reaction state immediately
      setUserReaction(newReaction);

      // ✅ Refetch fresh reaction counts
      const countsRes = await fetch(`http://localhost:5050/api/reactions/counts/report/${id}`);
      const counts = await countsRes.json();

      // ✅ Apply updated counts to report state
      setReport((prev) => ({
        ...prev,
        reactionCounts: counts,
      }));
    } catch (err) {
      console.error("Reaction error:", err);
    }
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
      targetType: "report",
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
      <LoadingScreen message = "Loading report..."/>
    );
  }

  if (!report) {
    return (
      <ErrorScreen title="Report Not Found" message="The report you're looking for doesn't exist."/>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-base-gradient py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Report Header */}
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
              <p className="text-gray-600 mb-2">
                By{" "}
                <Link
                  to={`/profile/${report.userId?._id}`}
                  className="font-medium hover:text-selected hover:underline"
                >
                  {report.userId?.username}
                </Link>
              </p>

              <p className="text-gray-500 text-sm">{formatRelativeTime(report.createdAt)}</p>
            </div>
            <div className={`px-4 py-2 rounded-lg border ${getVerdictColor(report.truthVerdictParsed)}`}>
              <span className="font-semibold">{report.truthVerdictParsed}</span>
            </div>
          </div>

          {/* Related Claims */}
          {report.claimIds && report.claimIds.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Related Claims</h3>
              <div className="bg-blue-50 p-3 rounded-lg space-y-2">
                {report.claimIds.slice(0, 3).map((claim) => (
                  <Link
                    key={claim._id}
                    to={`/claims/${claim._id}`}
                    className="block text-base hover:text-dark text-sm underline"
                  >
                    {claim.claimTitle || 'Untitled Claim'}
                  </Link>
                ))}
              </div>
            </div>
          )}


          {/* AI Summary */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">AI-Generated Summary</h3>
            <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
              <p className="text-gray-700">{report.aiReportSummary}</p>
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Full Report</h2>
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed break-words">
              {report.reportContent}
            </div>
          </div>
        </div>

        {/* Report Conclustion */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Conclusion</h2>
          <p className="text-gray-700 whitespace-pre-wrap break-words">{report.reportConclusion}</p>
        </div>

        {/* References */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">References</h2>
          <div className="whitespace-pre-wrap text-gray-700 break-words">
            {report.reportReferences}
          </div>
        </div>

        {/* Action Buttons */}
        <ReactionBar
          likes={report.reactionCounts.like}
          dislikes={report.reactionCounts.dislike}
          isBookmarked={report.bookmarkedUsers?.includes(user?._id)}
          userReaction={userReaction}
          onReact={handleReaction} // or "Report"
          onBookmark={() => handleBookmark(report._id, "Report")}
        />

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
              className="mt-2 px-4 py-2 bg-dark text-white rounded-lg hover:bg-darker transition"
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
