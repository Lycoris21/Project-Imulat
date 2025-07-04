import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // assumes auth context is available
import { getTruthIndexColor } from '../utils/colors';
import { formatRelativeTime } from '../utils/time.js';

// Components
import { LoadingScreen, ErrorScreen, ReactionBar, CreateReportModal, CommentsSection, SuccessToast, SubmitClaimModal } from '../components';
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [deleting, setDeleting] = useState(false);
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
          const reaction = await reactionRes.json();
          setUserReaction(reaction?.reactionType || null);
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
  }, [id, user?._id]);

  // Handle ESC key press and disable background scroll when delete modal is open
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && showDeleteConfirm && !deleting) {
        setShowDeleteConfirm(false);
      }
    };

    if (showDeleteConfirm) {
      // Add ESC key listener
      document.addEventListener('keydown', handleEscapeKey);

      // Disable background scroll
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleEscapeKey);
        document.body.style.overflow = 'unset';
      };
    }
  }, [showDeleteConfirm, deleting]);

  const location = useLocation();

  useEffect(() => {
    if (!location.hash.startsWith('#comment-')) return;

    const commentId = location.hash.replace('#comment-', '');

    // Wait for comments to be loaded in the DOM
    const scrollToComment = () => {
      const el = document.getElementById(`comment-${commentId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring', 'ring-blue-500', 'ring-offset-2', 'transition');

        // Optional: remove highlight after a few seconds
        setTimeout(() => {
          el.classList.remove('ring', 'ring-blue-500', 'ring-offset-2');
        }, 3000);
      }
    };

    // Small delay to wait for DOM
    setTimeout(scrollToComment, 200);
  }, [location.hash]);

  const handleSubmitFinish = async (successType) => {
    fetchClaim();
    if (successType === "claimUpdated") {
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 4000);
    }
  };

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

  const handleDeleteClaim = async () => {
    if (!user || (user._id !== claim.userId?._id && user.role !== 'admin')) {
      alert('You do not have permission to delete this claim');
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`http://localhost:5050/api/claims/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user._id,
          userRole: user.role
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete claim');
      }

      // Navigate back to claims page after successful deletion
      navigate('/claims');
    } catch (error) {
      console.error('Error deleting claim:', error);
      alert('Failed to delete claim: ' + error.message);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Check if user can delete the claim
  const canDeleteClaim = user && (user._id === claim?.userId?._id || user.role === 'admin');

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
    <div className="min-h-[calc(100vh-5rem)] bg-base-gradient py-8">
      <SuccessToast
        message="Claim updated successfully!"
        visible={showSuccessMessage}
        onClose={() => setShowSuccessMessage(false)}
      />

      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2 mr-2">{claim.claimTitle}</h1>
              <p className="text-gray-600 mb-2"> By{" "}
                <Link
                  to={`/profile/${claim.userId?._id}`}
                  className="font-medium hover:text-[color:var(--color-selected)] hover:underline"
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
          canDelete={canDeleteClaim}
          onDelete={() => setShowDeleteConfirm(true)}
          canEdit={user._id !== claim.userId?._id || user.role == "admin"}
          onEdit={() => setShowEditModal(true)}
          pageType="claim"
        />

        {/* Comments Section */}
        <CommentsSection
          targetId={claim?._id}
          targetType="claim"
        />

        {/* Researcher: Create Report Modal */}
        <CreateReportModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} claimId={claim?._id} />

        {/* Edit Modal */}
        <SubmitClaimModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          claim={claim}
          onSubmitFinish={handleSubmitFinish}
        />

        {/* Bookmark Modal */}
        <BookmarkModal
          isOpen={showBookmarkModal}
          onClose={() => setShowBookmarkModal(false)}
          onSave={handleSaveBookmark}
          itemId={claim?._id}
          itemType="claim"
          itemTitle={claim?.claimTitle}
        />

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-[#00000080] bg-opacity-50"
              onClick={() => !deleting && setShowDeleteConfirm(false)}
            ></div>

            {/* Modal */}
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-auto relative z-10">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Deletion</h3>
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete this claim? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="px-4 py-2 bg-gray-200 rounded-lg text-gray-800 hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteClaim}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 rounded-lg text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {deleting && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {deleting ? 'Deleting...' : 'Delete Claim'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
