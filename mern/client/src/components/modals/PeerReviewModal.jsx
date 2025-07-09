import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PeerReviewModal({ isOpen, onClose }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);


useEffect(() => {
  if (!isOpen) return;

  setIsAnimating(true);

  const fetchPendingReports = async () => {
    try {
      const res = await fetch("http://localhost:5050/api/reports/pending");
      const data = await res.json();
      setReports(data.reports ?? []);
    } catch (err) {
      console.error("Failed to fetch pending reports", err);
    }
  };

  fetchPendingReports();
}, [isOpen]);


  useEffect(() => {
    if (isOpen) setIsAnimating(true);
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => onClose(), 150);
  };

  const handleReportClick = (id) => {
    navigate(`/reports/${id}`);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#00000080] transition-opacity duration-150 ${isAnimating ? "opacity-100" : "opacity-0"}`}>
      <div className={`bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden relative transform transition-all duration-150 ${isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}>
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Reports Needing Review</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">
            <svg className="w-6 h-6 c" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Scrollable List */}
        <div className="p-6 overflow-y-auto flex-1 bg-[#f9f9fc]">
{reports.length === 0 ? (
  <p className="text-gray-500">No reports currently need review.</p>
) : (
  <ul className="space-y-4">
    {reports.map((report) => (
      <li
        key={report._id}
        onClick={() => handleReportClick(report._id)}
        className="cursor-pointer border border-gray-200 rounded-lg p-4 shadow-sm bg-white hover:bg-gray-200"
      >
        <h3 className="font-semibold text-lg text-gray-800">{report.reportTitle}</h3>
        <p className="text-sm text-gray-600">Submitted by: {report.userId?.username ?? 'Unknown'}</p>
        <p className="text-sm text-gray-500">Submitted on: {new Date(report.createdAt).toLocaleDateString()}</p>
      </li>
    ))}
  </ul>
)}

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="cursor-pointer w-full px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
