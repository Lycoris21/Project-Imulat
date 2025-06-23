import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function ProfilePictureUpdater() {
  const { user, setUser } = useAuth(); // assumes your context provides setUser
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.profilePictureUrl || "");
  const [status, setStatus] = useState("");

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected)); // temporary preview
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus("Please select a file first.");
      return;
    }

    setStatus("Uploading...");
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(`http://localhost:5050/api/upload/profile-picture/${user.id}`, {
        method: "PUT",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Upload failed");

      setUser(data.user); // Update context with new user info (which includes profileImageUrl)
      setPreviewUrl(data.user.profilePictureUrl);
      setStatus("Profile picture updated successfully!");
    } catch (err) {
      console.error(err);
      setStatus("Failed to upload profile picture.");
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 mt-8 w-full max-w-md shadow-md">
      <h2 className="text-lg font-bold mb-2 text-gray-700">Update Profile Picture</h2>

      {previewUrl ? (
        <img
          src={previewUrl}
          alt="Preview"
          className="w-24 h-24 rounded-full object-cover mb-3 mx-auto"
        />
      ) : (
        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-3 mx-auto">
          <span className="text-gray-600 font-medium text-xl">
            {user.username?.charAt(0).toUpperCase() || "U"}
          </span>
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="w-full mb-3"
      />

      <button
        onClick={handleUpload}
        className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 transition"
      >
        Upload Picture
      </button>

      {status && <p className="text-sm mt-2 text-center text-gray-600">{status}</p>}
    </div>
  );
}
