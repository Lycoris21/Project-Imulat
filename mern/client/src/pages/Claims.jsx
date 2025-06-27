import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Components
import { LoadingScreen, ErrorScreen, ClaimCard } from '../components';

export default function Claims() {
  const { user, isLoggedIn } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [claims, setClaims] = useState([]);
  const [filteredClaims, setFilteredClaims] = useState([]);  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Form state for submit claim modal
  const [claimFormData, setClaimFormData] = useState({
    claimTitle: "",
    claimContent: "",
    sources: ""
  });

  // Check if user is an admin
  const isAdmin = isLoggedIn && user?.role === "admin";

  useEffect(() => {
    fetchClaims();
  }, []);

  // Filter claims based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredClaims(claims);
    } else {
      const filtered = claims.filter(claim =>
        claim.claimTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.claimContent.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.userId?.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.aiClaimSummary.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredClaims(filtered);
    }
  }, [searchQuery, claims]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled by useEffect above
  };
  // Handle claim form input changes
  const handleClaimInputChange = (e) => {
    const { name, value } = e.target;
    setClaimFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle claim submission
  const handleSubmitClaim = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        userId: user._id,
        claimTitle: claimFormData.claimTitle,
        claimContent: claimFormData.claimContent,
        sources: claimFormData.sources
      };

      const response = await fetch("http://localhost:5050/api/claims", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create claim");
      }

      // Clear form and close modal
      setClaimFormData({
        claimTitle: "",
        claimContent: "",
        sources: "",
      });
      setShowSubmitModal(false);
      alert("Claim submitted successfully!");

      fetchClaims();
    } catch (error) {
      console.error("Error submitting claim:", error);
      alert(error.message || "Error submitting claim. Please try again.");
    }
  };

  const fetchClaims = async () => {
      try {
        const response = await fetch("http://localhost:5050/api/claims");
        const data = await response.json();
        // Sort by creation date
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setClaims(data);
        setFilteredClaims(data);
      } catch (error) {
        console.error("Failed to fetch claims:", error);
      } finally {
        setLoading(false);
      }
    };

  // Close claim modal and reset form
  const handleCloseClaimModal = () => {
    setShowSubmitModal(false);
    setClaimFormData({
      claimTitle: "",
      claimContent: "",
      sources: ""
    });
  };
  // Handle ESC key press to close modals
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && showSubmitModal) {
        handleCloseClaimModal();
      }
    };

    // Add event listener when modal is open
    if (showSubmitModal) {
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
  }, [showSubmitModal]);

  if (loading) {
    return (
      <LoadingScreen message="Loading claims..."/>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[linear-gradient(to_bottom,_#4B548B_0%,_#2F3558_75%,_#141625_100%)] px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        {/* Title and Buttons Row */}
        <div className="relative mb-6">
          {/* Centered Title */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">All Claims</h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Browse through all user-submitted claims for fact-checking
            </p>
          </div>
          
          {/* Buttons - Absolute positioned to top right */}
          <div className="absolute top-0 right-0 flex gap-3">
            {/* Submit Claim Button - Available to all users */}
            {isLoggedIn && (
              <button
                onClick={() => setShowSubmitModal(true)}
                className="px-6 py-3 bg-dark text-white font-semibold rounded-2xl shadow-lg hover:bg-[#1E275E80] transition-all duration-200 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Submit A Claim
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-4">
          <div className="relative flex">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={(e) => e.target.select()}
              onClick={(e) => e.target.select()}
              placeholder="Search claims by title, content, author, or summary..."
              className="w-full px-6 py-4 text-lg rounded-l-2xl text-white border border-gray-300 focus:ring-2 focus:ring-dark focus:outline-none"
            />
            <button
              type="submit"
              className="px-8 py-4 bg-white border border-l-0 border-gray-300 text-dark font-semibold rounded-r-2xl hover:bg-gray-50 transition"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </form>

        {/* Results Counter */}
        <p className="text-gray-300 text-sm text-center">
          {filteredClaims.length} claim{filteredClaims.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Claims Grid */}
      <div className="max-w-7xl mx-auto">
        {filteredClaims.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-300 text-lg mb-4">No claims found</div>
            <p className="text-gray-400">Try adjusting your search terms</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-6 justify-center">
            {filteredClaims.map((claim) => (
                <ClaimCard key = {claim._id} claim={claim} variant="detailed"/>
            ))}
          </div>
        )}
      </div>

      {/* Submit Claim Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header - Fixed */}
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Submit New Claim</h2>
                <button
                  onClick={handleCloseClaimModal}
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
                <form id="claim-form" onSubmit={handleSubmitClaim} className="space-y-4">
                  {/* Claim Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Claim Title
                    </label>
                    <input
                      type="text"
                      name="claimTitle"
                      value={claimFormData.claimTitle}
                      onChange={handleClaimInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      placeholder="Enter claim title..."
                    />
                  </div>

                  {/* Claim Content */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Claim Content
                    </label>
                    <textarea
                      name="claimContent"
                      value={claimFormData.claimContent}
                      onChange={handleClaimInputChange}
                      required
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none resize-vertical"
                      placeholder="Enter detailed claim content..."
                    />
                  </div>

                  {/* Sources */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sources (Optional)
                    </label>
                    <textarea
                      name="sources"
                      value={claimFormData.sources}
                      onChange={handleClaimInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none resize-vertical"
                      placeholder="Enter sources and references (URLs, citations, etc.)..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Optional: Provide sources to support your claim
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
                  onClick={handleCloseClaimModal}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="claim-form"
                  className="px-6 py-2 bg-base text-white rounded-lg hover:bg-dark transition-colors flex-1"
                >
                  Submit Claim
                </button>
              </div>
            </div>
          </div>        
        </div>
      )}
    </div>
  );
}
