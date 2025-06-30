import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // assumes auth context is available
import { getTruthIndexColor } from '../utils/colors';
import { formatRelativeTime } from '../utils/time.js';

// Components
import { LoadingScreen, ErrorScreen, ReactionBar, CreateReportModal, CommentsSection } from '../components';
import BookmarkModal from '../components/modals/BookmarkModal';

export default function ClaimDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userReaction, setUserReaction] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
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

        // Check bookmark status
        try {
          const bookmarkRes = await fetch(`http://localhost:5050/api/bookmarks/check/${user._id}/${id}/claim`);
          if (bookmarkRes.ok) {
            const bookmarkData = await bookmarkRes.json();
            setIsBookmarked(bookmarkData.isBookmarked);
          }
        } catch (err) {
          console.error('Error checking bookmark status:', err);
        }
      }
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaim();
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

  const handleBookmark = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    // If already bookmarked, remove it directly without modal
    if (isBookmarked) {
      try {
        const response = await fetch('http://localhost:5050/api/bookmarks', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user._id,
            targetId: id,
            targetType: 'claim',
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to remove bookmark');
        }

        setIsBookmarked(false);
      } catch (error) {
        console.error('Error removing bookmark:', error);
        // You could show a toast notification here for the error
      }
    } else {
      // If not bookmarked, open modal to select collection
      setShowBookmarkModal(true);
    }
  };

  const handleSaveBookmark = async ({ itemId, itemType, collectionId }) => {
    try {
      // Only handle adding bookmarks since removal is now handled directly
      const response = await fetch('http://localhost:5050/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user._id,
          targetId: itemId,
          targetType: itemType,
          collectionId: collectionId || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add bookmark');
      }

      setIsBookmarked(true);
    } catch (error) {
      console.error('Error saving bookmark:', error);
      throw error; // Re-throw to let modal handle the error
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
              <h1 className="text-3xl font-bold text-gray-800 mb-2 mr-2">{claim.claimTitle}</h1>
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


        {/* Comments Section */}
        <CommentsSection 
          targetId={claim?._id} 
          targetType="claim" 
        />

        {/* Researcher: Create Report Modal */}
        <CreateReportModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} claimId={claim?._id}/>

        {/* Bookmark Modal */}
        <BookmarkModal
          isOpen={showBookmarkModal}
          onClose={() => setShowBookmarkModal(false)}
          onSave={handleSaveBookmark}
          itemId={claim?._id}
          itemType="claim"
          itemTitle={claim?.claimTitle}
        />
      </div>
    </div>
  );
}
