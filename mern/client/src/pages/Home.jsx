import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { parseTruthVerdict } from "../utils/stringUtils";

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
          verdict: parseTruthVerdict(report.truthVerdict) || "Unverified",
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

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-5rem)] bg-base-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading latest content...</p>
        </div>
      </div>
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
            <Link to="/reports" className="text-[#4B548B] hover:text-[#1E275E] font-medium">
              View All →
            </Link>
          </div>            
          <div className="space-y-4">
            {latestReports.map((report) => (              <Link 
                key={report.id} 
                to={`/reports/${report.id}`}
                className="block border-b border-gray-200 pb-4 last:border-b-0 shadow-sm hover:bg-[#EDEEF1] transition-colors rounded-lg p-3 m-3"
              >
                <div className="flex gap-3">                  {/* Cover Image on the left */}
                  {report.reportCoverUrl && (
                    <div className="flex-shrink-0">
                      <img 
                        src={report.reportCoverUrl} 
                        alt={`Cover for ${report.title}`}
                        className="w-25 h-full object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Content on the right */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-800 text-sm leading-tight hover:text-blue-600 transition-colors">
                    {report.title}
                  </h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getVerdictColor(report.verdict)}`}>
                    {report.verdict}
                  </span>
                </div>                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                  <span className="font-medium">AI-generated summary:</span> {report.summary}
                </p>                
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>By <span className="font-medium">{report.author}</span></span>
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center space-x-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                      </svg>
                      <span>{report.likes}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" transform="rotate(180)">
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                      </svg>
                      <span>{report.dislikes}</span>
                    </span>                    <span className="flex items-center space-x-1 mr-10">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                      </svg>
                      <span>{report.commentCount}</span>
                    </span>                    <span className="italic">{formatRelativeTime(report.date)}</span>
                  </div>
                </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Latest Claims Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Latest Claims</h2>
            <Link to="/claims" className="text-[#4B548B] hover:text-[#1E275E] font-medium">
              View All →
            </Link>
          </div>            
          <div className="space-y-4">
            {latestClaims.map((claim) => (
              <Link 
                key={claim.id} 
                to={`/claims/${claim.id}`}
                className="block border-b border-gray-200 pb-4 last:border-b-0 shadow-sm hover:bg-[#EDEEF1] transition-colors rounded-lg p-3 m-3"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-800 text-sm leading-tight flex-1 mr-2 hover:text-blue-600 transition-colors">
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
                </div>                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                  <span className="font-medium">AI-generated summary:</span> {claim.aiSummary}
                </p>                
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Submitted by: <span className="font-medium">{claim.submittedBy}</span></span>
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center space-x-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                      </svg>
                      <span>{claim.likes}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" transform="rotate(180)">
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                      </svg>
                      <span>{claim.dislikes}</span>
                    </span>                    <span className="flex items-center space-x-1  mr-10">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                      </svg>
                      <span>{claim.commentCount}</span>
                    </span>
                    <span className="italic">{formatRelativeTime(claim.date)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>      
      </div>
    </div>
  );
}
