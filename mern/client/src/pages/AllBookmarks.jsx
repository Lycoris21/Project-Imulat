import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Components
import { LoadingScreen, ErrorScreen, SearchBar } from '../components';
import BookmarkSection from '../components/bookmarks/BookmarkSection';

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

    // Handle search
    const handleSearch = (query) => {
        setLocalSearchQuery(query);
        if (query.trim()) {
            navigate(`/bookmarks/all?q=${encodeURIComponent(query)}`);
        } else {
            navigate('/bookmarks/all');
        }
    };

    useEffect(() => {
        fetchBookmarks();
    }, [user?._id, searchQuery]);

    useEffect(() => {
        setLocalSearchQuery(searchQuery);
    }, [searchQuery]);

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
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 mr-4"
                        >
                            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Bookmarks
                        </Link>
                    </div>
                    
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        {searchQuery ? `Search Results for "${searchQuery}"` : 'All Bookmarks'}
                    </h1>
                    
                    {/* Search Bar */}
                    <div className="mb-6">
                        <SearchBar 
                            onSearch={handleSearch}
                            placeholder="Search your bookmarks..."
                            value={localSearchQuery}
                            onChange={setLocalSearchQuery}
                        />
                    </div>

                    {/* Stats */}
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <span>
                            {bookmarks.length} {bookmarks.length === 1 ? 'bookmark' : 'bookmarks'} total
                        </span>
                        <span>
                            {bookmarks.filter(b => b.targetType === 'report').length} reports
                        </span>
                        <span>
                            {bookmarks.filter(b => b.targetType === 'claim').length} claims
                        </span>
                    </div>
                </div>

                {/* Content */}
                {bookmarks.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {searchQuery ? 'No bookmarks found' : 'No bookmarks yet'}
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {searchQuery 
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
                    <div className="space-y-8">
                        <BookmarkSection
                            title="Reports"
                            bookmarks={bookmarks}
                            onRemoveBookmark={handleRemoveBookmark}
                            emptyMessage="No bookmarked reports found"
                        />
                        
                        <BookmarkSection
                            title="Claims"
                            bookmarks={bookmarks}
                            onRemoveBookmark={handleRemoveBookmark}
                            emptyMessage="No bookmarked claims found"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
