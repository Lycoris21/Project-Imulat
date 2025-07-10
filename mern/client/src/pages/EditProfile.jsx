import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

// Components
import { LoadingScreen, ErrorScreen, ConfirmPasswordModal, DeleteUserModal } from '../components';
import AlertModal from '../components/modals/AlertModal';

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [alert, setAlert] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'error'
  });

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
    } else {
      navigate("/login");
    }
  }, [user, navigate]);

  const [status, setStatus] = useState("");
  const [coverFile, setCoverFile] = useState(null);

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
      setAlert({
        isOpen: true,
        title: 'Update Failed',
        message: 'Could not update profile.',
        type: 'error'
      });
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`http://localhost:5050/api/users/${user._id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Delete failed");
      logout();
    } catch (err) {
      console.error("Delete failed", err);
      setAlert({
        isOpen: true,
        title: 'Delete Failed',
        message: 'Could not delete account.',
        type: 'error'
      });
    }
  }

  if (!user) {
    return (
      <LoadingScreen message="Loading user info..." />
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-start px-4 py-12 bg-base-gradient">
      <div className="bg-white bg-opacity-90 rounded-3xl shadow-2xl w-full max-w-5xl p-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">
          Profile Settings
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-700">
          {/* Left Column – Profile Picture and Cover */}
          <div className="space-y-8">
            {/* Profile Picture */}
            <div className="text-center">
              {form.profilePictureUrl ? (
                <img
                  src={form.profilePictureUrl}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover mx-auto shadow"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mx-auto text-2xl text-gray-600 font-semibold shadow">
                  {form.username?.charAt(0).toUpperCase() || "U"}
                </div>
              )}

              <div className="mt-4 text-left">
                <label className="block font-semibold mb-2">Profile Picture</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProfilePictureFile(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-full px-3 py-2 border rounded bg-white flex items-center">
                    <span className="text-gray-900">Choose File</span>
                    <span className="mx-2">|</span>
                    <span className={`${profilePictureFile ? 'text-gray-500' : 'text-gray-400'} flex-1 truncate`}>
                      {profilePictureFile ? profilePictureFile.name : 'No file chosen'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cover Photo */}
            <div>
              <label className="block font-semibold mb-2">Cover Photo</label>
              {form.coverPhotoUrl ? (
                <img
                  src={form.coverPhotoUrl}
                  alt="Cover Photo"
                  className="w-full h-48 object-cover mb-2 rounded shadow"
                />
              ) : (
                <p className="text-sm text-gray-500 mb-2">No cover photo set.</p>
              )}
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="w-full px-3 py-2 border rounded bg-white flex items-center">
                  <span className="text-gray-900">Choose File</span>
                  <span className="mx-2">|</span>
                  <span className={`${coverFile ? 'text-gray-500' : 'text-gray-400'} flex-1 truncate`}>
                    {coverFile ? coverFile.name : 'No file chosen'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column – Form Fields */}
          <div className="space-y-6">
            <div>
              <label className="block font-semibold mb-1">Username</label>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                className="w-full border p-3 rounded text-base"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Email</label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                type="email"
                className="w-full border p-3 rounded text-base"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Birth Date</label>
              <input
                name="birthdate"
                value={form.birthdate}
                onChange={handleChange}
                type="date"
                className="w-full border p-3 rounded text-base"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Bio</label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                rows={4}
                className="w-full border p-3 rounded text-base"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-10 gap-4">
          <button
            onClick={() => navigate(`/profile/${user._id}`)}
            className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700 font-medium transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => setShowConfirmModal(true)}
            className="w-full sm:w-auto px-6 py-3 bg-[color:var(--color-dark)] text-white rounded hover:bg-[color:var(--color-base)] font-medium transition cursor-pointer"
          >
            Save Changes
          </button>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="text-sm text-red-600 hover:text-red-800 underline cursor-pointer"
          >
            Delete Account
          </button>
        </div>

        {status && <p className="text-sm mt-4 text-center text-gray-600">{status}</p>}
      </div>

      {/* Modals */}
      <ConfirmPasswordModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={(password) => {
          setShowConfirmModal(false);
          handleSave(password);
        }}
      />
      <DeleteUserModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={async () => {
          setShowDeleteModal(false);
          handleDelete();
        }}
      />
      <AlertModal
        isOpen={alert.isOpen}
        onClose={() => setAlert((prev) => ({ ...prev, isOpen: false }))}
        title={alert.title}
        message={alert.message}
        type={alert.type}
      />
    </div>
  );
}