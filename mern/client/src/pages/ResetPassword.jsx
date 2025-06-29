import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (newPassword !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    try {
      const res = await fetch(`http://localhost:5050/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Reset failed");

      setSuccessMsg("Password has been reset. You can now log in.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-base-gradient flex flex-col justify-center items-center text-center px-4">
      <div className="bg-white shadow-xl rounded-xl w-full max-w-lg p-8">
        <h2 className="text-3xl font-bold text-deep mb-6">Reset Password</h2>

        {successMsg && (
          <div className="bg-green-100 text-green-700 text-sm p-3 rounded-lg mb-4">
            {successMsg}
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 text-sm p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* New Password */}
          <div className="flex items-center border-b border-gray-400 py-2">
            <span className="text-gray-500 mr-3">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 50 50">
                <path d="M12.5 45.8333C..." />
              </svg>
            </span>
            <input
              type="password"
              required
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="appearance-none bg-transparent border-none w-full text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-b-2 focus:border-blue-600"
            />
          </div>

          {/* Confirm Password */}
          <div className="flex items-center border-b border-gray-400 py-2">
            <span className="text-gray-500 mr-3">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 50 50">
                <path d="M12.5 45.8333C..." />
              </svg>
            </span>
            <input
              type="password"
              required
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="appearance-none bg-transparent border-none w-full text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-b-2 focus:border-blue-600"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-dark text-white font-semibold py-2 rounded-xl hover:bg-darker transition"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}
