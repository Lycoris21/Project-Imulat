import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Components
import { LoadingScreen, ErrorScreen, ClaimCard, SearchBar, SubmitClaimModal } from '../components';

export default function Claims() {
  const { user, isLoggedIn } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [claims, setClaims] = useState([]);
  const [filteredClaims, setFilteredClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("newest");

  useEffect(() => {
    fetchClaims();
  }, []);

  // Filter claims based on search query
useEffect(() => {
  setSearchLoading(true);
  
  // Add a small delay to show loading animation
  const timeoutId = setTimeout(() => {
    let filtered = [...claims];

    // Keyword-based filtering
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(claim =>
        claim.claimTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.claimContent.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.userId?.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.aiClaimSummary.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

  // Sorting and filters
  const now = new Date();
  switch (selectedFilter) {
    case "oldest":
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      break;
    case "today":
      filtered = filtered.filter(c => new Date(c.createdAt).toDateString() === now.toDateString());
      break;
    case "thisWeek":
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      filtered = filtered.filter(c => new Date(c.createdAt) > oneWeekAgo);
      break;
    case "thisMonth":
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(now.getMonth() - 1);
      filtered = filtered.filter(c => new Date(c.createdAt) > oneMonthAgo);
      break;
    case "mostLiked":
      filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      break;
    case "mostCommented":
      filtered.sort((a, b) => (b.commentCount || 0) - (a.commentCount || 0));
      break;
    case "hottest":
      filtered.sort((a, b) =>
        ((b.likes || 0) + (b.commentCount || 0)) -
        ((a.likes || 0) + (a.commentCount || 0))
      );
      break;
    case "highestTruth":
      filtered.sort((a, b) => (b.aiTruthIndex || 0) - (a.aiTruthIndex || 0));
      break;
    default: // newest
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

    setFilteredClaims(filtered);
    setSearchLoading(false);
  }, 300); // 300ms delay to show loading animation
  
  return () => clearTimeout(timeoutId);
}, [searchQuery, claims, selectedFilter]);


  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled by useEffect above
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

  const handleSubmitFinish = async (successType) => {
    await fetchClaims();
    if (successType === 'claimSubmitted') {
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 4000);
    }
  };

  if (loading) {
    return (
      <LoadingScreen message="Loading claims..." />
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[linear-gradient(to_bottom,_#4B548B_0%,_#2F3558_75%,_#141625_100%)] px-4 py-8">
      {/* Success Notification */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 animate-slide-in">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Claim submitted successfully!</span>
          <button 
            onClick={() => setShowSuccessMessage(false)}
            className="ml-2 text-green-200 hover:text-white"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

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
                className="px-6 py-3 bg-dark text-white font-semibold rounded-2xl shadow-lg hover:bg-[#1E275E80] transition-all duration-200 flex items-center gap-2 cursor-pointer"
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
        <SearchBar
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onSubmit={handleSearch}
          placeholder="Search claims by title, content, author, or summary..."
          isLoading={searchLoading}
        />
<div className="flex justify-center items-center gap-4 mb-4 ">
  <label className="text-white text-sm font-medium ">Sort by:</label>
  <select
    value={selectedFilter}
    onChange={(e) => setSelectedFilter(e.target.value)}
    className="px-4 py-2 rounded-lg bg-white text-dark border border-gray-300 cursor-pointer"
  >
    <option value="newest">Newest</option>
    <option value="oldest">Oldest</option>
    <option value="today">Today</option>
    <option value="thisWeek">This Week</option>
    <option value="thisMonth">This Month</option>
    <option value="mostLiked">Most Liked</option>
    <option value="mostCommented">Most Commented</option>
    <option value="hottest">Hottest</option>
    <option value="highestTruth">Highest Truth Index</option>
  </select>
</div>

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
              <ClaimCard key={claim._id} claim={claim} variant="detailed" />
            ))}
          </div>
        )}
      </div>

       <SubmitClaimModal isOpen={showSubmitModal} onClose={() => setShowSubmitModal(false)} onSubmitFinish={handleSubmitFinish}/>
    </div>
  );
}
