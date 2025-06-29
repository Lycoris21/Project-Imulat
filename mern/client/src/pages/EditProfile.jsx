import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate} from "react-router-dom";

// Components
import { LoadingScreen, ErrorScreen, ConfirmPasswordModal } from '../components';

export default function EditProfile() {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    birthdate: "",
    bio: "",
    coverPhotoUrl: "",
    profilePictureUrl: ""
  });

  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        username: user?.username || "",
        email: user?.email || "",
        birthdate: user?.birthdate ? user.birthdate.slice(0, 10) : "",
        bio: user?.bio || "",
        coverPhotoUrl: user?.coverPhotoUrl || "",
        profilePictureUrl: user?.profilePictureUrl || ""
      });
      setPreviewUrl(user?.profilePictureUrl || "");
    }
  }, [user]);

  const [status, setStatus] = useState("");
  const [coverFile, setcoverFile] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      let updatedForm = { ...form };

      // Upload profile picture if selected
      if (profilePictureFile) {
        const formData = new FormData();
        formData.append("image", profilePictureFile);
        const response = await fetch(`http://localhost:5050/api/uploads/profile-picture/${user._id}`, {
          method: "PUT",
          body: formData
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Profile picture upload failed");
        updatedForm.profilePictureUrl = data.user.profilePictureUrl;
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      // Upload cover photo if selected
      if (coverFile) {
        const formData = new FormData();
        formData.append("image", coverFile);
        const response = await fetch("http://localhost:5050/api/uploads/cover-photo", {
          method: "POST",
          body: formData
        });
        const data = await response.json();
        if (!response.ok) throw new Error("Background image upload failed");
        updatedForm.coverPhotoUrl = data.url;
      }

      const response = await fetch(`http://localhost:5050/api/users/${user._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedForm)
      });

      if (!response.ok) throw new Error("Failed to update profile");

      const updatedUser = await response.json();
      setUser(updatedUser); // <- Update context
      localStorage.setItem("user", JSON.stringify(updatedUser)); 

      // Redirect to profile with success state
      navigate(`/profile/${user._id}`, { state: { profileUpdated: true } });
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Could not update profile.");
    }
  };

  if (!user) {
   return (
      <LoadingScreen message="Loading user info..."/>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8 bg-base-gradient">
      <div className="bg-white bg-opacity-90 rounded-2xl p-6 shadow-xl max-w-lg w-full">
        <h1 className="text-3xl font-bold mb-4 text-center">
          Profile Settings
        </h1>

        <div className="space-y-4 mt-4 text-gray-700">
          <div className="text-center">
            {form.profilePictureUrl ? (
              <img
                src={form.profilePictureUrl}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover mx-auto"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mx-auto">
                <span className="text-gray-600 font-medium text-xl">
                  {form.username?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
            )}

            <div className="mt-4">
                <label className="block font-semibold text-left mb-2">Profile Picture</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProfilePictureFile(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-full px-3 py-2 border rounded focus-within:ring-2 focus-within:ring-blue-400 bg-white flex items-center">
                    <span className="text-gray-900">Choose File</span>
                    <span className="mx-2">|</span>
                    <span className={`${profilePictureFile ? 'text-gray-500' : 'text-gray-400'} flex-1 truncate text-left`}>
                      {profilePictureFile ? profilePictureFile.name : 'No file chosen'}
                    </span>
                  </div>
                </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold">Username</label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block font-semibold">Email</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              type="email"
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block font-semibold">Birth Date</label>
            <input
              name="birthdate"
              value={form.birthdate}
              onChange={handleChange}
              type="date"
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block font-semibold">Bio</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              rows={3}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Cover Photo</label>
            {form.coverPhotoUrl ? (
              <img
                src={form.coverPhotoUrl}
                alt="Cover Photo"
                className="w-full h-40 object-cover mb-2 rounded"
              />
            ) : (
              <p className="text-sm text-gray-500 mb-2">No cover photo set.</p>
            )}
            <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setcoverFile(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-full px-3 py-2 border rounded focus-within:ring-2 focus-within:ring-blue-400 bg-white flex items-center">
                    <span className="text-gray-900">Choose File</span>
                    <span className="mx-2">|</span>
                    <span className={`${coverFile ? 'text-gray-500' : 'text-gray-400'} flex-1 truncate text-left`}>
                      {coverFile ? coverFile.name : 'No file chosen'}
                    </span>
                  </div>
                </div>
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={() => navigate(`/profile/${user._id}`)}

            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => setShowConfirmModal(true)}
            className="px-4 py-2 bg-[#1E275E] text-white rounded hover:bg-[#4B548B] cursor-pointer"
          >
            Save Changes
          </button>
        </div>

        {status && <p className="text-sm mt-2 text-center text-gray-600">{status}</p>}
      </div>

      <ConfirmPasswordModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={(password) => {
          setShowConfirmModal(false);
          handleSave(password); // optionally pass this to backend for validation
        }}
      />

    </div>
  );
}