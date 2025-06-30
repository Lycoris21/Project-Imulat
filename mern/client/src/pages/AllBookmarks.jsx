import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Components
import { LoadingScreen, ErrorScreen, SearchBar, ReportCard, ClaimCard } from '../components';

export default function AllBookmarks() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('q') || '';
    
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

    // Redirect if not logged in
    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    // Fetch bookmarks
    const fetchBookmarks = async () => {
        if (!user?._id) return;

        try {
            setLoading(true);
            let url = `http://localhost:5050/api/bookmarks/user/${user._id}`;
            
            if (searchQuery) {
                url += `?search=${encodeURIComponent(searchQuery)}`;
            }
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Failed to fetch bookmarks');
            }
            
            const data = await response.json();
            setBookmarks(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching bookmarks:', err);
            setError('Failed to load bookmarks');
        } finally {
            setLoading(false);
        }
    };

    // Remove bookmark
    const handleRemoveBookmark = async (bookmark) => {
        if (!window.confirm('Are you sure you want to remove this bookmark?')) {
            return;
        }

        try {
            const response = await fetch('http://localhost:5050/api/bookmarks', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user._id,
                    targetId: bookmark.targetId._id,
                    targetType: bookmark.targetType,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to remove bookmark');
            }

            // Remove from local state
            setBookmarks(prev => prev.filter(b => 
                !(b.targetId._id === bookmark.targetId._id && b.targetType === bookmark.targetType)
            ));
        } catch (error) {
            console.error('Error removing bookmark:', error);
            alert('Failed to remove bookmark');
        }
    };

    // Handle search change for local filtering only
    const handleSearchChange = (e) => {
        setLocalSearchQuery(e.target.value);
    };

    // No-op for form submission since we only do local filtering
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        // Do nothing - search is handled in real-time by filtering
    };

    useEffect(() => {
        fetchBookmarks();
    }, [user?._id, searchQuery]);

    useEffect(() => {
        setLocalSearchQuery(searchQuery);
    }, [searchQuery]);

    // Filter bookmarks locally for real-time search
    const filteredBookmarks = bookmarks.filter(bookmark => {
        if (!localSearchQuery || typeof localSearchQuery !== 'string' || !localSearchQuery.trim()) return true;
        
        const searchLower = localSearchQuery.toLowerCase();
        const target = bookmark.targetId;
        
        return (
            target.reportTitle?.toLowerCase().includes(searchLower) ||
            target.claimTitle?.toLowerCase().includes(searchLower) ||
            target.reportContent?.toLowerCase().includes(searchLower) ||
            target.claimContent?.toLowerCase().includes(searchLower) ||
            target.reportDescription?.toLowerCase().includes(searchLower) ||
            target.aiReportSummary?.toLowerCase().includes(searchLower) ||
            target.aiClaimSummary?.toLowerCase().includes(searchLower)
        );
    });

    // Use the server search results if there's a URL search query, otherwise use local filtering
    const displayBookmarks = searchQuery ? bookmarks : filteredBookmarks;

    if (!user) {
        return null; // Will redirect in useEffect
    }

    if (loading) {
        return <LoadingScreen message="Loading your bookmarks..." />;
    }

    if (error) {
        return (
            <ErrorScreen 
                title="Error Loading Bookmarks" 
                message={error}
                onRetry={fetchBookmarks}
            />
        );
    }

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
                        {searchQuery ? `Search Results for "${searchQuery}"` : 'All Bookmarks'}
                    </h1>
                    
                    {/* Search Bar */}
                    <SearchBar
                        value={localSearchQuery}
                        onChange={handleSearchChange}
                        onSubmit={handleSearchSubmit}
                        placeholder="Search your bookmarks..."
                        disableSuggestions={true}
                    />

                    {/* Stats */}
                    <div className="flex items-center justify-center space-x-6 text-sm text-gray-300">
                        <span>
                            {displayBookmarks.length} {displayBookmarks.length === 1 ? 'bookmark' : 'bookmarks'} 
                            {(searchQuery || localSearchQuery) ? ' found' : ' total'}
                        </span>
                        <span>
                            {displayBookmarks.filter(b => b.targetType === 'report').length} reports
                        </span>
                        <span>
                            {displayBookmarks.filter(b => b.targetType === 'claim').length} claims
                        </span>
                    </div>
                </div>

                {/* Content */}
                {displayBookmarks.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-12 h-12 text-[color:var(--color-base)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-300 mb-2">
                            {(searchQuery || localSearchQuery) ? 'No bookmarks found' : 'No bookmarks yet'}
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {(searchQuery || localSearchQuery)
                                ? 'Try adjusting your search terms'
                                : 'Start bookmarking reports and claims to see them here'
                            }
                        </p>
                        {searchQuery && (
                            <Link
                                to="/bookmarks/all"
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                View All Bookmarks
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Reports Section */}
                        <div className="bg-white rounded-2xl shadow-xl p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">
                                    Reports ({displayBookmarks.filter(b => b.targetType === 'report').length})
                                </h2>
                            </div>
                            <div className="space-y-4">
                                {displayBookmarks
                                    .filter(bookmark => bookmark.targetType === 'report')
                                    .map((bookmark) => (
                                        <div key={`report-${bookmark.targetId._id}`} className="relative group">
                                            <ReportCard report={bookmark.targetId} variant="compact" />
                                            <button
                                                onClick={() => handleRemoveBookmark(bookmark)}
                                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                                                title="Remove bookmark"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))
                                }
                                {displayBookmarks.filter(b => b.targetType === 'report').length === 0 && (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500">
                                            {(searchQuery || localSearchQuery) ? "No reports found matching your search" : "No bookmarked reports found"}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Claims Section */}
                        <div className="bg-white rounded-2xl shadow-xl p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">
                                    Claims ({displayBookmarks.filter(b => b.targetType === 'claim').length})
                                </h2>
                            </div>
                            <div className="space-y-4">
                                {displayBookmarks
                                    .filter(bookmark => bookmark.targetType === 'claim')
                                    .map((bookmark) => (
                                        <div key={`claim-${bookmark.targetId._id}`} className="relative group">
                                            <ClaimCard claim={bookmark.targetId} variant="compact" />
                                            <button
                                                onClick={() => handleRemoveBookmark(bookmark)}
                                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                                                title="Remove bookmark"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))
                                }
                                {displayBookmarks.filter(b => b.targetType === 'claim').length === 0 && (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500">
                                            {(searchQuery || localSearchQuery) ? "No claims found matching your search" : "No bookmarked claims found"}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
