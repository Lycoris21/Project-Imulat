import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ProfilePictureUpdater from "../components/ProfilePictureUpdater.jsx"; // adjust path as needed



export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [imageUrl, setImageUrl] = useState(user?.profilePictureUrl || "");
  const [message, setMessage] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center text-white">
        <p>Loading user info...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-gradient flex flex-col justify-center items-center text-center px-4">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">Welcome, {user.username}</h1>

      <ProfilePictureUpdater />

      <button
        onClick={handleLogout}
        className="mt-6 px-6 py-3 bg-red-600 text-white font-semibold rounded-2xl shadow hover:bg-red-700 transition"
      >
        Log Out
      </button>
    </div>
  );
}
