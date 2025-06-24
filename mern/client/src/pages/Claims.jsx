import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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

  // Mock data - replace with actual API calls later
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockClaims = Array.from({ length: 25 }, (_, i) => {
        let date;
        // Create varied dates for demonstration
        const daysAgo = Math.floor(Math.random() * 90); // Random days within last 90 days
        date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
        
        return {
          id: i + 1,
          claimTitle: `${
            i % 6 === 0 ? "Breaking: New COVID-19 Variant Discovered" :
            i % 6 === 1 ? "Economic Recession Expected by 2025" :
            i % 6 === 2 ? "Climate Change Causes Increase in Natural Disasters" :
            i % 6 === 3 ? "Social Media Platform Implements New Privacy Policy" :
            i % 6 === 4 ? "Artificial Intelligence Breakthrough in Medical Research" :
            "Government Announces New Education Reform Initiative"
          } - Claim ${i + 1}`,
          claimContent: `This claim discusses important developments and their potential impact on society. The information presented here requires fact-checking and verification from reliable sources. Claim ${i + 1} provides detailed analysis of the situation.`,
          aiTruthIndex: Math.floor(Math.random() * 101), // 0-100
          userUsername: `User_${Math.floor(Math.random() * 1000)}`,
          aiClaimSummary: `AI-generated summary: This claim examines recent developments and their implications. The analysis suggests various perspectives should be considered when evaluating the accuracy of the presented information.`,
          createdAt: date,
          likes: Math.floor(Math.random() * 200) + 5,
          dislikes: Math.floor(Math.random() * 50) + 1,
          commentCount: Math.floor(Math.random() * 80) + 3,
          hasReport: Math.random() > 0.7, // 30% chance of having an associated report
          sources: i % 3 === 0 ? "https://example.com/source1, https://example.com/source2" : null
        };
      });

      // Sort by date, latest first
      mockClaims.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setClaims(mockClaims);
      setFilteredClaims(mockClaims);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter claims based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredClaims(claims);
    } else {
      const filtered = claims.filter(claim =>
        claim.claimTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.claimContent.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.userUsername.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
      console.log("Submitting claim:", claimFormData);
      
      // Reset form and close modal
      setClaimFormData({
        claimTitle: "",
        claimContent: "",
        sources: ""
      });
      setShowSubmitModal(false);
      
      // You would typically refetch the claims here
      alert("Claim submitted successfully!");
    } catch (error) {
      console.error("Error submitting claim:", error);
      alert("Error submitting claim. Please try again.");
    }  };

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

  const getTruthIndexColor = (index) => {
    if (index >= 80) return "text-green-600 bg-green-100";
    if (index >= 60) return "text-yellow-600 bg-yellow-100";
    if (index >= 40) return "text-orange-600 bg-orange-100";
    return "text-red-600 bg-red-100";
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

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-5rem)] bg-[linear-gradient(to_bottom,_#4B548B_0%,_#2F3558_75%,_#141625_100%)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading claims...</p>
        </div>
      </div>
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
                className="px-6 py-3 bg-[#1E275E] text-white font-semibold rounded-2xl shadow-lg hover:bg-[#1E275E80] transition-all duration-200 flex items-center gap-2"
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
              className="w-full px-6 py-4 text-lg rounded-l-2xl text-white border border-gray-300 focus:ring-2 focus:ring-[#1E275E] focus:outline-none"
            />
            <button
              type="submit"
              className="px-8 py-4 bg-white border border-l-0 border-gray-300 text-[#1E275E] font-semibold rounded-r-2xl hover:bg-gray-50 transition"
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
              <div
                key={claim.id}
                className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 w-full sm:w-80 md:w-96 relative"
              >
                <Link
                  to={`/claims/${claim.id}`}
                  className="block"
                >
                  {/* Content */}
                  <div className="p-6">
                    {/* Header with Truth Index */}
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-gray-800 text-lg leading-tight hover:text-blue-600 transition-colors flex-1 mr-3 line-clamp-2">
                        {claim.claimTitle}
                      </h3>
                      <span className={`px-3 py-1 rounded text-xs font-medium flex-shrink-0 ${getTruthIndexColor(claim.aiTruthIndex)}`}>
                       AI Truth Index: {claim.aiTruthIndex}%
                      </span>
                    </div>

                    {/* AI Summary */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      <span className="font-medium">AI-generated summary:</span> {claim.aiClaimSummary}
                    </p>

                    {/* Author & Status */}
                    <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
                      <span>By <span className="font-medium">{claim.userUsername}</span></span>                      <div className="flex items-center gap-2">
                        {claim.hasReport && (
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                            Report Available
                          </span>
                        )}
                        {claim.sources && (
                          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">
                            Sources provided
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stats & Date */}
                    <div className="flex justify-between items-center text-xs text-gray-500 pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-4">
                        {/* Likes */}
                        <span className="flex items-center space-x-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                          </svg>
                          <span>{claim.likes}</span>
                        </span>
                        
                        {/* Dislikes */}
                        <span className="flex items-center space-x-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" transform="rotate(180)">
                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                          </svg>
                          <span>{claim.dislikes}</span>
                        </span>
                        
                        {/* Comments */}
                        <span className="flex items-center space-x-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                          </svg>
                          <span>{claim.commentCount}</span>
                        </span>
                      </div>
                      
                      {/* Date */}
                      <span className="italic">{formatRelativeTime(claim.createdAt)}</span>
                    </div>
                  </div>                </Link>
              </div>
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
                  className="px-6 py-2 bg-[#4B548B] text-white rounded-lg hover:bg-[#1E275E] transition-colors flex-1"
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
