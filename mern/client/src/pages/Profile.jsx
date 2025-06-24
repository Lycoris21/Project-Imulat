import React, { useState, useEffect} from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Profile() {
    const { user } = useAuth(); // access logged-in user
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user || !user._id) {
                console.error("User not authenticated");
                return;
            }

            try {
                const res = await fetch(`http://localhost:5050/api/users/${user._id}`);
                if (!res.ok) {
                    throw new Error("Failed to fetch user profile");
                }

                const data = await res.json();
                setProfileData(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching profile:", error);
            }
        };

        fetchProfile();
    }, [user]);

    if (loading || !profileData) {
        return (
            <div className="min-h-[calc(100vh-5rem)] bg-[linear-gradient(to_bottom,_#4B548B_0%,_#2F3558_75%,_#141625_100%)] flex items-center justify-center">
                <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-white text-lg">Loading claims...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-gradient px-4 pt-[0rem] flex justify-center">
            <div className="w-[1000px] bg-white rounded shadow-xl pt-0 p-8">

                <div className="relative h-60 bg-cover bg-center rounded-sm mb-6" style={{
                    backgroundImage: `url(${profileData.coverPhotoUrl})`,
                }}>
                    <Link
                        to="/EditProfile"
                        className="absolute bottom-4 right-4 bg-white text-black py-2 px-4 rounded hover:bg-[#1E275E] hover:text-white"
                    >
                        Edit Profile
                    </Link>

                    <div className="absolute -bottom-17 right-16 flex space-x-2">
                        <button className="bg-[#1E275E] text-white py-1 px-3 rounded hover:bg-blue-600 flex items-center cursor-pointer">
                            {/* srry for the long ass svgs */}
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                                <path d="M23 10C23 9.46957 22.7893 8.96086 22.4142 8.58579C22.0391 8.21071 21.5304 8 21 8H14.68L15.64 3.43C15.66 3.33 15.67 3.22 15.67 3.11C15.67 2.7 15.5 2.32 15.23 2.05L14.17 1L7.59 7.58C7.22 7.95 7 8.45 7 9V19C7 19.5304 7.21071 20.0391 7.58579 20.4142C7.96086 20.7893 8.46957 21 9 21H18C18.83 21 19.54 20.5 19.84 19.78L22.86 12.73C22.95 12.5 23 12.26 23 12V10ZM1 21H5V9H1V21Z" fill="white" />
                            </svg>
                            Like
                        </button>
                        <button className="bg-[#1E275E] text-white py-1 px-3 rounded hover:bg-blue-600 flex items-center cursor-pointer">
                            {/* srry for the long ass svgs */}
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                                <path d="M19 15H23V3H19M15 3H6C5.17 3 4.46 3.5 4.16 4.22L1.14 11.27C1.05 11.5 1 11.74 1 12V14C1 14.5304 1.21071 15.0391 1.58579 15.4142C1.96086 15.7893 2.46957 16 3 16H9.31L8.36 20.57C8.34 20.67 8.33 20.77 8.33 20.88C8.33 21.3 8.5 21.67 8.77 21.94L9.83 23L16.41 16.41C16.78 16.05 17 15.55 17 15V5C17 4.46957 16.7893 3.96086 16.4142 3.58579C16.0391 3.21071 15.5304 3 15 3Z" fill="white" />
                            </svg>
                            Dislike
                        </button>
                    </div>
                </div>

                {/* Profile Info */}
                <div className="flex items-center mb-6">
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


                {/* Claims Section */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Claims</h2>
                    <div className="space-y-4">
                        {profileData.claims.map((claim) => (
                            <div key={claim._id} className="bg-white rounded-lg shadow-md p-4 border-none flex">
                            <Link
                                to={`/claims/${claim._id}`}
                                className="flex-1 hover:text-blue-600 cursor-pointer"
                            >
                                <div className="flex justify-start items-center">
                                <h3 className="text-lg font-semibold transition-colors">
                                    {claim.claimTitle}
                                </h3>
                                {claim.reportId && (
                                    <span className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded">
                                    <svg
                                        width="22"
                                        height="22"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="mr-1"
                                        style={{ verticalAlign: "middle" }}
                                    >
                                        <path
                                        d="M14.172 2H10C8.114 2 7.172 2 6.586 2.586C6 3.172 6 4.114 6 6V16C6 17.886 6 18.828 6.586 19.414C7.172 20 8.114 20 10 20H16C17.886 20 18.828 20 19.414 19.414C20 18.828 20 17.886 20 16V7.828C20 7.42 20 7.215 19.924 7.032C19.848 6.849 19.704 6.703 19.414 6.414L15.586 2.586C15.296 2.296 15.152 2.152 14.969 2.076C14.785 2 14.58 2 14.172 2Z"
                                        stroke="#2563EB"
                                        strokeWidth="2"
                                        />
                                        <path
                                        d="M10 12H16M10 16H14"
                                        stroke="#2563EB"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        />
                                        <path
                                        d="M14 2V6C14 6.943 14 7.414 14.293 7.707C14.586 8 15.057 8 16 8H20"
                                        stroke="#2563EB"
                                        strokeWidth="2"
                                        />
                                    </svg>
                                    Report Available
                                    </span>
                                )}
                                </div>
                                <p className="text-gray-600 mt-2">{claim.aiClaimSummary}</p>
                            </Link>
                            </div>

                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}