import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { parseTruthVerdict } from "../utils/stringUtils";

export default function Reports() {
  const { user, isLoggedIn } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
    // Form state for create report modal
  const [formData, setFormData] = useState({
    reportTitle: "",
    reportContent: "",
    truthVerdict: "",
    reportConclusion: "",
    references: "",
    claimId: "",
    reportCoverFile: null
  });

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
        report.adminUsername.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.truthVerdict.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredReports(filtered);
    }
  }, [searchQuery, reports]);

  const fetchReports = async () => {
    try {
      const response = await fetch("http://localhost:5050/api/reports");
      if (!response.ok) throw new Error("Failed to fetch reports");
      
      const data = await response.json();

      // Optional: map to format if necessary
      const processedReports = data.map((report) => ({
        id: report._id,
        reportTitle: report.reportTitle,
        aiReportSummary: report.aiReportSummary,
        truthVerdict: parseTruthVerdict(report.truthVerdict) || "Unknown",
        adminUsername: report.userId?.username || "Unknown", // ensure populated in backend
        reportCoverUrl: report.reportCoverUrl || null, // adjust if field is different
        createdAt: new Date(report.createdAt),
        likes: report.likes?.length || 0,
        dislikes: report.dislikes?.length || 0,
        commentCount: report.commentCount || 0,
        claimCount: report.claims?.length || 0
      }));

      processedReports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setReports(processedReports);
      setFilteredReports(processedReports);
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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      reportCoverFile: file
    }));
  };
  
  // Handle form submission
  const handleSubmitReport = async (e) => {
    e.preventDefault();

    try {
      let uploadedCoverUrl = null;

      if (formData.reportCoverFile) {
        const uploadData = new FormData();
        uploadData.append("image", formData.reportCoverFile);

        const uploadRes = await fetch("http://localhost:5050/api/uploads/report-cover", {
          method: "POST",
          body: uploadData
        });

        if (!uploadRes.ok) throw new Error("Failed to upload cover image");
        const uploadResult = await uploadRes.json();
        uploadedCoverUrl = uploadResult.url;
      }

      // Step 2: Prepare payload
      const payload = {
        userId: user._id,
        claimIds: formData.claimIds ? [formData.claimIds] : [],
        reportTitle: formData.reportTitle,
        reportContent: formData.reportContent,
        truthVerdict: formData.truthVerdict,
        reportConclusion: formData.reportConclusion,
        reportReferences: formData.references,
        aiReportSummary: "SAMPLE AI REPORT BECAUSE WE DON'T HAVE THAT FUNCTIONALITY YET!!!",
        reportCoverUrl: uploadedCoverUrl
      };

      const response = await fetch("http://localhost:5050/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create report");
      }

      // Clear form and close modal
      setFormData({
        reportTitle: "",
        reportContent: "",
        truthVerdict: "",
        reportConclusion: "",
        references: "",
        claimIds: "",
        reportCoverFile: null
      });
      setShowCreateModal(false);
      alert("Report created successfully!");
      fetchReports();
    } catch (error) {
      console.error("Error creating report:", error);
      alert(error.message || "Error creating report. Please try again.");
    }
  };

  // Close modal and reset form
  const handleCloseModal = () => {
    setShowCreateModal(false);
    setFormData({
      reportTitle: "",
      reportContent: "",
      truthVerdict: "",
      reportConclusion: "",
      references: "",
      claimId: "",
      reportCoverFile: null
    });
  };

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && showCreateModal) {
        handleCloseModal();
      }
    };

    // Add event listener when modal is open
    if (showCreateModal) {
      document.addEventListener('keydown', handleEscKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    // Cleanup function
    return () => {
      document.removeEventListener('keydown', handleEscKey);
      // Restore body scroll when modal is closed
      document.body.style.overflow = 'unset';
    };
  }, [showCreateModal]);

  const getVerdictColor = (verdict) => {
    switch (verdict) {
      case "True": case "Verified": return "text-green-600 bg-green-100";
      case "False": case "Debunked": return "text-red-600 bg-red-100";
      case "Partially True": return "text-yellow-600 bg-yellow-100";
      case "Misleading": return "text-orange-600 bg-orange-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const formatRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days === 1 ? '' : 's'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-5rem)] bg-base-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (    
  <div className="min-h-[calc(100vh-5rem)] bg-base-gradient px-4 py-8">
      {/* Header */}
      <div className="mb-8">        {/* Title and Admin Button Row */}
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
                className="px-6 py-3 bg-[#1E275E] text-white font-semibold rounded-2xl shadow-lg hover:bg-[#1E275E80] transition-all duration-200 flex items-center gap-2"
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
              className="w-full px-6 py-4 text-lg rounded-l-2xl text-white border border-gray-300 focus:ring-2 focus:ring-[#1E275E] focus:outline-none"
            />
            <button
              type="submit"
              className="px-8 py-4 bg-white border border-l-0 border-gray-300 text-[#1E275E] font-semibold rounded-r-2xl hover:bg-gray-50 transition"
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
              <Link
                key={report.id}
                to={`/reports/${report.id}`}
                className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 w-full sm:w-80 md:w-96"
              >
                {/* Cover Image */}
                {report.reportCoverUrl && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={report.reportCoverUrl}
                      alt={`Cover for ${report.reportTitle}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.parentElement.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  {/* Header with Verdict */}
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-gray-800 text-lg leading-tight hover:text-blue-600 transition-colors flex-1 mr-3 line-clamp-2">
                      {report.reportTitle}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getVerdictColor(report.truthVerdict)}`}>
                      {report.truthVerdict}
                    </span>
                  </div>

                  {/* AI Summary */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    <span className="font-medium">AI-generated summary:</span> {report.aiReportSummary}
                  </p>

                  {/* Author & Claim Count */}
                  <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
                    <span>By <span className="font-medium">{report.adminUsername}</span></span>
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                      {report.claimCount} claim{report.claimCount !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Stats & Date */}
                  <div className="flex justify-between items-center text-xs text-gray-500 pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-4">
                      {/* Likes */}
                      <span className="flex items-center space-x-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                        </svg>
                        <span>{report.likes}</span>
                      </span>
                      
                      {/* Dislikes */}
                      <span className="flex items-center space-x-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" transform="rotate(180)">
                          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                        </svg>
                        <span>{report.dislikes}</span>
                      </span>
                      
                      {/* Comments */}
                      <span className="flex items-center space-x-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                        </svg>
                        <span>{report.commentCount}</span>
                      </span>
                    </div>
                    
                    {/* Date */}
                    <span className="italic">{formatRelativeTime(report.createdAt)}</span>
                  </div>
                </div>
              </Link>
            ))}          </div>
        )}
      </div>

      {/* Admin: Create Report Modal */}
      {showCreateModal && (        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>        
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header - Fixed */}
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Create New Report</h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">                {/* Modal Form */}
                <form id="report-form" onSubmit={handleSubmitReport} className="space-y-4">                  {/* Report Cover Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Report Cover Image
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-400 bg-white flex items-center">
                        <span className="text-gray-900">Choose File</span>
                        <span className="mx-2 text-gray-300">|</span>
                        <span className={`${formData.reportCoverFile ? 'text-gray-500' : 'text-gray-400'} flex-1 truncate`}>
                          {formData.reportCoverFile ? formData.reportCoverFile.name : 'No file chosen'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Report Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Report Title
                    </label>
                    <input
                      type="text"
                      name="reportTitle"
                      value={formData.reportTitle}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      placeholder="Enter report title..."
                    />
                  </div>

                  {/* Report Content */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Report Content
                    </label>
                    <textarea
                      name="reportContent"
                      value={formData.reportContent}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none resize-vertical"
                      placeholder="Enter detailed report content..."
                    />
                  </div>                
                    {/* Truth Verdict Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Truth Verdict
                    </label>
                    <select
                      name="truthVerdict"
                      value={formData.truthVerdict}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none ${
                        formData.truthVerdict === '' ? 'text-gray-400' : 'text-gray-900'
                      }`}
                    >
                      <option value="" disabled className="text-gray-400">Select a verdict...</option>
                      <option value="unverified" className="text-gray-900">Unverified - Lacks sufficient evidence for verification</option>
                      <option value="true" className="text-gray-900">True - Completely accurate and supported by evidence</option>
                      <option value="false" className="text-gray-900">False - Completely inaccurate or fabricated</option>
                      <option value="partially_true" className="text-gray-900">Partially True - Contains some truth but missing context</option>
                      <option value="misleading" className="text-gray-900">Misleading - Technically accurate but deceptive in context</option>
                      <option value="disputed" className="text-gray-900">Disputed - Credible sources disagree on the facts</option>
                      <option value="debunked" className="text-gray-900">Debunked - Previously proven false with clear evidence</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Choose the verdict that best represents the factual accuracy of the claim
                    </p>
                  </div>

                  {/* Report Conclusion */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Report Conclusion
                    </label>
                    <textarea
                      name="reportConclusion"
                      value={formData.reportConclusion}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none resize-vertical"
                      placeholder="Enter report conclusion..."
                    />
                  </div>

                  {/* References */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      References
                    </label>
                    <textarea
                      name="references"
                      value={formData.references}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none resize-vertical"
                      placeholder="Enter references and sources..."
                    />
                  </div>

                  {/* Claim ID (Optional) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Claim ID (Optional)
                    </label>
                    <input
                      type="text"
                      name="claimId"
                      value={formData.claimId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      placeholder="Enter claim ID to reference..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Optional: Link this report to a specific claim
                    </p>
                  </div>
                </form>
              </div>
            </div>

            {/* Modal Actions - Fixed */}
            <div className="p-6 border-t border-gray-200 flex-shrink-0">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="report-form"
                  className="px-6 py-2 bg-[#4B548B] text-white rounded-lg hover:bg-[#1E275E] transition-colors flex-1"
                >
                  Submit Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
