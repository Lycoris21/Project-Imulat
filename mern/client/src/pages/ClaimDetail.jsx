import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // assumes auth context is available
import { getTruthIndexColor } from '../utils/colors';
import { formatRelativeTime } from '../utils/time.js';

// Components
import { LoadingScreen, ErrorScreen, ReactionBar, CreateReportModal } from '../components';

export default function ClaimDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userReaction, setUserReaction] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    reportTitle: "",
    reportContent: "",
    truthVerdict: "",
    reportConclusion: "",
    references: "",
    claimId: "",
    reportCoverFile: null
  });
  const navigate = useNavigate();

  const fetchClaim = async () => {
    try {
      const claimRes = await fetch(`http://localhost:5050/api/claims/${id}`);
      if (!claimRes.ok) throw new Error("Failed to fetch claim");
      const data = await claimRes.json();
      setClaim(data);

      if (user?._id) {
        const reactionRes = await fetch(`http://localhost:5050/api/reactions/user/claim/${id}/${user._id}`);
        if (reactionRes.ok) {
          const { reactionType } = await reactionRes.json();
          setUserReaction(reactionType || null);
        }
      }

      await fetchComments();
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`http://localhost:5050/api/comments/claim/${id}`);
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

  useEffect(() => {
    fetchClaim();
    fetchComments();
  }, [id]);

  const handleReaction = async (type) => {
    const newReaction = userReaction === type ? null : type;

    try {
      if (newReaction) {
        await fetch("http://localhost:5050/api/reactions", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user._id,
            targetId: id,
            targetType: "claim",
            reactionType: type,
          }),
        });
      } else {
        await fetch(`http://localhost:5050/api/reactions/claim/${id}/${user._id}`, {
          method: "DELETE",
        });
      }

      setUserReaction(newReaction);
      // Optional: re-fetch claim if you have reaction counts in claim
      const refreshed = await fetch(`http://localhost:5050/api/claims/${id}`);
      const updated = await refreshed.json();
      setClaim(updated);
    } catch (err) {
      console.error("Reaction error:", err);
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const commentPayload = {
      userId: user?._id,
      targetId: id,
      targetType: "claim",
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
      await fetchComments();
      setNewComment("");
    } catch (err) {
      console.error("Error submitting comment:", err);
    }
  };

  if (loading) {
    return (
      <LoadingScreen message="Loading claim..." />
    );
  }

  if (!claim) {
    return (
      <ErrorScreen title="Claim Not Found" message="The claim you're looking for doesn't exist." />
    );
  }

  return (
    <div className="min-h-screen bg-base-gradient py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{claim.claimTitle}</h1>
              <p className="text-gray-600 mb-2"> By{" "}
                <Link
                  to={`/profile/${claim.userId?._id}`}
                  className="font-medium hover:text-selected hover:underline"
                >
                  {claim.userId?.username}
                </Link>
              </p>
              <p className="text-gray-500 text-sm">{formatRelativeTime(claim.createdAt)}</p>
            </div>
            <div className={`px-4 py-2 rounded-lg border ${getTruthIndexColor(claim.aiTruthIndex)}`}>
              <span className="font-semibold">AI Truth Index: {claim.aiTruthIndex}%</span>
            </div>
          </div>

          {claim.aiClaimSummary && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">AI-Generated Summary</h3>
              <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
                <p className="text-gray-700">{claim.aiClaimSummary}</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Full Claim Details</h2>
          <div className="whitespace-pre-wrap text-gray-700 leading-relaxed break-words">{claim.claimContent}</div>
        </div>

        {claim.claimSources && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Claim Sources</h2>
            <div className="whitespace-pre-wrap text-gray-700 break-words">{claim.claimSources}</div>
          </div>
        )}

        {/* Action Buttons */}
        <ReactionBar
          likes={claim.reactionCounts?.like || 0}
          dislikes={claim.reactionCounts?.dislike || 0}
          isBookmarked={isBookmarked}
          userReaction={userReaction}
          onReact={handleReaction}
          onBookmark={handleBookmark}
          handleOpenModal={() => setShowCreateModal(true)}
        />


        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Comments ({comments.length})</h2>
          <form onSubmit={handleCommentSubmit} className="mb-6">
            <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" rows="3" placeholder="Share your thoughts..." />
            <button type="submit" className="mt-2 px-4 py-2 bg-dark text-white rounded-lg hover:bg-darker">Post Comment</button>
          </form>
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-gray-800">{comment.username}</span>
                  <span className="text-sm text-gray-500">{formatRelativeTime(comment.createdAt)}</span>
                </div>
                <p className="text-gray-700 mb-2">{comment.content}</p>
                <button className="text-sm text-gray-500 hover:text-blue-600">👍 {comment.likes}</button>
              </div>
            ))}
            {comments.length === 0 && <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>}
          </div>
        </div>

        {/* Admin: Create Report Modal */}
        <CreateReportModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} claimId={claim?._id}/>
      </div>
    </div>
  );
}
