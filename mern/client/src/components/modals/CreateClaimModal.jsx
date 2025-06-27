// src/components/modals/CreateReportModal.jsx
import React from "react";

export default function CreateClaimModal({
  formData,
  setFormData,
  onClose,
  onSubmit,
  isSubmitting,
  onFileChange,
  onInputChange,
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Create New Report</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <form id="report-form" onSubmit={onSubmit} className="space-y-4">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="w-full"
              />
            </div>

            {/* Text Inputs */}
            {[
              { label: "Title", name: "reportTitle", type: "text", required: true },
              { label: "Content", name: "reportContent", textarea: true, rows: 6, required: true },
              { label: "Conclusion", name: "reportConclusion", textarea: true, rows: 3, required: true },
              { label: "References", name: "references", textarea: true, rows: 3, required: true },
              { label: "Claim IDs (comma-separated)", name: "claimIds", placeholder: "id1, id2, id3" },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-2">{field.label}</label>
                {field.textarea ? (
                  <textarea
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={onInputChange}
                    required={field.required}
                    rows={field.rows}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder={field.placeholder}
                  />
                ) : (
                  <input
                    type={field.type || "text"}
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={onInputChange}
                    required={field.required}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder={field.placeholder}
                  />
                )}
              </div>
            ))}

            {/* Verdict */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Truth Verdict</label>
              <select
                name="truthVerdict"
                value={formData.truthVerdict}
                onChange={onInputChange}
                required
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="" disabled>Select verdict</option>
                <option value="unverified">Unverified</option>
                <option value="true">True</option>
                <option value="false">False</option>
                <option value="partially_true">Partially True</option>
                <option value="misleading">Misleading</option>
                <option value="disputed">Disputed</option>
                <option value="debunked">Debunked</option>
              </select>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-200 flex gap-4">
          <button onClick={onClose} className="flex-1 border px-6 py-2 rounded-lg">Cancel</button>
          <button
            type="submit"
            form="report-form"
            disabled={isSubmitting}
            className="flex-1 bg-dark text-white px-6 py-2 rounded-lg"
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </button>
        </div>
      </div>
    </div>
  );
}
