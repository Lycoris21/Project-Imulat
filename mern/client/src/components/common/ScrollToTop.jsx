import React, { useState, useEffect } from 'react';

export default function ScrollToTop({ 
  totalItems, 
  desktopThreshold = 20,
  mobileThreshold = 10,
  className = ''
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Check if we're on mobile or desktop
      const isMobile = window.innerWidth < 768; // Tailwind 'md' breakpoint
      const threshold = isMobile ? mobileThreshold : desktopThreshold;
      
      // Show if scrolled down more than 300px and there are more items than threshold
      if (window.pageYOffset > 300 && totalItems > threshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    window.addEventListener('resize', toggleVisibility);
    
    // Check initial state
    toggleVisibility();

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
      window.removeEventListener('resize', toggleVisibility);
    };
  }, [totalItems, desktopThreshold, mobileThreshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <button
        onClick={scrollToTop}
        className="bg-[color:var(--color-dark)] text-white px-4 py-2 rounded-lg shadow-lg hover:bg-[color:var(--color-base)] transition-all duration-200 flex items-center gap-2 text-sm font-medium"
      >
        <svg 
          className="w-4 h-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M5 10l7-7m0 0l7 7m-7-7v18" 
          />
        </svg>
        Back to Top
      </button>
    </div>
  );
}
