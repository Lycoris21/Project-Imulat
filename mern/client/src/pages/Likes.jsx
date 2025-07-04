import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Components
import { LoadingScreen, ErrorScreen, ReportCard, ClaimCard, PaginationControls } from '../components';
import CommentCard from '../components/common/CommentCard';
import UserCard from '../components/common/UserCard';

export default function Likes() {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [sectionLoading, setSectionLoading] = useState({
        reports: false,
        claims: false,
        comments: false,
        users: false
    });
    const [error, setError] = useState(null);
    
    // Pagination state for each section
    const [reportsPagination, setReportsPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        limit: 6
    });
    const [claimsPagination, setClaimsPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        limit: 6
    });
    const [commentsPagination, setCommentsPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        limit: 6
    });
    const [usersPagination, setUsersPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        limit: 6
    });
    
    // Data for each section
    const [reports, setReports] = useState([]);
    const [claims, setClaims] = useState([]);
    const [comments, setComments] = useState([]);
    const [users, setUsers] = useState([]);

    // Redirect if not logged in
    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    // Fetch data for specific section and page
    const fetchSectionData = async (sectionType, page = 1) => {
        if (!user?._id) return;

        try {
            const limit = 6;
            let response;
            
            switch (sectionType) {
                case 'reports':
                    response = await fetch(
                        `http://localhost:5050/api/reactions/user-likes/${user._id}/report?page=${page}&limit=${limit}`
                    );
                    break;
                case 'claims':
                    response = await fetch(
                        `http://localhost:5050/api/reactions/user-likes/${user._id}/claim?page=${page}&limit=${limit}`
                    );
                    break;
                case 'comments':
                    response = await fetch(
                        `http://localhost:5050/api/reactions/user-likes/${user._id}/comment?page=${page}&limit=${limit}`
                    );
                    break;
                case 'users':
                    response = await fetch(
                        `http://localhost:5050/api/reactions/user-likes/${user._id}/user?page=${page}&limit=${limit}`
                    );
                    break;
                default:
                    throw new Error('Invalid section type');
            }
            
            if (!response.ok) {
                throw new Error(`Failed to fetch ${sectionType} data`);
            }
            
            const data = await response.json();
            
            console.log(`${sectionType} data:`, data);
            
            // Extract targetId from each item (backend returns reaction objects with populated targetId)
            const items = (data.items || []).map(item => item.targetId).filter(item => item && item._id);
            
            console.log(`${sectionType} items after extraction:`, items);
            
            switch (sectionType) {
                case 'reports':
                    setReports(items);
                    setReportsPagination(prev => ({
                        ...prev,
                        currentPage: data.currentPage || page,
                        totalPages: data.totalPages || 1,
                        totalCount: data.totalCount || 0
                    }));
                    break;
                case 'claims':
                    setClaims(items);
                    setClaimsPagination(prev => ({
                        ...prev,
                        currentPage: data.currentPage || page,
                        totalPages: data.totalPages || 1,
                        totalCount: data.totalCount || 0
                    }));
                    break;
                case 'comments':
                    setComments(items);
                    setCommentsPagination(prev => ({
                        ...prev,
                        currentPage: data.currentPage || page,
                        totalPages: data.totalPages || 1,
                        totalCount: data.totalCount || 0
                    }));
                    break;
                case 'users':
                    setUsers(items);
                    setUsersPagination(prev => ({
                        ...prev,
                        currentPage: data.currentPage || page,
                        totalPages: data.totalPages || 1,
                        totalCount: data.totalCount || 0
                    }));
                    break;
            }
        } catch (err) {
            console.error(`Error fetching ${sectionType} data:`, err);
            throw err;
        }
    };

    // Main fetch function
    const fetchData = async () => {
        if (!user?._id) return;

        try {
            setLoading(true);
            
            // Fetch all sections in parallel
            await Promise.all([
                fetchSectionData('reports', 1),
                fetchSectionData('claims', 1),
                fetchSectionData('comments', 1),
                fetchSectionData('users', 1)
            ]);
            
            setError(null);
        } catch (err) {
            console.error('Error fetching likes data:', err);
            setError('Failed to load your likes');
        } finally {
            setLoading(false);
        }
    };

    // Page change handlers
    const handleReportsPageChange = async (page) => {
        try {
            setSectionLoading(prev => ({ ...prev, reports: true }));
            await fetchSectionData('reports', page);
        } catch (err) {
            setError('Failed to load reports page');
        } finally {
            setSectionLoading(prev => ({ ...prev, reports: false }));
        }
    };

    const handleClaimsPageChange = async (page) => {
        try {
            setSectionLoading(prev => ({ ...prev, claims: true }));
            await fetchSectionData('claims', page);
        } catch (err) {
            setError('Failed to load claims page');
        } finally {
            setSectionLoading(prev => ({ ...prev, claims: false }));
        }
    };

    const handleCommentsPageChange = async (page) => {
        try {
            setSectionLoading(prev => ({ ...prev, comments: true }));
            await fetchSectionData('comments', page);
        } catch (err) {
            setError('Failed to load comments page');
        } finally {
            setSectionLoading(prev => ({ ...prev, comments: false }));
        }
    };

    const handleUsersPageChange = async (page) => {
        try {
            setSectionLoading(prev => ({ ...prev, users: true }));
            await fetchSectionData('users', page);
        } catch (err) {
            setError('Failed to load users page');
        } finally {
            setSectionLoading(prev => ({ ...prev, users: false }));
        }
    };

    // Calculate total results
    const totalResults = (reportsPagination.totalCount || 0) + (claimsPagination.totalCount || 0) + 
                        (commentsPagination.totalCount || 0) + (usersPagination.totalCount || 0);

    useEffect(() => {
        fetchData();
    }, [user?._id]);

    if (!user) {
        return null; // Will redirect in useEffect
    }

    if (loading) {
        return <LoadingScreen message="Loading your likes..." />;
    }

    if (error) {
        return (
            <ErrorScreen 
                title="Error Loading Likes" 
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
                    <h1 className="text-3xl font-bold text-white mb-4">
                        Your Likes
                    </h1>
                    
                    {/* Stats */}
                    <div className="flex items-center justify-center space-x-6 text-sm text-gray-300">
                        <span>
                            {totalResults} {totalResults === 1 ? 'item' : 'items'} liked
                        </span>
                        <span>
                            {reportsPagination.totalCount || 0} reports
                        </span>
                        <span>
                            {claimsPagination.totalCount || 0} claims
                        </span>
                        <span>
                            {commentsPagination.totalCount || 0} comments
                        </span>
                        <span>
                            {usersPagination.totalCount || 0} users
                        </span>
                    </div>
                </div>

                {/* Content */}
                {totalResults === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L9 7m5 3v10M9 7H6m3 0l-3 3" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-300 mb-2">
                            No likes yet
                        </h3>
                        <p className="text-gray-500">
                            Start exploring and like content that interests you
                        </p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Reports Section */}
                        {((reportsPagination.totalCount || 0) > 0 || sectionLoading.reports) && (
                            <div className="bg-white rounded-2xl shadow-xl p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        Liked Reports ({reportsPagination.totalCount || 0})
                                    </h2>
                                </div>
                                {sectionLoading.reports ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        <span className="ml-2 text-gray-600">Loading reports...</span>
                                    </div>
                                ) : (reportsPagination.totalCount || 0) > 0 ? (
                                    <>
                                        <div className="space-y-4">
                                            {reports.map((report) => (
                                                <div key={`report-${report._id}`}>
                                                    <ReportCard report={report} variant="compact" />
                                                </div>
                                            ))}
                                        </div>
                                        {(reportsPagination.totalPages || 1) > 1 && (
                                            <div className="mt-6">
                                                <PaginationControls
                                                    currentPage={reportsPagination.currentPage || 1}
                                                    totalPages={reportsPagination.totalPages || 1}
                                                    onPageChange={handleReportsPageChange}
                                                    className="justify-center"
                                                />
                                            </div>
                                        )}
                                    </>
                                ) : null}
                            </div>
                        )}

                        {/* Claims Section */}
                        {((claimsPagination.totalCount || 0) > 0 || sectionLoading.claims) && (
                            <div className="bg-white rounded-2xl shadow-xl p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        Liked Claims ({claimsPagination.totalCount || 0})
                                    </h2>
                                </div>
                                {sectionLoading.claims ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        <span className="ml-2 text-gray-600">Loading claims...</span>
                                    </div>
                                ) : (claimsPagination.totalCount || 0) > 0 ? (
                                    <>
                                        <div className="space-y-4">
                                            {claims.map((claim) => (
                                                <div key={`claim-${claim._id}`}>
                                                    <ClaimCard claim={claim} variant="compact" />
                                                </div>
                                            ))}
                                        </div>
                                        {(claimsPagination.totalPages || 1) > 1 && (
                                            <div className="mt-6">
                                                <PaginationControls
                                                    currentPage={claimsPagination.currentPage || 1}
                                                    totalPages={claimsPagination.totalPages || 1}
                                                    onPageChange={handleClaimsPageChange}
                                                    className="justify-center"
                                                />
                                            </div>
                                        )}
                                    </>
                                ) : null}
                            </div>
                        )}

                        {/* Comments Section */}
                        {((commentsPagination.totalCount || 0) > 0 || sectionLoading.comments) && (
                            <div className="bg-white rounded-2xl shadow-xl p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        Liked Comments ({commentsPagination.totalCount || 0})
                                    </h2>
                                </div>
                                {sectionLoading.comments ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        <span className="ml-2 text-gray-600">Loading comments...</span>
                                    </div>
                                ) : (commentsPagination.totalCount || 0) > 0 ? (
                                    <>
                                        <div className="space-y-4">
                                            {comments.map((comment) => (
                                                <div key={`comment-${comment._id}`}>
                                                    <CommentCard comment={comment} variant="compact" />
                                                </div>
                                            ))}
                                        </div>
                                        {(commentsPagination.totalPages || 1) > 1 && (
                                            <div className="mt-6">
                                                <PaginationControls
                                                    currentPage={commentsPagination.currentPage || 1}
                                                    totalPages={commentsPagination.totalPages || 1}
                                                    onPageChange={handleCommentsPageChange}
                                                    className="justify-center"
                                                />
                                            </div>
                                        )}
                                    </>
                                ) : null}
                            </div>
                        )}

                        {/* Users Section */}
                        {((usersPagination.totalCount || 0) > 0 || sectionLoading.users) && (
                            <div className="bg-white rounded-2xl shadow-xl p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        Liked Users ({usersPagination.totalCount || 0})
                                    </h2>
                                </div>
                                {sectionLoading.users ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        <span className="ml-2 text-gray-600">Loading users...</span>
                                    </div>
                                ) : (usersPagination.totalCount || 0) > 0 ? (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {users.map((user) => (
                                                <div key={`user-${user._id}`}>
                                                    <UserCard user={user} variant="compact" />
                                                </div>
                                            ))}
                                        </div>
                                        {(usersPagination.totalPages || 1) > 1 && (
                                            <div className="mt-6">
                                                <PaginationControls
                                                    currentPage={usersPagination.currentPage || 1}
                                                    totalPages={usersPagination.totalPages || 1}
                                                    onPageChange={handleUsersPageChange}
                                                    className="justify-center"
                                                />
                                            </div>
                                        )}
                                    </>
                                ) : null}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
