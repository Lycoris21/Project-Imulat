import { useState, useEffect, useCallback, useRef } from "react";

export function useHomeSearchSuggestions(initialQuery = "", debounceMs = 300) {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDisabled, setIsDisabled] = useState(false);
  const timeoutRef = useRef(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery) => {
      if (!searchQuery.trim() || isDisabled) {
        setSuggestions([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch reports, claims, and users in parallel
        const [reportsResponse, claimsResponse, usersResponse] = await Promise.all([
          fetch(`http://localhost:5050/api/reports?search=${encodeURIComponent(searchQuery)}`),
          fetch(`http://localhost:5050/api/claims?search=${encodeURIComponent(searchQuery)}`),
          fetch(`http://localhost:5050/api/users/search?q=${encodeURIComponent(searchQuery)}`)
        ]);

        if (!reportsResponse.ok || !claimsResponse.ok || !usersResponse.ok) {
          throw new Error('Failed to fetch suggestions');
        }

        const [reportsData, claimsData, usersData] = await Promise.all([
          reportsResponse.json(),
          claimsResponse.json(),
          usersResponse.json()
        ]);

        // Format suggestions
        const allSuggestions = [];

        // Add top 3 reports
        const reportSuggestions = reportsData.slice(0, 3).map(report => ({
          _id: report._id,
          type: 'report',
          title: report.reportTitle,
          description: report.aiReportSummary || report.reportDescription || 'No description available'
        }));

        // Add top 3 claims
        const claimSuggestions = claimsData.slice(0, 3).map(claim => ({
          _id: claim._id,
          type: 'claim',
          title: claim.claimTitle,
          description: claim.aiClaimSummary || 'No summary available'
        }));

        // Add top 2 users
        const userSuggestions = usersData.slice(0, 2).map(user => ({
          _id: user._id,
          type: 'user',
          title: user.username,
          description: user.role ? `${user.role.charAt(0).toUpperCase()}${user.role.slice(1)}` : 'User'
        }));

        // Combine all suggestions
        allSuggestions.push(...reportSuggestions);
        allSuggestions.push(...claimSuggestions);
        allSuggestions.push(...userSuggestions);

        setSuggestions(allSuggestions);
        setError(null);
      } catch (err) {
        console.error('Search suggestions error:', err);
        setError(err.message);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs),
    [debounceMs, isDisabled]
  );

  // Update query and trigger search
  useEffect(() => {
    setQuery(initialQuery);
    
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debounced search
    if (initialQuery.trim()) {
      debouncedSearch(initialQuery);
    } else {
      setSuggestions([]);
      setIsLoading(false);
    }
  }, [initialQuery, debouncedSearch]);

  // Disable suggestions function
  const disableSuggestions = useCallback(() => {
    setIsDisabled(true);
    setSuggestions([]);
    setIsLoading(false);
    
    // Re-enable after a short delay to allow for navigation
    setTimeout(() => {
      setIsDisabled(false);
    }, 1000);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    query,
    suggestions,
    isLoading,
    error,
    isDisabled,
    disableSuggestions
  };
}

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default useHomeSearchSuggestions;
