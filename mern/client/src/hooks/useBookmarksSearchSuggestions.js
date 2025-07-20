import { useState, useEffect, useCallback, useRef } from "react";

export function useBookmarksSearchSuggestions(initialQuery = "", debounceMs = 300) {
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

        // Fetch both reports and claims in parallel
        const [reportsResponse, claimsResponse] = await Promise.all([
          fetch(`http://localhost:5050/api/reports?search=${encodeURIComponent(searchQuery)}&limit=8`),
          fetch(`http://localhost:5050/api/claims?search=${encodeURIComponent(searchQuery)}&limit=8`)
        ]);

        if (!reportsResponse.ok || !claimsResponse.ok) {
          throw new Error('Failed to fetch suggestions');
        }

        const [reportsData, claimsData] = await Promise.all([
          reportsResponse.json(),
          claimsResponse.json()
        ]);

        // Format reports for suggestions
        const reportSuggestions = (reportsData.reports || reportsData)
          .map(report => ({
            _id: report._id,
            title: report.reportTitle,
            description: report.reportDescription || report.aiReportSummary || `Verdict: ${report.truthVerdict}`,
            type: 'report'
          }));

        // Format claims for suggestions
        const claimSuggestions = (claimsData.claims || claimsData)
          .map(claim => ({
            _id: claim._id,
            title: claim.claimTitle,
            description: claim.aiClaimSummary || `Truth Index: ${claim.aiTruthIndex || 0}%`,
            type: 'claim'
          }));

        // Distribute suggestions: max 4 each, but allow overflow if one has fewer
        let finalReportSuggestions = reportSuggestions.slice(0, 4);
        let finalClaimSuggestions = claimSuggestions.slice(0, 4);

        const totalUsed = finalReportSuggestions.length + finalClaimSuggestions.length;
        const remainingSlots = 8 - totalUsed;

        // If we have remaining slots, fill them from whichever type has more results
        if (remainingSlots > 0) {
          if (finalReportSuggestions.length < 4 && claimSuggestions.length > 4) {
            // Add more claims if reports are less than 4
            const additionalClaims = claimSuggestions.slice(4, 4 + remainingSlots);
            finalClaimSuggestions = [...finalClaimSuggestions, ...additionalClaims];
          } else if (finalClaimSuggestions.length < 4 && reportSuggestions.length > 4) {
            // Add more reports if claims are less than 4
            const additionalReports = reportSuggestions.slice(4, 4 + remainingSlots);
            finalReportSuggestions = [...finalReportSuggestions, ...additionalReports];
          }
        }

        // Combine suggestions - interleave reports and claims for better distribution
        const allSuggestions = [];
        const maxLength = Math.max(finalReportSuggestions.length, finalClaimSuggestions.length);
        
        for (let i = 0; i < maxLength; i++) {
          if (i < finalReportSuggestions.length) {
            allSuggestions.push(finalReportSuggestions[i]);
          }
          if (i < finalClaimSuggestions.length) {
            allSuggestions.push(finalClaimSuggestions[i]);
          }
        }

        // Only set suggestions if still enabled
        if (!isDisabled) {
          setSuggestions(allSuggestions.slice(0, 8)); // Ensure max 8
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
