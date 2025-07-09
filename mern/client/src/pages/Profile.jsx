import React, { useState, useEffect } from "react";
import { useParams, useLocation } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

// Components
import { LoadingScreen, ErrorScreen, ClaimCard, ReportCard, UserReactionBar, SuccessToast } from '../components';

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
    const CLAIM_LIMIT = 10;
    const REPORT_LIMIT = 10;

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
                    if (data.deletedAt != null) throw new Error("Failed to fetch user profile");

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
            <ErrorScreen title="User  Not Found" message="The user you're looking for doesn't exist." />
        );
    }

    return (
        <div className="min-h-[calc(100vh-5rem)] bg-base-gradient px-4 sm:px-6 lg:px-8 py-6 sm:pt-6 lg:pt-8 flex justify-center">
            {/* Success Notification */}
            <SuccessToast 
                message="Profile updated successfully!" 
                visible={showSuccessMessage} 
                onClose={() => setShowSuccessMessage(false)} 
            />

            <div className="w-full max-w-4xl bg-white rounded-lg sm:rounded-xl shadow-xl p-4 sm:p-6 lg:p-8">
                {/* Cover Photo */}
                <div className="relative h-32 sm:h-48 lg:h-60 bg-cover bg-center rounded-sm sm:rounded-md mb-4 sm:mb-6">
                    {profileData.coverPhotoUrl ? (
                        <div
                            className="absolute inset-0 bg-cover bg-center rounded-sm sm:rounded-md"
                            style={{ backgroundImage: `url(${profileData.coverPhotoUrl})` }}
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gray-300 flex items-center justify-center text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-600 uppercase rounded-sm sm:rounded-md">
                            {profileData.username?.charAt(0)}
                        </div>
                    )}
                </div>

                {/* Profile Info */}
                <div className="flex items-start justify-between mb-4 sm:mb-6 space-x-3">
                    <div className="flex items-center min-w-0 flex-1">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 mr-3 sm:mr-4 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                            {profileData.profilePictureUrl ? (
                                <img
                                    src={profileData.profilePictureUrl}
                                    alt={profileData.username}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-gray-600 font-medium text-xs sm:text-sm">
                                    {profileData.username?.charAt(0).toUpperCase() || "U"}
                                </span>
                            )}
                        </div>
                        <div className="min-w-0 flex-1 pr-3">
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">{profileData.username}</h1>
                            <p className="text-gray-500 text-sm sm:text-base">
                                {reactionCounts.likes} likes | {reactionCounts.dislikes} dislikes
                            </p>
                            <p className="italic text-sm sm:text-base text-gray-600 line-clamp-2 sm:line-clamp-3 break-words">{profileData.bio}</p>
                        </div>
                    </div>
                    <div className="flex justify-end flex-shrink-0">
                        {/* Show Edit Profile only for current user's own profile */}
                        {user && profileData && user._id === profileData._id ? (
                            <Link
                                to="/edit-profile"
                                className="text-center border-[0.5px] border-[color:var(--color-dark)] bg-white text-[color:var(--color-dark)] py-1 sm:py-2 px-3 sm:px-4 rounded hover:bg-[color:var(--color-dark)] hover:text-white hover:border-white transition-colors text-xs sm:text-sm whitespace-nowrap">
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
                    <div className="mt-6 sm:mt-8">
                        {/* Tabs */}
                        <div className="flex border-b mb-4 sm:mb-6 space-x-4 sm:space-x-6">
                            <button
                                onClick={() => setActiveTab("claims")}
                                className={`pb-2 text-sm sm:text-base font-medium transition-colors ${activeTab === "claims"
                                    ? "border-[color:var(--color-selected)] text-[color:var(--color-selected)] border-b-2"
                                    : "text-gray-500 hover:text-[color:var(--color-selected)] cursor-pointer"
                                    }`}
                            >
                                Claims ({profileData.claims.length})
                            </button>
                            <button
                                onClick={() => setActiveTab("reports")}
                                className={`pb-2 text-sm sm:text-base font-medium transition-colors ${activeTab === "reports"
                                    ? "border-[color:var(--color-selected)] text-[color:var(--color-selected)] border-b-2"
                                    : "text-gray-500 hover:text-[color:var(--color-selected)] cursor-pointer"
                                    }`}
                            >
                                Reports ({profileData.reports.length})
                            </button>
                        </div>

                        {/* Tab Content */}
                        {activeTab === "claims" && (
                            <div className="space-y-3 sm:space-y-4">
                                {profileData.claims.slice(0, CLAIM_LIMIT).map((claim) => (
                                    <ClaimCard key={claim._id} claim={claim} variant="simple" />
                                ))}
                                {profileData.claims.length > CLAIM_LIMIT && (
                                    <Link
                                        to={`/claims?user=${profileData._id}`}
                                        className="block w-fit mt-4 mx-auto text-sm font-semibold text-[color:var(--color-selected)] hover:underline"
                                    >
                                        See more claims by this user→
                                    </Link>
                                )}
                            </div>
                        )}

                        {activeTab === "reports" && (
                            <div className="space-y-3 sm:space-y-4">
                                {profileData.reports.slice(0, REPORT_LIMIT).map((report) => (
                                    <ReportCard key={report._id} report={report} variant="simple" />
                                ))}
                                {profileData.reports.length > REPORT_LIMIT && (
                                    <Link
                                        to={`/reports?user=${profileData._id}`}
                                        className="block w-fit mt-4 mx-auto text-sm font-semibold text-[color:var(--color-selected)] hover:underline"
                                    >
                                        See more reports by this user →
                                    </Link>
                                )}
                            </div>
                        )}

                    </div>
                ) : (
                    // Show just Claims if user is not researcher or has no reports
                    <div className="mt-6 sm:mt-8">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Claims</h2>
                        <div className="space-y-3 sm:space-y-4">
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