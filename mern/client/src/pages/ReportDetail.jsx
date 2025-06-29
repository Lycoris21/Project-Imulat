import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { parseTruthVerdict } from "../utils/strings";
import { useAuth } from "../context/AuthContext";
import { formatRelativeTime } from '../utils/time.js';
import { getVerdictColor } from '../utils/colors.js';

// Components
import { LoadingScreen, ErrorScreen, ReactionBar, CommentsSection } from '../components'
import BookmarkModal from '../components/modals/BookmarkModal';

export default function ReportDetail() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userReaction, setUserReaction] = useState(null); // 'like', 'dislike', or null
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);

      try {
        // Fetch report first
        const reportRes = await fetch(`http://localhost:5050/api/reports/${id}`);
        if (!reportRes.ok) throw new Error("Failed to fetch report");
        const reportData = await reportRes.json();
        setReport(reportData);

        // Check bookmark status if user is logged in
        if (user?._id) {
          try {
            const bookmarkRes = await fetch(`http://localhost:5050/api/bookmarks/check/${user._id}/${id}/report`);
            if (bookmarkRes.ok) {
              const bookmarkData = await bookmarkRes.json();
              setIsBookmarked(bookmarkData.isBookmarked);
            }
          } catch (err) {
            console.error('Error checking bookmark status:', err);
          }
        }

        // Fetch user reaction (only if logged in)
        if (user?._id) {
          const reactionRes = await fetch(`http://localhost:5050/api/reactions/user/report/${id}/${user._id}`);
          if (reactionRes.ok) {
            const reactionData = await reactionRes.json();
            setUserReaction(reactionData?.reactionType || null);
          } else {
            setUserReaction(null);
          }
        } else {
          setUserReaction(null);
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setReport(null);
      } finally {
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

      // Update user reaction state immediately
      setUserReaction(newReaction);

      // Refetch fresh reaction counts
      const countsRes = await fetch(`http://localhost:5050/api/reactions/counts/report/${id}`);
      const counts = await countsRes.json();

      // Apply updated counts to report state
      setReport((prev) => ({
        ...prev,
        reactionCounts: counts,
      }));
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
            targetType: 'report',
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
              <h1 className="text-3xl font-bold text-gray-800 mb-2 mr-2">{report.reportTitle}</h1>
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
          isBookmarked={isBookmarked}
          userReaction={userReaction}
          onReact={handleReaction} // or "Report"
          onBookmark={handleBookmark}
        />

        {/* Comments Section */}
        <CommentsSection 
          targetId={report?._id} 
          targetType="report" 
        />
      </div>

      {/* Bookmark Modal */}
      <BookmarkModal
        isOpen={showBookmarkModal}
        onClose={() => setShowBookmarkModal(false)}
        onSave={handleSaveBookmark}
        itemId={report?._id}
        itemType="report"
        itemTitle={report?.title}
      />
    </div>
  );
}
