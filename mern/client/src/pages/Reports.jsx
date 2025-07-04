// Reports.jsx (refactored to use useQueryParams)
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import useQueryParams from "../hooks/useQueryParams";
import { parseTruthVerdict } from "../utils/strings";
import {
  LoadingScreen,
  ReportCard,
  CreateReportModal,
  SearchBar,
  SuccessToast,
  PaginationControls,
} from "../components";

export default function Reports() {
  const { user, isLoggedIn } = useAuth();
  const { search, sort, page, user: queryUser , updateParams } = useQueryParams();

  const [searchQuery, setSearchQuery] = useState(search);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [totalReports, setTotalReports] = useState(0);

  const itemsPerPage = 6;
  const canResearch = isLoggedIn && (user?.role === "admin" || user?.role === "researcher");

  useEffect(() => {
    fetchReports();
  }, [search, sort, page, queryUser ]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setSearchLoading(true);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        sort,
      });
      if (search.trim()) params.append("search", search.trim());
      if (queryUser ?.trim()) params.append("user", queryUser .trim());

      const response = await fetch(`http://localhost:5050/api/reports?${params}`);
      if (!response.ok) throw new Error("Failed to fetch reports");

      const data = await response.json();
      setReports(data.reports || data);
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
    updateParams({ search: searchQuery.trim(), page: 1, sort });
  };

  const handlePageChange = (newPage) => {
    updateParams({ page: newPage, search, sort });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmitFinish = async (successType) => {
    await fetchReports();
    if (successType === "reportSubmitted") {
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 4000);
    }
  };

  const totalPages = Math.ceil(totalReports / itemsPerPage);

  if (loading) return <LoadingScreen message="Loading reports..." />;

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-base-gradient px-2 sm:px-4 py-4 sm:py-8">
      {/* Success Notification */}
      <SuccessToast 
        message="Report created successfully!" 
        visible={showSuccessMessage} 
        onClose={() => setShowSuccessMessage(false)} 
      />

      <div className="mb-6 sm:mb-8">
        <div className="relative mb-4 sm:mb-6 text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-4">All Reports</h1>
          <p className="text-gray-300 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto px-2">
            Browse through all fact-checking reports created by our expert team
          </p>
          {canResearch && (
            <div className="absolute top-0 right-0 hidden sm:block">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-3 py-2 sm:px-4 sm:py-2 md:px-6 md:py-3 bg-[color:var(--color-dark)] text-white border border-gray-400 font-semibold rounded-2xl shadow-lg hover:bg-[#1E275E80] transition-all duration-200 flex items-center gap-1 sm:gap-2 cursor-pointer text-sm sm:text-base"
              >
                {/* Plus icon - always visible */}
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {/* Full text on larger screens, abbreviated on mobile */}
                <span className="hidden sm:inline">Make A Report</span>
                <span className="sm:hidden">Report</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile "Make A Report" button */}
        {canResearch && (
          <div className="block sm:hidden mb-4 max-w-2xl mx-auto px-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full px-3 py-3 bg-[color:var(--color-dark)] text-white border border-gray-400 font-semibold rounded-2xl shadow-lg hover:bg-[#1E275E80] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer text-base"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Make A Report
            </button>
          </div>
        )}

        <div className="max-w-6xl mx-auto mb-4 sm:mb-6">
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onSubmit={handleSearch}
            placeholder="Search reports by title, content, author, or verdict..."
            isLoading={searchLoading}
          />

          <div className="max-w-2xl mx-auto mb-4 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
            <div className="flex items-center gap-2 order-2 sm:order-1">
              <span className="text-white text-xs sm:text-sm font-medium">Sort by:</span>
              <select
                value={sort}
                onChange={(e) => updateParams({ sort: e.target.value, page: 1, search })}
                className="px-2 py-1 sm:px-3 sm:py-1 rounded-md bg-white text-[color:var(--color-dark)] border border-gray-300 cursor-pointer text-xs sm:text-sm min-w-[120px] sm:min-w-[140px]"
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
            {reports.length > 0 && totalPages > 1 && (
              <PaginationControls 
                currentPage={page} 
                totalPages={totalPages} 
                onPageChange={handlePageChange}
                className="justify-center order-1 sm:order-2"
              />
            )}
          </div>

          <div className="text-center mb-4 sm:mb-6">
            <p className="text-gray-300 text-xs sm:text-sm">
              {totalReports} report{totalReports !== 1 ? "s" : ""} found
              {totalPages > 1 && (
                <span className="ml-2 text-gray-400">• Page {page} of {totalPages}</span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-0">
        {reports.length === 0 && !loading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="text-gray-300 text-base sm:text-lg mb-4">No reports found</div>
            <p className="text-gray-400 text-sm sm:text-base">Try adjusting your search terms</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 justify-items-center">
            {reports.map((report) => (
              <ReportCard key={report._id} report={report} variant="detailed" />
            ))}
          </div>
        )}

        {reports.length > 0 && totalPages > 1 && (
          <div className="mt-8 sm:mt-12">
            <PaginationControls 
              currentPage={page} 
              totalPages={totalPages} 
              onPageChange={handlePageChange}
              className="justify-center"
            />
          </div>
        )}
      </div>

      <CreateReportModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmitFinish={handleSubmitFinish}
      />
    </div>
  );
}
