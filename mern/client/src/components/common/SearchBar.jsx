import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = "Search...",
  showDropdown = false,
  suggestions = [],
  onSuggestionClick,
  isLoading = false,
  disableSuggestions,
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [hasBeenClicked, setHasBeenClicked] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setSelectedIndex(-1);
        setIsInputFocused(false);
        setHasBeenClicked(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Show dropdown only when input is focused AND clicked AND has suggestions
  useEffect(() => {
    if (showDropdown && suggestions.length > 0 && value.trim() && 
        isInputFocused && hasBeenClicked && !disableSuggestions) {
      setIsDropdownOpen(true);
    } else {
      setIsDropdownOpen(false);
    }
    setSelectedIndex(-1);
  }, [showDropdown, suggestions, value, isInputFocused, hasBeenClicked, disableSuggestions]);

  const handleInputChange = (e) => {
    onChange(e);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!isDropdownOpen || suggestions.length === 0) {
      if (e.key === "Enter") {
        handleSubmit(e);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        } else {
          handleSubmit(e);
        }
        break;
      case "Escape":
        setIsDropdownOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsDropdownOpen(false);
    setSelectedIndex(-1);
    setIsInputFocused(false);
    setHasBeenClicked(false);
    
    // Blur the input to remove focus
    if (inputRef.current) {
      inputRef.current.blur();
    }
    
    if (onSubmit) {
      onSubmit(e);
    } else if (value.trim()) {
      // Default behavior: navigate to search page
      navigate(`/bookmarks/search?q=${encodeURIComponent(value.trim())}`);
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    setIsDropdownOpen(false);
    setSelectedIndex(-1);
    setIsInputFocused(false);
    setHasBeenClicked(false);
    
    // Disable suggestions to prevent them from reopening
    if (disableSuggestions) {
      disableSuggestions();
    }
    
    if (onSuggestionClick) {
      onSuggestionClick(suggestion);
    } else {
      // Default behavior based on suggestion type
      if (suggestion.type === 'collection') {
        navigate(`/bookmarks/collection/${suggestion._id}`);
      } else if (suggestion.type === 'report') {
        navigate(`/reports/${suggestion._id}`);
      } else if (suggestion.type === 'claim') {
        navigate(`/claims/${suggestion._id}`);
      }
    }
  };

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'collection':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
          </svg>
        );
      case 'report':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-6a1 1 0 00-1-1H9a1 1 0 00-1 1v6a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
          </svg>
        );
      case 'claim':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto mb-4 relative" ref={dropdownRef}>
      <form onSubmit={handleSubmit}>
        <div className="relative flex">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={(e) => {
              e.target.select();
              setIsInputFocused(true);
            }}
            onClick={(e) => {
              e.target.select();
              setHasBeenClicked(true);
              setIsInputFocused(true);
            }}
            onBlur={() => {
              setIsInputFocused(false);
              // Don't reset hasBeenClicked here to allow for keyboard navigation
            }}
            placeholder={placeholder}
            className="w-full px-6 py-4 text-lg rounded-l-2xl text-white border border-gray-300 focus:ring-2 focus:ring-dark focus:outline-none"
            autoComplete="off"
          />
          <button
            type="submit"
            className="px-8 py-4 bg-white border border-l-0 border-gray-300 text-dark font-semibold rounded-r-2xl hover:bg-gray-50 transition cursor-pointer"
          >
            {isLoading ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        </div>
      </form>

      {/* Dropdown Suggestions */}
      {isDropdownOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.type}-${suggestion._id}`}
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent input blur
                handleSuggestionSelect(suggestion);
              }}
              className={`px-4 py-3 flex items-center space-x-3 cursor-pointer transition-colors ${
                index === selectedIndex 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'hover:bg-gray-50 text-gray-700'
              } ${index === 0 ? 'rounded-t-xl' : ''} ${
                index === suggestions.length - 1 ? 'rounded-b-xl' : 'border-b border-gray-100'
              }`}
            >
              <div className={`flex-shrink-0 ${
                index === selectedIndex ? 'text-blue-500' : 'text-gray-400'
              }`}>
                {getSuggestionIcon(suggestion.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">
                  {suggestion.title || suggestion.name}
                </div>
                {suggestion.description && (
                  <div className="text-sm text-gray-500 truncate">
                    {suggestion.description}
                  </div>
                )}
              </div>
              <div className="flex-shrink-0 text-xs text-gray-400 capitalize">
                {suggestion.type}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
