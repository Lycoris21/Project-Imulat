import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useHomeSearchSuggestions } from "../hooks/useHomeSearchSuggestions";

// Components
import { LoadingScreen, ErrorScreen, SearchBar, ReportCard, ClaimCard, UserCard, PaginationControls } from '../components';

export default function HomeSearch() {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    
    // Get search query from URL
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('q') || '';
    
    // Local state
    const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
    const [reports, setReports] = useState([]);
    const [claims, setClaims] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    
    // Pagination state for each section
    const [reportsPage, setReportsPage] = useState(1);
    const [claimsPage, setClaimsPage] = useState(1);
    const [usersPage, setUsersPage] = useState(1);
    const [reportsTotalPages, setReportsTotalPages] = useState(0);
    const [claimsTotalPages, setClaimsTotalPages] = useState(0);
    const [usersTotalPages, setUsersTotalPages] = useState(0);
    const [reportsTotal, setReportsTotal] = useState(0);
    const [claimsTotal, setClaimsTotal] = useState(0);
    const [usersTotal, setUsersTotal] = useState(0);
    
    const itemsPerPage = 10;
    const usersPerPage = 12;

    // Search suggestions for the search bar
    const {
        suggestions,
        isLoading: suggestionsLoading,
        isDisabled,
        disableSuggestions
    } = useHomeSearchSuggestions(localSearchQuery);

    // Calculate total results from API metadata
    const totalResults = reportsTotal + claimsTotal + usersTotal;

    // Fetch search results
    const fetchData = async (reportsPageNum = reportsPage, claimsPageNum = claimsPage, usersPageNum = usersPage) => {
        if (!searchQuery.trim()) {
            setReports([]);
            setClaims([]);
            setUsers([]);
            setReportsTotalPages(0);
            setClaimsTotalPages(0);
            setUsersTotalPages(0);
            setReportsTotal(0);
            setClaimsTotal(0);
            setUsersTotal(0);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Fetch reports with pagination
            const reportsResponse = await fetch(
                `http://localhost:5050/api/reports?search=${encodeURIComponent(searchQuery)}&page=${reportsPageNum}&limit=${itemsPerPage}`
            );
            
            // Fetch claims with pagination
            const claimsResponse = await fetch(
                `http://localhost:5050/api/claims?search=${encodeURIComponent(searchQuery)}&page=${claimsPageNum}&limit=${itemsPerPage}`
            );
            
            // Calculate pagination for users (since backend doesn't have pagination)
            const usersResponse = await fetch(`http://localhost:5050/api/users/search?q=${encodeURIComponent(searchQuery)}`);

            if (!reportsResponse.ok || !claimsResponse.ok || !usersResponse.ok) {
                throw new Error('Failed to fetch data');
            }
            
            const [reportsData, claimsData, allUsersData] = await Promise.all([
                reportsResponse.json(),
                claimsResponse.json(),
                usersResponse.json()
            ]);

            // Extract arrays from API responses
            // Reports and claims APIs return { reports: [], total: number, ... } or { claims: [], total: number, ... }
            // Users API returns array directly
            const reportsArray = reportsData.reports || [];
            const claimsArray = claimsData.claims || [];
            const allUsersArray = Array.isArray(allUsersData) ? allUsersData : [];
            
            // Handle users pagination manually (since backend doesn't support it)
            const usersStartIndex = (usersPageNum - 1) * usersPerPage;
            const usersEndIndex = usersStartIndex + usersPerPage;
            const paginatedUsers = allUsersArray.slice(usersStartIndex, usersEndIndex);
            const usersTotalPagesCalc = Math.ceil(allUsersArray.length / usersPerPage);
            
            setReports(reportsArray);
            setClaims(claimsArray);
            setUsers(paginatedUsers);
            setReportsTotalPages(reportsData.totalPages || 0);
            setClaimsTotalPages(claimsData.totalPages || 0);
            setUsersTotalPages(usersTotalPagesCalc);
            setReportsTotal(reportsData.total || 0);
            setClaimsTotal(claimsData.total || 0);
            setUsersTotal(allUsersArray.length);
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
            navigate(`/search?q=${encodeURIComponent(query)}`);
        } else {
            navigate('/search');
        }
    };

    const handleSearchChange = (e) => {
        setLocalSearchQuery(e.target.value);
    };

    // Pagination handlers
    const handleReportsPageChange = (newPage) => {
        setReportsPage(newPage);
        fetchData(newPage, claimsPage, usersPage);
    };

    const handleClaimsPageChange = (newPage) => {
        setClaimsPage(newPage);
        fetchData(reportsPage, newPage, usersPage);
    };

    const handleUsersPageChange = (newPage) => {
        setUsersPage(newPage);
        fetchData(reportsPage, claimsPage, newPage);
    };

    // Filter results based on active tab
    const getFilteredResults = () => {
        switch (activeTab) {
            case 'reports':
                return { reports, claims: [], users: [] };
            case 'claims':
                return { reports: [], claims, users: [] };
            case 'users':
                return { reports: [], claims: [], users };
            case 'all':
            default:
                return { reports, claims, users };
        }
    };

    const filteredResults = getFilteredResults();

    useEffect(() => {
        // Reset pagination when search query changes
        setReportsPage(1);
        setClaimsPage(1);
        setUsersPage(1);
        fetchData(1, 1, 1);
    }, [searchQuery]);

    useEffect(() => {
        setLocalSearchQuery(searchQuery);
    }, [searchQuery]);

    if (loading) {
        return <LoadingScreen message="Searching..." />;
    }

    return (
        <div className="min-h-[calc(100vh-5rem)] bg-base-gradient px-4 py-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-4">
                        {searchQuery ? `Search Results for "${searchQuery}"` : 'Search Everything'}
                    </h1>
                    
                    {/* Search Bar */}
                    <SearchBar
                        value={localSearchQuery}
                        onChange={handleSearchChange}
                        onSubmit={handleSearch}
                        placeholder="Search reports, claims, users, or topics..."
                        showDropdown={true}
                        suggestions={suggestions}
                        isLoading={suggestionsLoading}
                        isDisabled={isDisabled}
                        disableSuggestions={disableSuggestions}
                    />

                    {/* Stats and Tabs */}
                    {searchQuery && (
                        <>
                            <div className="flex items-center justify-center space-x-6 text-sm text-gray-300 mb-6">
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
                                    {usersTotal} users
                                </span>
                            </div>

                            {/* Filter Tabs */}
                            <div className="flex justify-center space-x-1 mb-8">
                                {[
                                    { key: 'all', label: 'All', count: totalResults },
                                    { key: 'reports', label: 'Reports', count: reportsTotal },
                                    { key: 'claims', label: 'Claims', count: claimsTotal },
                                    { key: 'users', label: 'Users', count: usersTotal }
                                ].map(({ key, label, count }) => (
                                    <button
                                        key={key}
                                        onClick={() => setActiveTab(key)}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                            activeTab === key
                                                ? 'bg-white text-dark'
                                                : 'bg-white/20 text-white hover:bg-white/30'
                                        }`}
                                    >
                                        {label} ({count})
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Error State */}
                {error && (
                    <div className="text-center py-12">
                        <div className="text-red-400 text-lg mb-4">{error}</div>
                        <button
                            onClick={fetchData}
                            className="px-6 py-3 bg-white text-[color:var(--color-dark)] rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* No Results */}
                {!loading && !error && searchQuery && totalResults === 0 && (
                    <div className="text-center py-12">
                        <div className="text-gray-300 text-lg mb-4">No results found</div>
                        <p className="text-gray-400">Try adjusting your search terms or browse our latest content</p>
                    </div>
                )}

                {/* Results */}
                {!loading && !error && (searchQuery ? totalResults > 0 : true) && (
                    <div className="space-y-8">
                        {/* Reports Section */}
                        {filteredResults.reports.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-xl p-6">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                                    Reports ({reportsTotal} total, page {reportsPage} of {reportsTotalPages})
                                </h2>
                                <div className="space-y-4">
                                    {filteredResults.reports.map((report) => (
                                        <ReportCard key={report._id} report={report} variant="compact" />
                                    ))}
                                </div>
                                <PaginationControls
                                    currentPage={reportsPage}
                                    totalPages={reportsTotalPages}
                                    onPageChange={handleReportsPageChange}
                                    className="justify-center"
                                />
                            </div>
                        )}

                        {/* Claims Section */}
                        {filteredResults.claims.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-xl p-6">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                                    Claims ({claimsTotal} total, page {claimsPage} of {claimsTotalPages})
                                </h2>
                                <div className="space-y-4">
                                    {filteredResults.claims.map((claim) => (
                                        <ClaimCard key={claim._id} claim={claim} variant="compact" />
                                    ))}
                                </div>
                                <PaginationControls
                                    currentPage={claimsPage}
                                    totalPages={claimsTotalPages}
                                    onPageChange={handleClaimsPageChange}
                                    className="justify-center"
                                />
                            </div>
                        )}

                        {/* Users Section */}
                        {filteredResults.users.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-xl p-6">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                                    Users ({usersTotal} total, page {usersPage} of {usersTotalPages})
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredResults.users.map((user) => (
                                        <UserCard key={user._id} user={user} variant="compact" />
                                    ))}
                                </div>
                                <PaginationControls
                                    currentPage={usersPage}
                                    totalPages={usersTotalPages}
                                    onPageChange={handleUsersPageChange}
                                    className="justify-center"
                                />
                            </div>
                        )}

                        {/* No results in current tab */}
                        {searchQuery && activeTab !== 'all' && 
                         filteredResults.reports.length === 0 && 
                         filteredResults.claims.length === 0 && 
                         filteredResults.users.length === 0 && (
                            <div className="text-center py-12">
                                <div className="text-gray-300 text-lg mb-4">
                                    No {activeTab} found for "{searchQuery}"
                                </div>
                                <button
                                    onClick={() => setActiveTab('all')}
                                    className="text-blue-400 hover:text-blue-300 underline"
                                >
                                    View all results
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
