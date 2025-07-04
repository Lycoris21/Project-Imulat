import React, { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Components
import { LoadingScreen, ErrorScreen, SearchBar, ReportCard, ClaimCard, PaginationControls } from '../components';
import CreateCollectionModal from '../components/bookmarks/CreateCollectionModal';
import AlertModal from '../components/modals/AlertModal';

export default function CollectionView() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { collectionId } = useParams();
    
    const [collection, setCollection] = useState(null);
    const [reportsData, setReportsData] = useState({ bookmarks: [], pagination: {} });
    const [claimsData, setClaimsData] = useState({ bookmarks: [], pagination: {} });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeSearchQuery, setActiveSearchQuery] = useState(""); // The actual search query used for fetching
    const [alert, setAlert] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'error'
    });
    
    // Pagination state
    const [reportsPage, setReportsPage] = useState(1);
    const [claimsPage, setClaimsPage] = useState(1);
    const itemsPerPage = 10;

    // Redirect if not logged in
    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    // Fetch paginated bookmarks for a specific type
    const fetchBookmarksByType = async (targetType, page) => {
        if (!user?._id || !collectionId) return { bookmarks: [], pagination: {} };

        try {
            const params = new URLSearchParams({
                paginated: 'true',
                page: page.toString(),
                limit: itemsPerPage.toString(),
                targetType,
                collectionId
            });

            if (activeSearchQuery.trim()) {
                params.append('search', activeSearchQuery.trim());
            }

            const url = `http://localhost:5050/api/bookmarks/user/${user._id}?${params}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Failed to fetch bookmarks');
            }
            
            const data = await response.json();
            return data;
        } catch (err) {
            console.error(`Error fetching ${targetType} bookmarks:`, err);
            throw err;
        }
    };

    // Fetch collection details and bookmarks
    const fetchData = async () => {
        if (!user?._id || !collectionId) return;

        try {
            setLoading(true);
            
            // Fetch collection details and bookmarks in parallel
            const [collectionsResponse, reportsResult, claimsResult] = await Promise.all([
                fetch(`http://localhost:5050/api/bookmarks/collections/${user._id}`),
                fetchBookmarksByType('report', reportsPage),
                fetchBookmarksByType('claim', claimsPage)
            ]);
            
            if (!collectionsResponse.ok) {
                throw new Error('Failed to fetch data');
            }
            
            const collectionsData = await collectionsResponse.json();

            // Find the specific collection
            const currentCollection = collectionsData.find(c => c._id === collectionId);
            if (!currentCollection) {
                throw new Error('Collection not found');
            }

            setCollection(currentCollection);
            setReportsData(reportsResult);
            setClaimsData(claimsResult);
            setError(null);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.message || 'Failed to load collection');
        } finally {
            setLoading(false);
        }
    };

    // Update collection
    const handleUpdateCollection = async (collectionData) => {
        try {
            const response = await fetch(`http://localhost:5050/api/bookmarks/collections/${collectionId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user._id,
                    collectionName: collectionData.name,
                    collectionBanner: collectionData.bannerUrl,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update collection');
            }

            await fetchData();
        } catch (error) {
            throw error;
        }
    };

    // Delete collection
    const handleDeleteCollection = async () => {
        if (!window.confirm(`Are you sure you want to delete "${collection.collectionName}"? This will move all bookmarks in this collection to "All Bookmarks".`)) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5050/api/bookmarks/collections/${collectionId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: user._id }),
            });

            if (!response.ok) {
                throw new Error('Failed to delete collection');
            }

            navigate('/bookmarks');
        } catch (error) {
            console.error('Error deleting collection:', error);
            setAlert({
                isOpen: true,
                title: 'Delete Failed',
                message: 'Failed to delete collection',
                type: 'error'
            });
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

            // Refresh the appropriate type's data
            if (bookmark.targetType === 'report') {
                const updatedReportsData = await fetchBookmarksByType('report', reportsPage);
                setReportsData(updatedReportsData);
            } else if (bookmark.targetType === 'claim') {
                const updatedClaimsData = await fetchBookmarksByType('claim', claimsPage);
                setClaimsData(updatedClaimsData);
            }
        } catch (error) {
            console.error('Error removing bookmark:', error);
            setAlert({
                isOpen: true,
                title: 'Remove Failed',
                message: 'Failed to remove bookmark',
                type: 'error'
            });
        }
    };

    // Handle search change and submit like Reports/Claims pages
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    // Handle search submit - trigger new fetch
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setActiveSearchQuery(searchQuery);
        setReportsPage(1);
        setClaimsPage(1);
    };

    // Effect for handling search changes (reset to page 1)
    useEffect(() => {
        setReportsPage(1);
        setClaimsPage(1);
    }, [activeSearchQuery]);

    // Effect for fetching data when page or active search changes
    useEffect(() => {
        fetchData();
    }, [user?._id, collectionId, activeSearchQuery, reportsPage, claimsPage]);

    // Pagination helpers - now use server data directly
    const getReportsBookmarks = () => {
        return reportsData.bookmarks || [];
    };

    const getClaimsBookmarks = () => {
        return claimsData.bookmarks || [];
    };

    const getTotalReportsPages = () => {
        return reportsData.pagination?.totalPages || 1;
    };

    const getTotalClaimsPages = () => {
        return claimsData.pagination?.totalPages || 1;
    };

    // Pagination handlers - trigger new API calls
    const handleReportsPageChange = async (newPage) => {
        setReportsPage(newPage);
        try {
            const updatedReportsData = await fetchBookmarksByType('report', newPage);
            setReportsData(updatedReportsData);
        } catch (err) {
            console.error('Error fetching reports page:', err);
        }
    };

    const handleClaimsPageChange = async (newPage) => {
        setClaimsPage(newPage);
        try {
            const updatedClaimsData = await fetchBookmarksByType('claim', newPage);
            setClaimsData(updatedClaimsData);
        } catch (err) {
            console.error('Error fetching claims page:', err);
        }
    };

    if (!user) {
        return null; // Will redirect in useEffect
    }

    if (loading) {
        return <LoadingScreen message="Loading collection..." />;
    }

    if (error) {
        return (
            <ErrorScreen 
                title="Error Loading Collection" 
                message={error}
                onRetry={fetchData}
            />
        );
    }

    if (!collection) {
        return (
            <ErrorScreen 
                title="Collection Not Found" 
                message="The collection you're looking for doesn't exist."
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
                    
                    {/* Banner Section */}
                    {collection.collectionBanner && (
                        <div className="h-60 bg-gray-200 rounded-lg overflow-hidden mb-6">
                            <img 
                                src={collection.collectionBanner} 
                                alt={`${collection.collectionName} banner`}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                    
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center mb-2">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                                    </svg>
                                </div>
                                <h1 className="text-3xl font-bold text-white">
                                    {collection.collectionName}
                                </h1>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                            <button
                                onClick={() => setShowEditModal(true)}
                                className="inline-flex items-center px-3 py-2 border bg-white border-gray-300 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                            </button>
                            
                            <button
                                onClick={handleDeleteCollection}
                                className="inline-flex items-center px-3 py-2 border bg-white border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                            >
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                Delete
                            </button>
                        </div>
                    </div>
                    
                    {/* Search Bar */}
                    <SearchBar
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onSubmit={handleSearchSubmit}
                        placeholder="Search in this collection..."
                        disableSuggestions={true}
                    />

                    {/* Stats */}
                    <div className="flex items-center justify-center space-x-6 text-sm text-gray-300">
                        <span>
                            {activeSearchQuery 
                                ? `${(reportsData.pagination?.totalItems || 0) + (claimsData.pagination?.totalItems || 0)} bookmarks found`
                                : `${(reportsData.pagination?.totalItems || 0) + (claimsData.pagination?.totalItems || 0)} bookmarks in collection`
                            }
                        </span>
                        <span>
                            {activeSearchQuery 
                                ? `${reportsData.pagination?.totalItems || 0} reports`
                                : `${reportsData.pagination?.totalItems || 0} reports`
                            }
                        </span>
                        <span>
                            {activeSearchQuery 
                                ? `${claimsData.pagination?.totalItems || 0} claims`
                                : `${claimsData.pagination?.totalItems || 0} claims`
                            }
                        </span>
                    </div>
                </div>

                {/* Content */}
                {(reportsData.pagination?.totalItems || 0) + (claimsData.pagination?.totalItems || 0) === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-12 h-12 text-[color:var(--color-base)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-300 mb-2">
                            {activeSearchQuery ? 'No bookmarks found' : 'Collection is empty'}
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {activeSearchQuery 
                                ? 'Try adjusting your search terms'
                                : 'Start adding bookmarks to this collection'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Reports Section */}
                        <div className="bg-white rounded-2xl shadow-xl p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">
                                    Reports ({activeSearchQuery 
                                        ? `${reportsData.pagination?.totalItems || 0} found`
                                        : `${reportsData.pagination?.totalItems || 0} total`
                                    }, page {reportsPage} of {getTotalReportsPages()})
                                </h2>
                            </div>
                            <div className="space-y-4">
                                {getReportsBookmarks().map((bookmark) => (
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
                                {getReportsBookmarks().length === 0 && (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500">
                                            {activeSearchQuery ? "No reports found matching your search" : "No reports in this collection"}
                                        </p>
                                    </div>
                                )}
                            </div>
                            {getReportsBookmarks().length > 0 && getTotalReportsPages() > 1 && (
                                <PaginationControls
                                    currentPage={reportsPage}
                                    totalPages={getTotalReportsPages()}
                                    onPageChange={handleReportsPageChange}
                                    className="justify-center"
                                />
                            )}
                        </div>

                        {/* Claims Section */}
                        <div className="bg-white rounded-2xl shadow-xl p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">
                                    Claims ({activeSearchQuery 
                                        ? `${claimsData.pagination?.totalItems || 0} found`
                                        : `${claimsData.pagination?.totalItems || 0} total`
                                    }, page {claimsPage} of {getTotalClaimsPages()})
                                </h2>
                            </div>
                            <div className="space-y-4">
                                {getClaimsBookmarks().map((bookmark) => (
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
                                {getClaimsBookmarks().length === 0 && (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500">
                                            {activeSearchQuery ? "No claims found matching your search" : "No claims in this collection"}
                                        </p>
                                    </div>
                                )}
                            </div>
                            {getClaimsBookmarks().length > 0 && getTotalClaimsPages() > 1 && (
                                <PaginationControls
                                    currentPage={claimsPage}
                                    totalPages={getTotalClaimsPages()}
                                    onPageChange={handleClaimsPageChange}
                                    className="justify-center"
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Collection Modal */}
            <CreateCollectionModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                onCreate={handleUpdateCollection}
                collection={collection}
            />

            <AlertModal
                isOpen={alert.isOpen}
                onClose={() => setAlert(prev => ({ ...prev, isOpen: false }))}
                title={alert.title}
                message={alert.message}
                type={alert.type}
            />
        </div>
    );
}
