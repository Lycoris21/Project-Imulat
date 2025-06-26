import React, { useState, useEffect} from "react";
import { useParams } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

// Components
import { LoadingScreen, ErrorScreen, ClaimCard, ReportCard  } from '../components';

export default function Profile() {
    const { user } = useAuth();
    const { id } = useParams();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("claims");

    const isAdmin = user?.role === "admin";

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


    if (loading) {
        return (
            <LoadingScreen message = "Loading profile..."/>
        );
    }

    if (!profileData){
        return (
            <ErrorScreen title="User Not Found" message="The user you're looking for doesn't exist."/>
        );
    }

    return (
        <div className="min-h-screen bg-base-gradient px-4 pt-[0rem] flex justify-center">
            <div className="w-[1000px] bg-white rounded shadow-xl pt-0 p-8">

                <div className="relative h-60 bg-cover bg-center rounded-sm mb-6" style={{
                    backgroundImage: `url(${profileData.coverPhotoUrl})`,
                }}>
                </div>

                {/* Profile Info */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <img
                            src={profileData.profilePictureUrl}
                            alt={`${profileData.username}'s profile`}
                            className="w-16 h-16 rounded-full mr-4"
                        />
                        <div>
                            <h1 className="text-3xl font-bold">{profileData.username}</h1>
                            <p className="text-gray-500">
                                {profileData.likes} likes | {profileData.dislikes} dislikes
                            </p>
                            <p className="italic">{profileData.bio}</p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        {/* Show Edit Profile only for current user's own profile */}
                        {user && profileData && user._id === profileData._id ? (
                            <Link
                                to="/EditProfile"
                                className="border-[0.5px] border-dark bg-white text-dark py-1 px-4 rounded hover:bg-dark hover:text-white hover:border-white">
                                Edit Profile
                            </Link>
                        ) : (
                            /* Show Like/Dislike for other users' profiles */
                            <>
                                <button className="bg-dark text-white py-1 px-3 rounded hover:bg-base flex items-center cursor-pointer">
                                    {/* srry for the long ass svgs */}
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                                        <path d="M23 10C23 9.46957 22.7893 8.96086 22.4142 8.58579C22.0391 8.21071 21.5304 8 21 8H14.68L15.64 3.43C15.66 3.33 15.67 3.22 15.67 3.11C15.67 2.7 15.5 2.32 15.23 2.05L14.17 1L7.59 7.58C7.22 7.95 7 8.45 7 9V19C7 19.5304 7.21071 20.0391 7.58579 20.4142C7.96086 20.7893 8.46957 21 9 21H18C18.83 21 19.54 20.5 19.84 19.78L22.86 12.73C22.95 12.5 23 12.26 23 12V10ZM1 21H5V9H1V21Z" fill="white" />
                                    </svg>
                                    Like
                                </button>
                                <button className="bg-dark text-white py-1 px-3 rounded hover:bg-base flex items-center cursor-pointer">
                                    {/* srry for the long ass svgs */}
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                                        <path d="M19 15H23V3H19M15 3H6C5.17 3 4.46 3.5 4.16 4.22L1.14 11.27C1.05 11.5 1 11.74 1 12V14C1 14.5304 1.21071 15.0391 1.58579 15.4142C1.96086 15.7893 2.46957 16 3 16H9.31L8.36 20.57C8.34 20.67 8.33 20.77 8.33 20.88C8.33 21.3 8.5 21.67 8.77 21.94L9.83 23L16.41 16.41C16.78 16.05 17 15.55 17 15V5C17 4.46957 16.7893 3.96086 16.4142 3.58579C16.0391 3.21071 15.5304 3 15 3Z" fill="white" />
                                    </svg>
                                    Dislike
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Claims / Reports Tabs */}
                {(isAdmin && Array.isArray(profileData.reports) && profileData.reports.length > 0) ? (
                <div className="mt-8">
                    {/* Tabs */}
                    <div className="flex border-b mb-4 space-x-4">
                    <button
                        onClick={() => setActiveTab("claims")}
                        className={`pb-2 text-sm font-medium transition-colors ${
                        activeTab === "claims"
                            ? "border-b-2 border-selected text-selected"
                            : "text-gray-500 hover:text-selected"
                        }`}
                    >
                        Claims ({profileData.claims.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("reports")}
                        className={`pb-2 text-sm font-medium transition-colors ${
                        activeTab === "reports"
                            ? "border-b-2 border-selected text-selected"
                            : "text-gray-500 hover:text-selected"
                        }`}
                    >
                        Reports ({profileData.reports.length})
                    </button>
                    </div>

                    {/* Tab Content */}
                   {/* Tab Content */}
                    {activeTab === "claims" && (
                    <div className="space-y-4">
                        {profileData.claims.map((claim) => (
                        <ClaimCard key={claim._id} claim={claim} variant="simple" />
                        ))}
                    </div>
                    )}

                    {activeTab === "reports" && (
                    <div className="space-y-4">
                        {profileData.reports.map((report) => (
                        <ReportCard key={report._id} report={report} variant="simple" />
                        ))}
                    </div>
                    )}
                </div>
                ) : (
                // Show just Claims if user is not admin or has no reports
                <div className="mt-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Claims</h2>
                    <div className="space-y-4">
                    {profileData.claims.map((claim) => (
                        <ClaimCard key={claim._id} claim={claim} variant="simple" />
                    ))}
                    </div>
                </div>
                )}


            </div>
        </div>
    );
}