import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { parseTruthVerdict } from "../utils/strings";

// Components
import { LoadingScreen, ErrorScreen, ReportCard, CreateReportModal, SearchBar } from '../components';

export default function Reports() {
  const { user, isLoggedIn } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("newest");


  // Check if user is an admin
  const isAdmin = isLoggedIn && user?.role === "admin";

  useEffect(() => {
    fetchReports();
  }, []);

  // Filter reports based on search query
useEffect(() => {
  let filtered = [...reports];

  // Keyword filter
  if (searchQuery.trim() !== "") {
    filtered = filtered.filter(report =>
      report.reportTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.aiReportSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.userId?.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.truthVerdictParsed.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Sorting/Filtering
  const now = new Date();
  switch (selectedFilter) {
    case "oldest":
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      break;
    case "today":
      filtered = filtered.filter(r => new Date(r.createdAt).toDateString() === now.toDateString());
      break;
    case "thisWeek":
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      filtered = filtered.filter(r => new Date(r.createdAt) > weekAgo);
      break;
    case "thisMonth":
      const monthAgo = new Date();
      monthAgo.setMonth(now.getMonth() - 1);
      filtered = filtered.filter(r => new Date(r.createdAt) > monthAgo);
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
    default: // newest
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  setFilteredReports(filtered);
}, [searchQuery, reports, selectedFilter]);


  const fetchReports = async () => {
    try {
      const response = await fetch("http://localhost:5050/api/reports");
      if (!response.ok) throw new Error("Failed to fetch reports");

      const data = await response.json();

      setReports(data);
      setFilteredReports(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled by useEffect above
  };

  const handleSubmitFinish = async (successType) => {
    await fetchReports();
    if (successType === 'reportSubmitted') {
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 4000);
    }
  };

  if (loading) {
    return (
      <LoadingScreen message="Loading reports..." />
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-base-gradient px-4 py-8">
      {/* Success Notification */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 animate-slide-in">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Report created successfully!</span>
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
        {/* Title and Admin Button Row */}
        <div className="relative mb-6">
          {/* Centered Title */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">All Reports</h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Browse through all fact-checking reports created by our expert team
            </p>
          </div>

          {/* Admin: Make A Report Button - Absolute positioned to top right */}
          {isAdmin && (
            <div className="absolute top-0 right-0">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-dark text-white font-semibold rounded-2xl shadow-lg hover:bg-[#1E275E80] transition-all duration-200 flex items-center gap-2 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Make A Report
              </button>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onSubmit={handleSearch}
          placeholder="Search reports by title, content, author, or verdict...."
        />

        {/*Filter */}
    <div className="flex justify-center items-center gap-4 mb-4">
      <label className="text-white text-sm font-medium">Sort by:</label>
      <select
        value={selectedFilter}
        onChange={(e) => setSelectedFilter(e.target.value)}
        className="px-4 py-2 rounded-lg bg-white text-dark border border-gray-300"
      >
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="today">Today</option>
        <option value="thisWeek">This Week</option>
        <option value="thisMonth">This Month</option>
        <option value="mostLiked">Most Liked</option>
        <option value="mostCommented">Most Commented</option>
        <option value="hottest">Hottest</option>
      </select>
    </div>

        {/* Results Counter */}
        <p className="text-gray-300 text-sm text-center">
          {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Reports Grid */}
      <div className="max-w-7xl mx-auto">
        {filteredReports.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-300 text-lg mb-4">No reports found</div>
            <p className="text-gray-400">Try adjusting your search terms</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-6 justify-center">
            {filteredReports.map((report) => (
              <ReportCard key={report.id} report={report} variant="detailed" />
            ))}
          </div>
        )}
      </div>

      {/* Admin: Create Report Modal */}
      <CreateReportModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSubmitFinish={handleSubmitFinish}/>
    </div>
  );
}
