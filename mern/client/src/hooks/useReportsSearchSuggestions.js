import { useState, useEffect, useCallback, useRef } from "react";

export function useReportsSearchSuggestions(initialQuery = "", debounceMs = 300) {
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

        // Fetch reports and users in parallel
        const [reportsResponse, usersResponse] = await Promise.all([
          fetch(`http://localhost:5050/api/reports?search=${encodeURIComponent(searchQuery)}&limit=5`),
          fetch(`http://localhost:5050/api/users/search?query=${encodeURIComponent(searchQuery)}&limit=3`)
        ]);

        if (!reportsResponse.ok || !usersResponse.ok) {
          throw new Error('Failed to fetch suggestions');
        }

        const [reportsData, usersData] = await Promise.all([
          reportsResponse.json(),
          usersResponse.json()
        ]);

        // Format reports for suggestions
        const reportSuggestions = (reportsData.reports || reportsData)
          .slice(0, 5)
          .map(report => ({
            _id: report._id,
            title: report.reportTitle,
            description: report.reportDescription || report.aiReportSummary || `Verdict: ${report.truthVerdict}`,
            type: 'report'
          }));

        // Format users for suggestions
        const userSuggestions = (usersData.users || usersData)
          .slice(0, 3)
          .map(user => ({
            _id: user._id,
            title: user.username,
            name: user.username,
            description: `${user.role || 'User'} • ${user.reportsCreated || 0} reports`,
            type: 'user'
          }));

        // Combine suggestions - prioritize reports first, then users
        const allSuggestions = [
          ...reportSuggestions,
          ...userSuggestions
        ].slice(0, 8); // Limit total suggestions

        // Only set suggestions if still enabled
        if (!isDisabled) {
          setSuggestions(allSuggestions);
        }
      } catch (err) {
        console.error('Error fetching suggestions:', err);
        setError('Failed to load suggestions');
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs),
    [debounceMs, isDisabled]
  );

  // Trigger debounced search when query changes
  useEffect(() => {
    if (query.trim() && !isDisabled) {
      setIsLoading(true);
      debouncedSearch(query);
    } else {
      setSuggestions([]);
      setIsLoading(false);
    }
  }, [query, debouncedSearch, isDisabled]);

  const updateQuery = (newQuery) => {
    setQuery(newQuery);
    setIsDisabled(false); // Re-enable when user starts typing again
  };

  const clearSuggestions = () => {
    setSuggestions([]);
    setIsLoading(false);
  };

  const disableSuggestions = () => {
    setIsDisabled(true);
    setSuggestions([]);
    setIsLoading(false);
    
    // Clear any pending debounced calls
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const enableSuggestions = () => {
    setIsDisabled(false);
  };

  return {
    query,
    updateQuery,
    suggestions,
    isLoading,
    error,
    clearSuggestions,
    disableSuggestions,
    enableSuggestions
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
