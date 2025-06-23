import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function ProfilePictureUpdater() {
  const { user, setUser } = useAuth(); // assumes your context provides setUser
  const [newUrl, setNewUrl] = useState(user?.profilePictureUrl || "");
  const [status, setStatus] = useState("");

  const handleUpdate = async () => {
    setStatus("Updating...");
    try {
      const response = await fetch(`http://localhost:5050/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ profilePictureUrl: newUrl }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Update failed");

      setUser(data); // update context with new user info
      setStatus("Profile picture updated successfully!");
    } catch (err) {
      console.error(err);
      setStatus("Failed to update profile picture.");
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 mt-8 w-full max-w-md shadow-md">
      <h2 className="text-lg font-bold mb-2 text-gray-700">Update Profile Picture</h2>
      <input
    type="text"
    placeholder="Enter image URL"
    value={newUrl}
    onChange={(e) => setNewUrl(e.target.value)}
    className="w-full border border-gray-300 rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />

      <button
        onClick={handleUpdate}
        className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 transition"
      >
        Update Picture
      </button>
      {status && <p className="text-sm mt-2 text-center text-gray-600">{status}</p>}
    </div>
  );
}
