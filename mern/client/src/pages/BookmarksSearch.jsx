import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSearchSuggestions } from "../hooks/useSearchSuggestions";

// Components
import { LoadingScreen, ErrorScreen, SearchBar, ReportCard, ClaimCard } from '../components';
import CollectionCard from '../components/bookmarks/CollectionCard';

export default function BookmarksSearch() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('q') || '';
    
    const [bookmarks, setBookmarks] = useState([]);
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Search functionality with suggestions
    const {
        query: localSearchQuery,
        updateQuery: setLocalSearchQuery,
        suggestions,
        isLoading: suggestionsLoading
    } = useSearchSuggestions(searchQuery);

    // Redirect if not logged in
    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    // Fetch data
    const fetchData = async () => {
        if (!user?._id) return;

        try {
            setLoading(true);
            
            // Fetch bookmarks and collections in parallel
            const [bookmarksResponse, collectionsResponse] = await Promise.all([
                fetch(`http://localhost:5050/api/bookmarks/user/${user._id}${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`),
                fetch(`http://localhost:5050/api/bookmarks/collections/${user._id}`)
            ]);
            
            if (!bookmarksResponse.ok || !collectionsResponse.ok) {
                throw new Error('Failed to fetch data');
            }
            
            const [bookmarksData, collectionsData] = await Promise.all([
                bookmarksResponse.json(),
                collectionsResponse.json()
            ]);

            setBookmarks(bookmarksData);
            setCollections(collectionsData);
            setError(null);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load search results');
        } finally {
            setLoading(false);
        }
    };

    // Handle search
    const handleSearch = (e) => {
        e.preventDefault();
        const query = localSearchQuery;
        if (query.trim()) {
            navigate(`/bookmarks/search?q=${encodeURIComponent(query)}`);
        } else {
            navigate('/bookmarks/search');
        }
    };

    const handleSearchChange = (e) => {
        setLocalSearchQuery(e.target.value);
    };

    // Filter collections based on search
    const filteredCollections = collections.filter(collection => {
        if (!searchQuery.trim()) return false; // Only show collections when there's a search query
        
        const searchLower = searchQuery.toLowerCase();
        return collection.collectionName?.toLowerCase().includes(searchLower);
    });

    // Filter bookmarks for display (server already filtered if search query exists)
    const filteredBookmarks = searchQuery ? bookmarks : [];

    useEffect(() => {
        fetchData();
    }, [user?._id, searchQuery]);

    useEffect(() => {
        setLocalSearchQuery(searchQuery);
    }, [searchQuery]);

    if (!user) {
        return null; // Will redirect in useEffect
    }

    if (loading) {
        return <LoadingScreen message="Searching your bookmarks..." />;
    }

    if (error) {
        return (
            <ErrorScreen 
                title="Error Loading Search Results" 
                message={error}
                onRetry={fetchData}
            />
        );
    }

    const totalResults = filteredBookmarks.length + filteredCollections.length;

    return (
        <div className="min-h-screen bg-base-gradient py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center mb-4">
                        <Link
                            to="/bookmarks"
                            className="inline-flex items-center text-white hover:text-gray-300 mr-4"
                        >
                            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Bookmarks
                        </Link>
                    </div>
                    
                    <h1 className="text-3xl font-bold text-white mb-4">
                        {searchQuery ? `Search Results for "${searchQuery}"` : 'Search Bookmarks'}
                    </h1>
                    
                    {/* Search Bar */}
                    <SearchBar
                        value={localSearchQuery}
                        onChange={handleSearchChange}
                        onSubmit={handleSearch}
                        placeholder="Search bookmarks and collections..."
                        showDropdown={true}
                        suggestions={suggestions}
                        isLoading={suggestionsLoading}
                    />

                    {/* Stats */}
                    {searchQuery && (
                        <div className="flex items-center justify-center space-x-6 text-sm text-gray-300">
                            <span>
                                {totalResults} {totalResults === 1 ? 'result' : 'results'} found
                            </span>
                            <span>
                                {filteredBookmarks.filter(b => b.targetType === 'report').length} reports
                            </span>
                            <span>
                                {filteredBookmarks.filter(b => b.targetType === 'claim').length} claims
                            </span>
                            <span>
                                {filteredCollections.length} collections
                            </span>
                        </div>
                    )}
                </div>

                {/* Content */}
                {!searchQuery ? (
                    <div className="text-center py-12">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-300 mb-2">
                            Search your bookmarks and collections
                        </h3>
                        <p className="text-gray-500">
                            Enter a search term to find bookmarks and collections
                        </p>
                    </div>
                ) : totalResults === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-300 mb-2">
                            No results found
                        </h3>
                        <p className="text-gray-500">
                            Try adjusting your search terms
                        </p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Reports Section */}
                        {filteredBookmarks.filter(b => b.targetType === 'report').length > 0 && (
                            <div className="bg-white rounded-2xl shadow-xl p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        Reports ({filteredBookmarks.filter(b => b.targetType === 'report').length})
                                    </h2>
                                </div>
                                <div className="space-y-4">
                                    {filteredBookmarks
                                        .filter(bookmark => bookmark.targetType === 'report')
                                        .map((bookmark) => (
                                            <div key={`report-${bookmark.targetId._id}`}>
                                                <ReportCard report={bookmark.targetId} variant="compact" />
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        )}

                        {/* Claims Section */}
                        {filteredBookmarks.filter(b => b.targetType === 'claim').length > 0 && (
                            <div className="bg-white rounded-2xl shadow-xl p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        Claims ({filteredBookmarks.filter(b => b.targetType === 'claim').length})
                                    </h2>
                                </div>
                                <div className="space-y-4">
                                    {filteredBookmarks
                                        .filter(bookmark => bookmark.targetType === 'claim')
                                        .map((bookmark) => (
                                            <div key={`claim-${bookmark.targetId._id}`}>
                                                <ClaimCard claim={bookmark.targetId} variant="compact" />
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        )}

                        {/* Collections Section */}
                        {filteredCollections.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-xl p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        Collections ({filteredCollections.length})
                                    </h2>
                                </div>
                                <div className="space-y-4">
                                    {filteredCollections.map((collection) => (
                                        <CollectionCard
                                            key={collection._id}
                                            collection={collection}
                                            showActions={false}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
