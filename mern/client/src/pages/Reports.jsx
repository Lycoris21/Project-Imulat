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
} from "../components";

export default function Reports() {
  const { user, isLoggedIn } = useAuth();
  const { search, sort, page, user: queryUser, updateParams } = useQueryParams();

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
  }, [search, sort, page, queryUser]);

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
      if (queryUser?.trim()) params.append("user", queryUser.trim());


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
  const PaginationControls = () => {
    if (totalPages <= 1) return null;

    const getVisiblePages = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];

      for (let i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
        range.push(i);
      }

      if (page - delta > 2) rangeWithDots.push(1, "...");
      else rangeWithDots.push(1);
      rangeWithDots.push(...range);
      if (page + delta < totalPages - 1) rangeWithDots.push("...", totalPages);
      else rangeWithDots.push(totalPages);
      return rangeWithDots;
    };

    return (
      <div className="flex justify-center items-center space-x-0.5">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          className="px-2 py-1 rounded-md bg-white text-[color:var(--color-dark)] border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-medium"
        >
          Previous
        </button>
        <div className="flex space-x-0.5 mx-1">
          {getVisiblePages().map((p, i) => (
            <button
              key={i}
              onClick={() => typeof p === "number" && handlePageChange(p)}
              disabled={p === "..."}
              className={`px-2 py-1 rounded-md transition-colors text-xs font-medium min-w-[28px] ${
                p === page
                  ? "bg-[color:var(--color-dark)] text-white shadow-sm"
                  : p === "..."
                  ? "bg-transparent text-gray-400 cursor-default"
                  : "bg-white text-[color:var(--color-dark)] border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          className="px-2 py-1 rounded-md bg-white text-[color:var(--color-dark)] border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-medium"
        >
          Next
        </button>
      </div>
    );
  };

  if (loading) return <LoadingScreen message="Loading reports..." />;

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-base-gradient px-4 py-8">
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 animate-slide-in">
          <span className="font-medium">Report created successfully</span>
          <button
            onClick={() => setShowSuccessMessage(false)}
            className="ml-2 text-green-200 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      <div className="mb-8">
        <div className="relative mb-6 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">All Reports</h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Browse through all fact-checking reports created by our expert team
          </p>
          {canResearch && (
            <div className="absolute top-0 right-0">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-[color:var(--color-dark)] text-white border border-gray-400 font-semibold rounded-2xl shadow-lg hover:bg-[#1E275E80] transition-all duration-200 flex items-center gap-2 cursor-pointer"
              >
                + Make A Report
              </button>
            </div>
          )}
        </div>

        <div className="max-w-6xl mx-auto mb-6">
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onSubmit={handleSearch}
            placeholder="Search reports by title, content, author, or verdict..."
            isLoading={searchLoading}
          />

          <div className="max-w-2xl mx-auto mb-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-white text-xs font-medium">Sort by:</span>
              <select
                value={sort}
                onChange={(e) => updateParams({ sort: e.target.value, page: 1, search })}
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
            {reports.length > 0 && totalPages > 1 && <PaginationControls />}
          </div>

          <div className="text-center mb-6">
            <p className="text-gray-300 text-sm">
              {totalReports} report{totalReports !== 1 ? "s" : ""} found
              {totalPages > 1 && (
                <span className="ml-2 text-gray-400">• Page {page} of {totalPages}</span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {reports.length === 0 && !loading ? (
          <div className="text-center py-12">
            <div className="text-gray-300 text-lg mb-4">No reports found</div>
            <p className="text-gray-400">Try adjusting your search terms</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-6 justify-center">
            {reports.map((report) => (
              <ReportCard key={report._id} report={report} variant="detailed" />
            ))}
          </div>
        )}

        {reports.length > 0 && totalPages > 1 && (
          <div className="mt-12">
            <PaginationControls />
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
