import { Link } from "react-router-dom";
import { useEffect } from "react";

export default function LoginRequiredModal({ isOpen, onClose, action = "perform this action" }) {
    // Disable scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        
        // Cleanup on unmount
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Handle ESC key press
    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscKey);
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [isOpen, onClose]);

    // Handle outside click
    const handleBackdropClick = (event) => {
        if (event.target === event.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-[#00000080] flex items-center justify-center z-50"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-center text-gray-900 mb-2">
                    Log In Required
                </h2>

                {/* Message */}
                <p className="text-gray-600 text-center mb-6">
                    You need to be logged in to {action}. Please log in or create an account to continue.
                </p>

                {/* Action buttons */}
                <div className="flex space-x-3">
                    <Link
                        to="/login"
                        className="flex-1 bg-[#1E275E] text-white py-2 px-4 rounded-lg font-medium text-center hover:bg-[#4B548B] transition-colors"
                    >
                        Log In
                    </Link>
                    <Link
                        to="/signup"
                        className="flex-1 border border-[#1E275E] text-[#1E275E] py-2 px-4 rounded-lg font-medium text-center hover:bg-gray-200 transition-colors"
                    >
                        Sign Up
                    </Link>
                </div>

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="w-full mt-3 underline text-gray-500 py-2 text-sm hover:text-gray-700 transition-colors cursor-pointer"
                >
                    Maybe later
                </button>
            </div>
        </div>
    );
}
