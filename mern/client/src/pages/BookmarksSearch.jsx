import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSearchSuggestions } from "../hooks/useSearchSuggestions";

// Components
import { LoadingScreen, ErrorScreen, SearchBar, ReportCard, ClaimCard, PaginationControls } from '../components';
import CollectionCard from '../components/bookmarks/CollectionCard';

export default function BookmarksSearch() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('q') || '';
    
    const [bookmarks, setBookmarks] = useState([]);
    const [reports, setReports] = useState([]);
    const [claims, setClaims] = useState([]);
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Pagination state for each section
    const [reportsPage, setReportsPage] = useState(1);
    const [claimsPage, setClaimsPage] = useState(1);
    const [collectionsPage, setCollectionsPage] = useState(1);
    const [reportsTotalPages, setReportsTotalPages] = useState(0);
    const [claimsTotalPages, setClaimsTotalPages] = useState(0);
    const [collectionsTotalPages, setCollectionsTotalPages] = useState(0);
    const [reportsTotal, setReportsTotal] = useState(0);
    const [claimsTotal, setClaimsTotal] = useState(0);
    const [collectionsTotal, setCollectionsTotal] = useState(0);
    
    const itemsPerPage = 10;
    const collectionsPerPage = 12;
    
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
    const fetchData = async (reportsPageNum = reportsPage, claimsPageNum = claimsPage, collectionsPageNum = collectionsPage) => {
        if (!user?._id) return;

        if (!searchQuery.trim()) {
            setBookmarks([]);
            setReports([]);
            setClaims([]);
            setCollections([]);
            setReportsTotalPages(0);
            setClaimsTotalPages(0);
            setCollectionsTotalPages(0);
            setReportsTotal(0);
            setClaimsTotal(0);
            setCollectionsTotal(0);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            
            // Fetch bookmarks and collections with pagination
            const [reportsResponse, claimsResponse, collectionsResponse] = await Promise.all([
                fetch(`http://localhost:5050/api/bookmarks/user/${user._id}/search/reports?search=${encodeURIComponent(searchQuery)}&page=${reportsPageNum}&limit=${itemsPerPage}&targetType=report&paginated=true`),
                fetch(`http://localhost:5050/api/bookmarks/user/${user._id}/search/claims?search=${encodeURIComponent(searchQuery)}&page=${claimsPageNum}&limit=${itemsPerPage}&targetType=claim&paginated=true`),
                fetch(`http://localhost:5050/api/bookmarks/collections/${user._id}?search=${encodeURIComponent(searchQuery)}&page=${collectionsPageNum}&limit=${collectionsPerPage}&paginated=true`)
            ]);
            
            if (!reportsResponse.ok || !claimsResponse.ok || !collectionsResponse.ok) {
                throw new Error('Failed to fetch data');
            }
            
            const [reportsData, claimsData, collectionsData] = await Promise.all([
                reportsResponse.json(),
                claimsResponse.json(),
                collectionsResponse.json()
            ]);

            console.log('BookmarksSearch API responses:', {
                reportsData,
                claimsData,
                collectionsData
            });

            // Extract arrays from API responses
            const reportsArray = reportsData.bookmarks || [];
            const claimsArray = claimsData.bookmarks || [];
            const collectionsArray = collectionsData.collections || collectionsData || [];
            
            // Set separate states for reports and claims
            setReports(reportsArray);
            setClaims(claimsArray);
            setCollections(Array.isArray(collectionsArray) ? collectionsArray : []);
            
            // Keep bookmarks for backward compatibility
            setBookmarks([...reportsArray, ...claimsArray]);
            
            // Set pagination data (handle nested pagination object)
            setReportsTotalPages(reportsData.pagination?.totalPages || 0);
            setClaimsTotalPages(claimsData.pagination?.totalPages || 0);
            setCollectionsTotalPages(collectionsData.totalPages || 0);
            setReportsTotal(reportsData.pagination?.totalItems || 0);
            setClaimsTotal(claimsData.pagination?.totalItems || 0);
            setCollectionsTotal(collectionsData.total || (Array.isArray(collectionsArray) ? collectionsArray.length : 0));
            
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

    // Pagination handlers
    const handleReportsPageChange = (newPage) => {
        setReportsPage(newPage);
        fetchData(newPage, claimsPage, collectionsPage);
    };

    const handleClaimsPageChange = (newPage) => {
        setClaimsPage(newPage);
        fetchData(reportsPage, newPage, collectionsPage);
    };

    const handleCollectionsPageChange = (newPage) => {
        setCollectionsPage(newPage);
        fetchData(reportsPage, claimsPage, newPage);
    };

    // Filter collections based on search
    const filteredCollections = searchQuery ? collections : [];

    // Use separate arrays for reports and claims
    const filteredReports = reports;
    const filteredClaims = claims;

    // Calculate total results from API metadata
    const totalResults = reportsTotal + claimsTotal + collectionsTotal;

    useEffect(() => {
        // Reset pagination when search query changes
        setReportsPage(1);
        setClaimsPage(1);
        setCollectionsPage(1);
        fetchData(1, 1, 1);
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
                                {reportsTotal} reports
                            </span>
                            <span>
                                {claimsTotal} claims
                            </span>
                            <span>
                                {collectionsTotal} collections
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
                        {reportsTotal > 0 && (
                            <div className="bg-white rounded-2xl shadow-xl p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        Reports ({reportsTotal})
                                    </h2>
                                </div>
                                <div className="space-y-4">
                                    {filteredReports.map((bookmark) => (
                                        <div key={`report-${bookmark.targetId._id}`}>
                                            <ReportCard report={bookmark.targetId} variant="compact" />
                                        </div>
                                    ))}
                                </div>
                                {reportsTotalPages > 1 && (
                                    <div className="flex justify-center mt-6">
                                        <PaginationControls
                                            currentPage={reportsPage}
                                            totalPages={reportsTotalPages}
                                            onPageChange={handleReportsPageChange}
                                            className="justify-center"
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Claims Section */}
                        {claimsTotal > 0 && (
                            <div className="bg-white rounded-2xl shadow-xl p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        Claims ({claimsTotal})
                                    </h2>
                                </div>
                                <div className="space-y-4">
                                    {filteredClaims.map((bookmark) => (
                                        <div key={`claim-${bookmark.targetId._id}`}>
                                            <ClaimCard claim={bookmark.targetId} variant="compact" />
                                        </div>
                                    ))}
                                </div>
                                {claimsTotalPages > 1 && (
                                    <div className="flex justify-center mt-6">
                                        <PaginationControls
                                            currentPage={claimsPage}
                                            totalPages={claimsTotalPages}
                                            onPageChange={handleClaimsPageChange}
                                            className="justify-center"
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Collections Section */}
                        {collectionsTotal > 0 && (
                            <div className="bg-white rounded-2xl shadow-xl p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        Collections ({collectionsTotal})
                                    </h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredCollections.map((collection) => (
                                        <CollectionCard
                                            key={collection._id}
                                            collection={collection}
                                            showActions={false}
                                        />
                                    ))}
                                </div>
                                {collectionsTotalPages > 1 && (
                                    <div className="flex justify-center mt-6">
                                        <PaginationControls
                                            currentPage={collectionsPage}
                                            totalPages={collectionsTotalPages}
                                            onPageChange={handleCollectionsPageChange}
                                            className="justify-center"
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
