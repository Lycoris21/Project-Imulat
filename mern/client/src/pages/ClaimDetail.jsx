import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // assumes auth context is available
import { getTruthIndexColor } from '../utils/colors';
import { formatRelativeTime } from '../utils/time.js';

// Components
import { LoadingScreen, ErrorScreen, ReactionBar } from '../components';

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
      const response = await fetch(`http://localhost:5050/api/claims/${id}`);
      if (!response.ok) throw new Error("Failed to fetch claim");
      const data = await response.json();
      setClaim(data);
    } catch (err) {
      console.error("Error fetching claim:", err);
      setClaim(null);
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

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && showCreateModal) {
        handleCloseModal();
      }
    };

    // Add event listener when modal is open
    if (showCreateModal) {
      document.addEventListener('keydown', handleEscKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    // Cleanup function
    return () => {
      document.removeEventListener('keydown', handleEscKey);
      // Restore body scroll when modal is closed
      document.body.style.overflow = 'unset';
    };
  }, [showCreateModal]);

  const handleReaction = (type) => {
    setUserReaction(userReaction === type ? null : type);
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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      reportCoverFile: file
    }));
  };

  // Handle form submission
  const handleSubmitReport = async (e) => {
    e.preventDefault();

    try {
      let uploadedCoverUrl = null;

      if (formData.reportCoverFile) {
        const uploadData = new FormData();
        uploadData.append("image", formData.reportCoverFile);

        const uploadRes = await fetch("http://localhost:5050/api/uploads/report-cover", {
          method: "POST",
          body: uploadData
        });

        if (!uploadRes.ok) throw new Error("Failed to upload cover image");
        const uploadResult = await uploadRes.json();
        uploadedCoverUrl = uploadResult.url;
      }

      const payload = {
        userId: user._id,
        claimIds: [id], // Use current claim ID
        reportTitle: formData.reportTitle,
        reportContent: formData.reportContent,
        truthVerdict: formData.truthVerdict,
        reportConclusion: formData.reportConclusion,
        reportReferences: formData.references,
        reportCoverUrl: uploadedCoverUrl
      };

      const response = await fetch("http://localhost:5050/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create report");
      }

      // Clear form and close modal
      setFormData({
        reportTitle: "",
        reportContent: "",
        truthVerdict: "",
        reportConclusion: "",
        references: "",
        claimId: id,
        reportCoverFile: null
      });
      setShowCreateModal(false);
      alert("Report created successfully!");
    } catch (error) {
      console.error("Error creating report:", error);
      alert(error.message || "Error creating report. Please try again.");
    }
  };

  // Close modal and reset form
  const handleCloseModal = () => {
    setShowCreateModal(false);
    setFormData({
      reportTitle: "",
      reportContent: "",
      truthVerdict: "",
      reportConclusion: "",
      references: "",
      claimId: id,
      reportCoverFile: null
    });
  };

  // Open modal and pre-fill claim ID
  const handleOpenModal = () => {
    setFormData({
      reportTitle: "",
      reportContent: "",
      truthVerdict: "",
      reportConclusion: "",
      references: "",
      claimId: id,
      reportCoverFile: null
    });
    setShowCreateModal(true);
  };

  if (loading) {
    return (
      <LoadingScreen message="Loading claim..."/>
    );
  }

  if (!claim) {
    return (
      <ErrorScreen title="Claim Not Found" message="The claim you're looking for doesn't exist."/>
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
        <ReactionBar handleOpenModal = { handleOpenModal }/>

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
        {showCreateModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
              {/* Modal Header - Fixed */}
              <div className="p-6 border-b border-gray-200 flex-shrink-0">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-800">Create Report for This Claim</h2>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Content - Scrollable */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                  {/* Modal Form */}
                  <form id="report-form" onSubmit={handleSubmitReport} className="space-y-4">
                    {/* Report Cover Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Report Cover Image
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-400 bg-white flex items-center">
                          <span className="text-gray-600">Choose File</span>
                          <span className="mx-2 text-gray-300">|</span>
                          <span className={`${formData.reportCoverFile ? 'text-gray-500' : 'text-gray-400'} flex-1 truncate`}>
                            {formData.reportCoverFile ? formData.reportCoverFile.name : 'No file chosen'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Report Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Report Title
                      </label>
                      <input
                        type="text"
                        name="reportTitle"
                        value={formData.reportTitle}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        placeholder="Enter report title..."
                      />
                    </div>

                    {/* Report Content */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Report Content
                      </label>
                      <textarea
                        name="reportContent"
                        value={formData.reportContent}
                        onChange={handleInputChange}
                        required
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none resize-vertical"
                        placeholder="Enter detailed report content..."
                      />
                    </div>

                    {/* Truth Verdict Dropdown */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Truth Verdict
                      </label>
                      <select
                        name="truthVerdict"
                        value={formData.truthVerdict}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none ${
                          formData.truthVerdict === '' ? 'text-gray-400' : 'text-gray-900'
                        }`}
                      >
                        <option value="" disabled className="text-gray-400">Select a verdict...</option>
                        <option value="unverified" className="text-gray-900">Unverified - Lacks sufficient evidence for verification</option>
                        <option value="true" className="text-gray-900">True - Completely accurate and supported by evidence</option>
                        <option value="false" className="text-gray-900">False - Completely inaccurate or fabricated</option>
                        <option value="partially_true" className="text-gray-900">Partially True - Contains some truth but missing context</option>
                        <option value="misleading" className="text-gray-900">Misleading - Technically accurate but deceptive in context</option>
                        <option value="disputed" className="text-gray-900">Disputed - Credible sources disagree on the facts</option>
                        <option value="debunked" className="text-gray-900">Debunked - Previously proven false with clear evidence</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Choose the verdict that best represents the factual accuracy of the claim
                      </p>
                    </div>

                    {/* Report Conclusion */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Report Conclusion
                      </label>
                      <textarea
                        name="reportConclusion"
                        value={formData.reportConclusion}
                        onChange={handleInputChange}
                        required
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none resize-vertical"
                        placeholder="Enter report conclusion..."
                      />
                    </div>

                    {/* References */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        References
                      </label>
                      <textarea
                        name="references"
                        value={formData.references}
                        onChange={handleInputChange}
                        required
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none resize-vertical"
                        placeholder="Enter references and sources..."
                      />
                    </div>

                    {/* Claim ID (Pre-filled and disabled) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Claim ID (Linked to Current Claim)
                      </label>
                      <input
                        type="text"
                        name="claimId"
                        value={formData.claimId}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                        placeholder="Claim ID will be auto-filled..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        This report will be automatically linked to the current claim
                      </p>
                    </div>
                  </form>
                </div>
              </div>

              {/* Modal Actions - Fixed */}
              <div className="p-6 border-t border-gray-200 flex-shrink-0">
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="report-form"
                    className="px-6 py-2 bg-base text-white rounded-lg hover:bg-dark transition-colors flex-1"
                  >
                    Submit Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
