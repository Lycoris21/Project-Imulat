import React, { useEffect, useState } from "react";

export default function AlertModal({
  isOpen,
  onClose,
  title = "",
  message = "",
  type = "success" // success | error | info | warning
}) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  // Handle ESC key press and disable background scroll
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      // Add ESC key listener
      document.addEventListener('keydown', handleEscapeKey);

      // Disable background scroll while keeping scrollbar visible
      // Calculate scrollbar width to prevent layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // Store original styles
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      
      // Apply styles to prevent scroll but keep scrollbar space
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;

      return () => {
        document.removeEventListener('keydown', handleEscapeKey);
        // Restore original styles
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 150);
  };

  if (!isOpen) return null;

  const iconMap = {
    success: (
      <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    ),
    error: (
      <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-5h2v2h-2v-2zm0-8h2v6h-2V5z"
          clipRule="evenodd"
        />
      </svg>
    ),
    info: (
      <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 7h2V5H9v2zm0 8h2v-6H9v6zm1-16C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.682-1.36 3.447 0l6.518 11.596c.75 1.335-.213 2.998-1.732 2.998H3.471c-1.52 0-2.482-1.663-1.732-2.998L8.257 3.1zM11 14a1 1 0 11-2 0 1 1 0 012 0zm-1-2a1 1 0 01-1-1V8a1 1 0 112 0v3a1 1 0 01-1 1z"
          clipRule="evenodd"
        />
      </svg>
    )
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#00000080] transition-opacity duration-150 ${isAnimating ? "opacity-100" : "opacity-0"}`}>
      <div className={`bg-white rounded-xl shadow-lg w-full max-w-md p-6 flex items-start space-x-4 transform transition-all duration-150 ${isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}>
        <div>{iconMap[type]}</div>
        <div className="flex-1">
          {title && <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>}
          <p className="text-gray-700 whitespace-pre-wrap">{message}</p>
        </div>
        <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 cursor-pointer">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
