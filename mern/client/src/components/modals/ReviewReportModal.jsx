import { useState } from "react";

export default function ReviewReportModal({ isOpen, onClose, onApprove, onDisapprove }) {
  const [disapprovalReason, setDisapprovalReason] = useState("");
  const [isDisapproving, setIsDisapproving] = useState(false);

  const handleApprove = () => {
    onApprove();
    onClose();
    setIsDisapproving(false);
    setDisapprovalReason("");
  };

  const handleDisapprove = () => {
    if (!isDisapproving) {
      setIsDisapproving(true);
      return;
    }
    
    if (disapprovalReason.trim()) {
      onDisapprove(disapprovalReason);
      onClose();
      setIsDisapproving(false);
      setDisapprovalReason("");
    }
  };

  const handleClose = () => {
    onClose();
    setIsDisapproving(false);
    setDisapprovalReason("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#00000080] flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Review Report
          </h2>
          
          {!isDisapproving ? (
            <div>
              <p className="text-gray-600 mb-6">
                What action would you like to take on this report?
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleApprove}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
                >
                  Approve
                </button>
                <button
                  onClick={handleDisapprove}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
                >
                  Disapprove
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-4">
                Please provide a reason for disapproving this report:
              </p>
              
              <textarea
                value={disapprovalReason}
                onChange={(e) => setDisapprovalReason(e.target.value)}
                placeholder="Enter reason for disapproval..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                required
              />
              
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <button
                  onClick={() => setIsDisapproving(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors duration-200 font-medium"
                >
                  Back
                </button>
                <button
                  onClick={handleDisapprove}
                  disabled={!disapprovalReason.trim()}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    disapprovalReason.trim()
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Submit Disapproval
                </button>
              </div>
            </div>
          )}
          
          <button
            onClick={handleClose}
            className="mt-4 w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
