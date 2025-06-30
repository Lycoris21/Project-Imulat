// CreateReportModal.js
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export default function CreateReportModal({ isOpen, onClose, onSubmitFinish, claimId = null }) {
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state for create report modal
    const [formData, setFormData] = useState({
        reportTitle: "",
        reportContent: "",
        truthVerdict: "",
        reportConclusion: "",
        references: "",
        claimId: claimId || "",
        reportCoverFile: null
    });

    const handleSubmitReport = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

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

            const payload = {
                userId: user._id,
                claimIds: formData.claimId ? [formData.claimId] : [],
                reportTitle: formData.reportTitle,
                reportContent: formData.reportContent,
                truthVerdict: formData.truthVerdict,
                reportConclusion: formData.reportConclusion,
                reportReferences: formData.references,
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
                let message = "Validation failed.";
                if (Array.isArray(errorData.details)) {
                    message = errorData.details.map((e) => `• ${e.msg}`).join("\n");
                } else if (errorData.error) {
                    message = errorData.error;
                }

                throw new Error(message);
            }

            // Reset and close
            setFormData({
                reportTitle: "",
                reportContent: "",
                truthVerdict: "",
                reportConclusion: "",
                references: "",
                claimId: "",
                reportCoverFile: null
            });
            
            onClose();
            
            if (onSubmitFinish) {
                await onSubmitFinish('reportSubmitted');
            }
        } catch (error) {
            console.error("Error creating report:", error);
            alert(error.message || "Error creating report. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };


    // Handle file upload
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormData(prev => ({
            ...prev,
            reportCoverFile: file
        }));
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Reset form
    useEffect(() => {
        if (!isOpen) {
            setFormData({
                reportTitle: "",
                reportContent: "",
                truthVerdict: "",
                reportConclusion: "",
                references: "",
                claimId: claimId || "",
                reportCoverFile: null
            });
        }
    }, [isOpen]);


    // Handle ESC key press to close modal
    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscKey);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-[#00000080]">
            {/* Loading Overlay */}
            {isSubmitting && (
                <div className="absolute inset-0 bg-[#00000080] flex items-center justify-center z-10">
                    <div className="bg-white rounded-lg p-8 flex flex-col items-center space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="text-gray-700 font-medium">Creating report...</p>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden relative">
                {/* Modal Header - Fixed */}
                <div className="p-6 border-b border-gray-200 flex-shrink-0">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-800">{claimId ? "Create a Report for this Claim" : "Create New Report"}</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
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
                        <form id="report-form" onSubmit={handleSubmitReport} className="space-y-4">                  
                            {/* Report Cover Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 ">
                                    Report Cover Image
                                </label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 "
                                    />
                                    <div className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-400 bg-white flex items-center cursor-pointer">
                                        <span className="text-gray-600">Choose File</span>
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
                                    Report Content (Min: 250 Characters)
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
                                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none ${formData.truthVerdict === '' ? 'text-gray-400' : 'text-gray-900'
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
                                    Claim ID {claimId ? "(Linked to Current Claim)" : "(Optional)"}
                                </label>
                                <input
                                    type="text"
                                    name="claimId"
                                    value={formData.claimId}
                                    onChange={handleInputChange}
                                    disabled={!!claimId} // Disable if passed in
                                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${claimId ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
                                    placeholder={claimId ? "Claim ID will be auto-filled..." : "Enter claim ID to reference..."}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {claimId
                                        ? "This report will be automatically linked to the current claim"
                                        : "Optional: Link this report to a specific claim"}
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
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex-1 cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            form="report-form"
                            className={`px-6 py-2 rounded-lg transition-colors flex-1 ${
                                isSubmitting 
                                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                                    : 'bg-[color:var(--color-base)] text-white hover:bg-[color:var(--color-dark)] cursor-pointer'
                            }`}
                        >
                            {isSubmitting ? 'Creating Report...' : 'Submit Report'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};