import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Components
import { LoadingScreen, ErrorScreen, ClaimCard, ReportCard, SearchBar } from '../components';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [latestReports, setLatestReports] = useState([]);
  const [latestClaims, setLatestClaims] = useState([]);
  const [loading, setLoading] = useState(true);

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
        <SearchBar
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onSubmit={handleSearch}
          placeholder="Search reports, claims, or topics..."
        />
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
              <ReportCard key={report._id} report={report} variant="compact"/>            
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
               <ClaimCard key={claim._id} claim={claim} variant="compact"/>
            ))}
          </div>
        </div>      
      </div>
    </div>
  );
}
