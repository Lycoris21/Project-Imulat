import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Components
import { LoadingScreen, ErrorScreen, ClaimCard, ReportCard } from '../components';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [latestReports, setLatestReports] = useState([]);
  const [latestClaims, setLatestClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  // Mock data for now - replace with actual API calls later
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch("http://localhost:5050/api/reports/latest");
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error("Expected an array of reports");

        const formatted = data.map((report) => ({
          id: report._id,
          title: report.reportTitle,
          reportCoverUrl: report.reportCoverUrl || null,
          summary: report.aiReportSummary || "No summary provided",
          verdict: report?.truthVerdictParsed,
          date: report.createdAt,
          author: report.userId?.username || "Unknown",
          likes: report.likes || 0,
          dislikes: report.dislikes || 0,
          commentCount: report.commentCount || 0
        }));

        setLatestReports(formatted);
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

        setLatestClaims(formatted);
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
      // Implement search functionality here
      console.log("Searching for:", searchQuery);
    }
  };

  if (loading) {
    return (
      <LoadingScreen message="Loading latest content..."/>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-base-gradient px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Welcome to Project IMULAT</h1>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">
          Your trusted source for fact-checking and claim verification
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
          <div className="relative flex">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports, claims, or topics..."
              className="w-full px-6 py-4 text-lg rounded-l-2xl text-white border-[#FFFFFF80] border-1 focus:ring-1 focus:ring-dark focus:outline-none"
            />
            <button
              type="submit"
              className="px-8 py-4 bg-[#FFF] border-0.5 border-white text-dark font-semibold rounded-r-2xl hover:bg-dark hover:text-white transition"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Two Column Layout */}
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Latest Reports Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Latest Reports</h2>
            <Link to="/reports" className="text-base hover:text-dark font-medium">
              View All →
            </Link>
          </div>            
          <div className="space-y-4">
            {latestReports.map((report) => ( 
              <ReportCard report={report} variant="compact"/>            
            ))}
          </div>
        </div>

        {/* Latest Claims Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Latest Claims</h2>
            <Link to="/claims" className="text-base hover:text-dark font-medium">
              View All →
            </Link>
          </div>            
          <div className="space-y-4">
            {latestClaims.map((claim) => (
               <ClaimCard claim={claim} variant="compact"/>
            ))}
          </div>
        </div>      
      </div>
    </div>
  );
}
