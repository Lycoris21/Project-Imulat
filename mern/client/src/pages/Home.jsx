import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [latestReports, setLatestReports] = useState([]);
  const [latestClaims, setLatestClaims] = useState([]);
  // Mock data for now - replace with actual API calls later
  useEffect(() => {    // Mock latest reports data with varied dates to show all time states
    const mockReports = Array.from({ length: 10 }, (_, i) => {
      let date;
      switch (i) {
        case 0: date = new Date(Date.now() - 30 * 1000); break; // 30 seconds ago
        case 1: date = new Date(Date.now() - 5 * 60 * 1000); break; // 5 minutes ago
        case 2: date = new Date(Date.now() - 45 * 60 * 1000); break; // 45 minutes ago
        case 3: date = new Date(Date.now() - 2 * 60 * 60 * 1000); break; // 2 hours ago
        case 4: date = new Date(Date.now() - 8 * 60 * 60 * 1000); break; // 8 hours ago
        case 5: date = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000); break; // 1 day ago
        case 6: date = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); break; // 3 days ago
        case 7: date = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000); break; // 6 days ago
        case 8: date = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); break; // 10 days ago (will show date)
        case 9: date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); break; // 30 days ago (will show date)
        default: date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      }
      
      return {
        id: i + 1,
        title: `Report ${i + 1}: Sample fact-check report`,
        summary: `This is a summary of report ${i + 1} covering various claims and findings.`,
        verdict: i % 3 === 0 ? "True" : i % 3 === 1 ? "False" : "Partially True",
        date: date,
        author: `Author ${i + 1}`
      };
    });

    // Mock latest claims data with varied dates to show all time states
    const mockClaims = Array.from({ length: 10 }, (_, i) => {
      let date;
      switch (i) {
        case 0: date = new Date(Date.now() - 15 * 1000); break; // 15 seconds ago
        case 1: date = new Date(Date.now() - 10 * 60 * 1000); break; // 10 minutes ago
        case 2: date = new Date(Date.now() - 30 * 60 * 1000); break; // 30 minutes ago
        case 3: date = new Date(Date.now() - 1 * 60 * 60 * 1000); break; // 1 hour ago
        case 4: date = new Date(Date.now() - 12 * 60 * 60 * 1000); break; // 12 hours ago
        case 5: date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); break; // 2 days ago
        case 6: date = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000); break; // 4 days ago
        case 7: date = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000); break; // 5 days ago
        case 8: date = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000); break; // 15 days ago (will show date)
        case 9: date = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000); break; // 45 days ago (will show date)
        default: date = new Date(Date.now() - i * 12 * 60 * 60 * 1000);
      }
      
      return {
        id: i + 1,
        claim: `Sample claim ${i + 1} about current events and facts`,
        aiSummary: `AI-generated summary: This claim discusses important facts and requires verification through multiple sources and evidence.`,
        aiTruthIndex: Math.floor(Math.random() * 101), // Random score 0-100
        reportId: i % 2 === 0 ? `report_${i + 1}` : null, // Some claims have reportId, some are null
        date: date,
        submittedBy: `User${i + 1}`
      };
    });

    setLatestReports(mockReports);
    setLatestClaims(mockClaims);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement search functionality here
      console.log("Searching for:", searchQuery);
    }
  };
  const getVerdictColor = (verdict) => {
    switch (verdict) {
      case "True": case "Verified": return "text-green-600 bg-green-100";
      case "False": case "Debunked": return "text-red-600 bg-red-100";
      default: return "text-yellow-600 bg-yellow-100";
    }
  };
  // Report icon SVG component
  const ReportIcon = () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
    </svg>
  );
  // Function to get AI Truth Index color
  const getTruthIndexColor = (index) => {
    if (index >= 80) return "text-green-600 bg-green-100";
    if (index >= 60) return "text-yellow-600 bg-yellow-100";
    if (index >= 40) return "text-orange-600 bg-orange-100";
    return "text-red-600 bg-red-100";
  };
  // Function to format relative time
  const formatRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) { // less than 1 hour
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    } else if (diffInSeconds < 86400) { // less than 1 day (24 * 60 * 60)
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    } else if (diffInSeconds < 604800) { // less than 7 days (7 * 24 * 60 * 60)
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days === 1 ? '' : 's'} ago`;
    } else {
      // More than 6 days, show actual date
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(to_bottom,_#4B548B_0%,_#2F3558_75%,_#141625_100%)] px-4 py-8">
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
              className="w-full px-6 py-4 text-lg rounded-l-2xl text-white border-[#FFFFFF80] border-1 focus:ring-1 focus:ring-[#1E275E] focus:outline-none"
            />
            <button
              type="submit"
              className="px-8 py-4 bg-[#FFF] border-0.5 border-white text-[#1E275E] font-semibold rounded-r-2xl hover:bg-[#1E275E] hover:text-white transition"
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
            <Link to="/reports" className="text-blue-600 hover:text-blue-700 font-medium">
              View All →
            </Link>
          </div>
            <div className="space-y-4">
            {latestReports.map((report) => (
              <div key={report.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-800 text-sm leading-tight">
                    {report.title}
                  </h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getVerdictColor(report.verdict)}`}>
                    {report.verdict}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                  {report.summary}
                </p>                <div className="flex justify-between text-xs text-gray-500">
                  <span>By {report.author}</span>
                  <span>{formatRelativeTime(report.date)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Claims Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Latest Claims</h2>
            <Link to="/claims" className="text-blue-600 hover:text-blue-700 font-medium">
              View All →
            </Link>
          </div>            <div className="space-y-4">
            {latestClaims.map((claim) => (
              <div key={claim.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-800 text-sm leading-tight flex-1 mr-2">
                    {claim.claim}
                  </h3>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {claim.reportId && (
                      <span className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-blue-600 bg-blue-100">
                        <ReportIcon />
                        Report Available
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTruthIndexColor(claim.aiTruthIndex)}`}>
                      AI Truth Index: {claim.aiTruthIndex}%
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                  {claim.aiSummary}
                </p>                <div className="flex justify-between text-xs text-gray-500">
                  <span>Submitted by: {claim.submittedBy}</span>
                  <span>{formatRelativeTime(claim.date)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>      
      </div>
    </div>
  );
}
