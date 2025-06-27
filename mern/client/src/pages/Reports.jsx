import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { parseTruthVerdict } from "../utils/strings";

// Components
import { LoadingScreen, ErrorScreen, ReportCard, CreateReportModal } from '../components';

export default function Reports() {
  const { user, isLoggedIn } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Check if user is an admin
  const isAdmin = isLoggedIn && user?.role === "admin";

  useEffect(() => {
    fetchReports();
  }, []);

  // Filter reports based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredReports(reports);
    } else {
      const filtered = reports.filter(report =>
        report.reportTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.aiReportSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.userId?.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.truthVerdictParsed.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredReports(filtered);
    }
  }, [searchQuery, reports]);

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

  if (loading) {
    return (
      <LoadingScreen message="Loading reports..." />
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-base-gradient px-4 py-8">
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
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-4">
          <div className="relative flex">            <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={(e) => e.target.select()}
            onClick={(e) => e.target.select()}
            placeholder="Search reports by title, content, author, or verdict..."
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
        </form>        {/* Results Counter */}
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
      <CreateReportModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSubmitFinish = {fetchReports}/>
    </div>
  );
}
