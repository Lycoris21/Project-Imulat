import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { parseTruthVerdict } from "../utils/strings";

// Components
import { LoadingScreen, ErrorScreen, ReportCard, CreateReportModal, SearchBar } from '../components';

export default function Reports() {
  const { user, isLoggedIn } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState(""); // The actual search query used for fetching
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalReports, setTotalReports] = useState(0);
  const itemsPerPage = 6; // Number of items per page. Change this and backend pagination will handle it automatically


  // Check if user is a researcher
 const canResearch = isLoggedIn && (user?.role === "admin" || user?.role === "researcher");

  // Effect for handling filter changes (reset to page 1)
  useEffect(() => {
    setCurrentPage(1);
  }, [activeSearchQuery, selectedFilter]);

  // Effect for fetching data when page, active search, or filter changes
  useEffect(() => {
    fetchReports();
  }, [currentPage, selectedFilter, activeSearchQuery]);


  const fetchReports = async () => {
    try {
      setLoading(currentPage === 1); // Only show loading spinner on first page
      setSearchLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sort: selectedFilter
      });
      
      if (activeSearchQuery.trim()) {
        params.append('search', activeSearchQuery.trim());
      }
      
      const response = await fetch(`http://localhost:5050/api/reports?${params}`);
      if (!response.ok) throw new Error("Failed to fetch reports");

      const data = await response.json();
      
      setReports(data.reports || data); // Handle both paginated and non-paginated responses
      setTotalReports(data.total || data.length || 0);
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setActiveSearchQuery(searchQuery);
    setCurrentPage(1);
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

  // Pagination calculations
  const totalPages = Math.ceil(totalReports / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Pagination component
  const PaginationControls = () => {
    if (totalPages <= 1) return null;

    const getVisiblePages = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];

      for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
        range.push(i);
      }

      if (currentPage - delta > 2) {
        rangeWithDots.push(1, '...');
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (currentPage + delta < totalPages - 1) {
        rangeWithDots.push('...', totalPages);
      } else {
        rangeWithDots.push(totalPages);
      }

      return rangeWithDots;
    };

    return (
      <div className="flex justify-center items-center space-x-0.5">
        {/* Previous button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2 py-1 rounded-md bg-white text-[color:var(--color-dark)] border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-medium"
        >
          Previous
        </button>

        {/* Page numbers */}
        <div className="flex space-x-0.5 mx-1">
          {getVisiblePages().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && handlePageChange(page)}
              disabled={page === '...'}
              className={`px-2 py-1 rounded-md transition-colors text-xs font-medium min-w-[28px] ${
                page === currentPage
                  ? 'bg-[color:var(--color-dark)] text-white shadow-sm'
                  : page === '...'
                  ? 'bg-transparent text-gray-400 cursor-default'
                  : 'bg-white text-[color:var(--color-dark)] border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Next button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-2 py-1 rounded-md bg-white text-[color:var(--color-dark)] border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-medium"
        >
          Next
        </button>
      </div>
    );
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
        {/* Title and Researcher Button Row */}
        <div className="relative mb-6">
          {/* Centered Title */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">All Reports</h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Browse through all fact-checking reports created by our expert team
            </p>
          </div>

          {/* Reseracher: Make A Report Button - Absolute positioned to top right */}
          {canResearch && (
            <div className="absolute top-0 right-0">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-[color:var(--color-dark)] text-white font-semibold rounded-2xl shadow-lg hover:bg-[#1E275E80] transition-all duration-200 flex items-center gap-2 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Make A Report
              </button>
            </div>
          )}
        </div>

        {/* Search and Controls */}
        <div className="max-w-6xl mx-auto mb-6">
          {/* Search Bar */}
          <div className="mb-4">
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onSubmit={handleSearch}
              placeholder="Search reports by title, content, author, or verdict...."
              isLoading={searchLoading}
            />
          </div>
          
          {/* Sort and Pagination Controls Row */}
          <div className="max-w-2xl mx-auto mb-4 relative">
            <div className="flex justify-between items-center">
              {/* Sort Dropdown - Left side */}
              <div className="flex items-center gap-2">
                <span className="text-white text-xs font-medium">Sort by:</span>
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="px-2 py-1 rounded-md bg-white text-[color:var(--color-dark)] border border-gray-300 cursor-pointer text-xs min-w-[120px]"
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

              {/* Pagination Controls - Right side */}
              {reports.length > 0 && totalPages > 1 && <PaginationControls />}
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="text-center mb-6">
          <p className="text-gray-300 text-sm">
            {totalReports} report{totalReports !== 1 ? 's' : ''} found
            {totalPages > 1 && (
              <span className="ml-2 text-gray-400">
                • Page {currentPage} of {totalPages}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="max-w-7xl mx-auto">
        {reports.length === 0 && !loading ? (
          <div className="text-center py-12">
            <div className="text-gray-300 text-lg mb-4">No reports found</div>
            <p className="text-gray-400">Try adjusting your search terms</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-6 justify-center">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} variant="detailed" />
            ))}
          </div>
        )}

        {/* Bottom Pagination Controls */}
        {reports.length > 0 && totalPages > 1 && (
          <div className="mt-12">
            <PaginationControls />
          </div>
        )}
      </div>

      {/* Researcher: Create Report Modal */}
      <CreateReportModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSubmitFinish={handleSubmitFinish}/>
    </div>
  );
}
