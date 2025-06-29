import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../context/AuthContext";

export function useSearchSuggestions(initialQuery = "", debounceMs = 300) {
  const { user } = useAuth();
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDisabled, setIsDisabled] = useState(false);
  const timeoutRef = useRef(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery) => {
      if (!searchQuery.trim() || !user?._id || isDisabled) {
        setSuggestions([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch both bookmarks and collections in parallel
        const [bookmarksResponse, collectionsResponse] = await Promise.all([
          fetch(`http://localhost:5050/api/bookmarks/user/${user._id}?search=${encodeURIComponent(searchQuery)}&limit=5`),
          fetch(`http://localhost:5050/api/bookmarks/collections/${user._id}`)
        ]);

        if (!bookmarksResponse.ok || !collectionsResponse.ok) {
          throw new Error('Failed to fetch suggestions');
        }

        const [bookmarksData, collectionsData] = await Promise.all([
          bookmarksResponse.json(),
          collectionsResponse.json()
        ]);

        // Filter collections by search query
        const filteredCollections = collectionsData
          .filter(collection => 
            collection.collectionName.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .slice(0, 3)
          .map(collection => ({
            _id: collection._id,
            name: collection.collectionName,
            title: collection.collectionName,
            description: `${collection.bookmarkCount || 0} bookmarks`,
            type: 'collection'
          }));

        // Take limited bookmarks and add type and format for suggestions
        const limitedBookmarks = bookmarksData
          .slice(0, 5)
          .map(bookmark => {
            const target = bookmark.targetId || bookmark.target;
            return {
              _id: target._id,
              title: target.reportTitle || target.claimTitle,
              description: target.reportDescription || target.aiReportSummary || target.aiClaimSummary,
              type: bookmark.targetType
            };
          });

        // Combine and prioritize collections first, then bookmarks
        const allSuggestions = [
          ...filteredCollections,
          ...limitedBookmarks
        ].slice(0, 8); // Limit total suggestions

        // Only set suggestions if still enabled (not disabled due to navigation)
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
    [user?._id, debounceMs, isDisabled]
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
