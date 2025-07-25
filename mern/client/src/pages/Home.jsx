import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useHomeSearchSuggestions } from "../hooks/useHomeSearchSuggestions";

// Components
import { LoadingScreen, ErrorScreen, ClaimCard, ReportCard, SearchBar } from '../components';

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [latestReports, setLatestReports] = useState([]);
  const [latestClaims, setLatestClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [reportFilter, setReportFilter] = useState("newest");
  const [claimFilter, setClaimFilter] = useState("newest");

  // Search suggestions for the search bar
  const {
    suggestions,
    isLoading: suggestionsLoading,
    isDisabled,
    disableSuggestions
  } = useHomeSearchSuggestions(searchQuery);


  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch("http://localhost:5050/api/reports/latest");
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error("Expected an array of reports");

        setLatestReports(data);
      } catch (err) {
        console.error("Failed to fetch reports:", err);
      }
    };

    const fetchClaims = async () => {
      try {
        const response = await fetch("http://localhost:5050/api/claims/latest");
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error("Expected an array of claims");

        const formatted = data.map((claim) => ({
          id: claim._id,
          claim: claim.claimTitle,
          aiSummary: claim.aiClaimSummary || "No summary provided",
          aiTruthIndex: claim.aiTruthIndex || 0,
          reportId: claim.reportId || null,
          date: claim.createdAt,
          submittedBy: claim.userId?.username || "Unknown",
          likes: claim.likes || 0,
          dislikes: claim.dislikes || 0,
          commentCount: claim.commentCount || 0
        }));

        setLatestClaims(data);
      } catch (err) {
        console.error("Failed to fetch claims:", err);
      }
    };

    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchReports(), fetchClaims()]);
      setLoading(false);
    };

    loadData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchLoading(true);

      // Navigate to search page with query
      setTimeout(() => {
        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        setSearchLoading(false);
      }, 300); // Small delay to show loading animation
    }
  };

  if (loading) {
    return (
      <LoadingScreen message="Loading latest content..." />
    );
  }

  return (
    <>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 12px;
          margin-top: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 10px;
          margin-top: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(107, 114, 128, 0.8);
          border-radius: 10px;
          transition: background 0.2s ease;
          margin-top: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.9);
        }
        
        .custom-scrollbar {
          padding-bottom: 8px;
        }
        
        /* Firefox */
        .custom-scrollbar {
          scrollbar-width: auto;
          scrollbar-color: rgba(107, 114, 128, 0.8) transparent;
        }
      `}</style>
      <div className="min-h-[calc(100vh-5rem)] bg-base-gradient px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Welcome to Project IMULAT</h1>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">
          Your trusted source for fact-checking and claim verification
        </p>

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onSubmit={handleSearch}
          placeholder="Search reports, claims, users, or topics..."
          showDropdown={true}
          suggestions={suggestions}
          isLoading={searchLoading || suggestionsLoading}
          isDisabled={isDisabled}
          disableSuggestions={disableSuggestions}
          defaultSearchRoute="/search"
        />
      </div>

      {/* Two ROW Layout */}

      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {/* Latest Reports Section */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Latest Reports</h2>
            <Link
              to="/reports"
              className="text-white hover:text-[color:var(--color-selected)] font-medium transition"
            >
              View All →
            </Link>
          </div>
          {latestReports.length === 0 ? (
            <div className="text-center py-6 text-white">No reports found.</div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <div className="flex gap-4 min-w-full">
                {latestReports.map((report) => (
                  <ReportCard key={report._id} report={report} variant="detailed" />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Latest Claims Section */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Latest Claims</h2>
            <Link
              to="/claims"
              className="text-white hover:text-[color:var(--color-selected)] font-medium transition"
            >
              View All →
            </Link>
          </div>
          {latestClaims.length === 0 ? (
            <div className="text-center py-6 text-gray-500">No claims found.</div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <div className="flex gap-4 min-w-full">
                {latestClaims.map((claim) => (
                  <ClaimCard key={claim._id} claim={claim} variant="detailed" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
