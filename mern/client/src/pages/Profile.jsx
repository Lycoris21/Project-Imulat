import React, { useState, useEffect } from "react";
import { useParams, useLocation } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

// Components
import { LoadingScreen, ErrorScreen, ClaimCard, ReportCard, UserReactionBar } from '../components';

export default function Profile() {
    const { user } = useAuth();
    const { id } = useParams();
    const location = useLocation();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("claims");
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [reactionCounts, setReactionCounts] = useState({ likes: 0, dislikes: 0 });

    const canResearch = user?.role === "admin" || user?.role === "researcher";
    const CLAIM_LIMIT = 1;
    const REPORT_LIMIT = 1;

    // Check for profile update success
    useEffect(() => {
        if (location.state?.profileUpdated) {
            setShowSuccessMessage(true);
            // Clear the state to prevent showing again on refresh
            window.history.replaceState({}, document.title);
            // Hide message after 4 seconds
            const timer = setTimeout(() => {
                setShowSuccessMessage(false);
            }, 7000);
            return () => clearTimeout(timer);
        }
    }, [location.state]);

    useEffect(() => {
        let isMounted = true;

        setLoading(true);
        setProfileData(null); // clear old data

        const fetchProfile = async () => {
            const targetUserId = id || user?._id;
            if (!targetUserId) return;

            try {
                const res = await fetch(`http://localhost:5050/api/users/${targetUserId}`);
                if (!res.ok) throw new Error("Failed to fetch user profile");
                const data = await res.json();

                if (isMounted) {
                    setProfileData(data);
                    setReactionCounts({ likes: data.likes || 0, dislikes: data.dislikes || 0 });
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
                if (isMounted) setLoading(false);
            }
        };

        fetchProfile();

        return () => {
            isMounted = false;
        };
    }, [user, id]);

    // Handle reaction updates from UserReactionBar
    const handleReactionUpdate = (newLikes, newDislikes) => {
        setReactionCounts({ likes: newLikes, dislikes: newDislikes });
    };


    if (loading) {
        return (
            <LoadingScreen message="Loading profile..." />
        );
    }

    if (!profileData) {
        return (
            <ErrorScreen title="User Not Found" message="The user you're looking for doesn't exist." />
        );
    }

    return (
        <div className="min-h-screen bg-base-gradient px-4 pt-[0rem] flex justify-center">
            {/* Success Notification */}
            {showSuccessMessage && (
                <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 animate-slide-in">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Profile updated successfully!</span>
                    <button
                        onClick={() => setShowSuccessMessage(false)}
                        className="ml-2 text-green-200 hover:text-white"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            )}

            <div className="w-[1000px] bg-white rounded shadow-xl pt-0 p-8">

                <div className="relative h-60 bg-cover bg-center rounded-sm mb-6" style={{
                    backgroundImage: `url(${profileData.coverPhotoUrl})`,
                }}>
                </div>

                {/* Profile Info */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <div className="w-16 h-16 mr-4 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                            {profileData.profilePictureUrl ? (
                                <img
                                    src={profileData.profilePictureUrl}
                                    alt={profileData.username}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-gray-600 font-medium text-sm">
                                    {profileData.username?.charAt(0).toUpperCase() || "U"}
                                </span>
                            )}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">{profileData.username}</h1>
                            <p className="text-gray-500">
                                {reactionCounts.likes} likes | {reactionCounts.dislikes} dislikes
                            </p>
                            <p className="italic">{profileData.bio}</p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        {/* Show Edit Profile only for current user's own profile */}
                        {user && profileData && user._id === profileData._id ? (
                            <Link
                                to="/edit-profile"
                                className="border-[0.5px] border-[color:var(--color-dark)] bg-white text-[color:var(--color-dark)] py-1 px-4 rounded hover:bg-[color:var(--color-dark)] hover:text-white hover:border-white">
                                Edit Profile
                            </Link>
                        ) : (
                            /* Show Like/Dislike for other users' profiles */
                            <UserReactionBar
                                targetUserId={profileData._id}
                                initialLikes={reactionCounts.likes}
                                initialDislikes={reactionCounts.dislikes}
                                onReactionUpdate={handleReactionUpdate}
                            />
                        )}
                    </div>
                </div>

                {/* Claims / Reports Tabs */}
                {(canResearch && Array.isArray(profileData.reports) && profileData.reports.length > 0) ? (
                    <div className="mt-8">
                        {/* Tabs */}
                        <div className="flex border-b mb-4 space-x-4 ">
                            <button
                                onClick={() => setActiveTab("claims")}
                                className={`pb-2 text-sm font-medium transition-colors ${activeTab === "claims"
                                    ? "border-[color:var(--color-selected)] text-[color:var(--color-selected)] border-b-2"
                                    : "text-gray-500 hover:text-[color:var(--color-selected)] cursor-pointer"
                                    }`}
                            >
                                Claims ({profileData.claims.length})
                            </button>
                            <button
                                onClick={() => setActiveTab("reports")}
                                className={`pb-2 text-sm font-medium transition-colors ${activeTab === "reports"
                                    ? "border-[color:var(--color-selected)] text-[color:var(--color-selected)] border-b-2 "
                                    : "text-gray-500 hover:text-[color:var(--color-selected)] cursor-pointer"
                                    }`}
                            >
                                Reports ({profileData.reports.length})
                            </button>
                        </div>

                        {/* Tab Content */}
                        {activeTab === "claims" && (
                            <div className="space-y-4">
                                {profileData.claims.slice(0, CLAIM_LIMIT).map((claim) => (
                                    <ClaimCard key={claim._id} claim={claim} variant="simple" />
                                ))}
                                {profileData.claims.length > CLAIM_LIMIT && (
                                    <Link
                                        to={`/claims?user=${profileData._id}`}
                                        className="block w-fit mt-4 mx-auto text-sm font-semibold text-[color:var(--color-selected)] hover:underline"
                                    >
                                        See more claims →
                                    </Link>
                                )}
                            </div>
                        )}

                        {activeTab === "reports" && (
                            <div className="space-y-4">
                                {profileData.reports.slice(0, REPORT_LIMIT).map((report) => (
                                    <ReportCard key={report._id} report={report} variant="simple" />
                                ))}
                                {profileData.reports.length > REPORT_LIMIT && (
                                    <Link
                                        to={`/reports?user=${profileData._id}`}
                                        className="block w-fit mt-4 mx-auto text-sm font-semibold text-[color:var(--color-selected)] hover:underline"
                                    >
                                        See more reports →
                                    </Link>
                                )}
                            </div>
                        )}

                    </div>
                ) : (
                    // Show just Claims if user is not researcher or has no reports
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Claims</h2>
                        <div className="space-y-4">
                            {profileData.claims.slice(0, CLAIM_LIMIT).map((claim) => (
                                <ClaimCard key={claim._id} claim={claim} variant="simple" />
                            ))}
                            {profileData.claims.length > CLAIM_LIMIT && (
                                <Link
                                    to={`/claims?user=${profileData._id}`}
                                    className="block w-fit mt-4 mx-auto text-sm font-semibold text-[color:var(--color-selected)] hover:underline"
                                >
                                    See more claims →
                                </Link>
                            )}
                        </div>
                    </div>

                )}
            </div>
        </div>
    );
}