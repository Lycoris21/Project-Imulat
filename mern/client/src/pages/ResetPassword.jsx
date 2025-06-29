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
               <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 50 50"
                  className="w-5 h-5"
                  fill="currentColor"
                >
                  <path d="M12.5 45.8333C11.3542 45.8333 10.3736 45.4257 9.55834 44.6104C8.74306 43.7951 8.33472 42.8139 8.33334 41.6667V20.8333C8.33334 19.6875 8.74167 18.707 9.55834 17.8917C10.375 17.0764 11.3556 16.6681 12.5 16.6667H14.5833V12.5C14.5833 9.61807 15.5993 7.16182 17.6313 5.13126C19.6632 3.10071 22.1194 2.08473 25 2.08334C27.8806 2.08196 30.3375 3.09793 32.3708 5.13126C34.4042 7.1646 35.4194 9.62084 35.4167 12.5V16.6667H37.5C38.6458 16.6667 39.6271 17.075 40.4438 17.8917C41.2604 18.7083 41.6681 19.6889 41.6667 20.8333V41.6667C41.6667 42.8125 41.259 43.7938 40.4438 44.6104C39.6285 45.4271 38.6472 45.8347 37.5 45.8333H12.5ZM12.5 41.6667H37.5V20.8333H12.5V41.6667ZM25 35.4167C26.1458 35.4167 27.1271 35.009 27.9438 34.1938C28.7604 33.3785 29.1681 32.3972 29.1667 31.25C29.1653 30.1028 28.7576 29.1222 27.9438 28.3083C27.1299 27.4945 26.1486 27.0861 25 27.0833C23.8514 27.0806 22.8708 27.4889 22.0583 28.3083C21.2458 29.1278 20.8375 30.1083 20.8333 31.25C20.8292 32.3917 21.2375 33.3729 22.0583 34.1938C22.8792 35.0146 23.8597 35.4222 25 35.4167ZM18.75 16.6667H31.25V12.5C31.25 10.7639 30.6424 9.28821 29.4271 8.07293C28.2118 6.85765 26.7361 6.25001 25 6.25001C23.2639 6.25001 21.7882 6.85765 20.5729 8.07293C19.3576 9.28821 18.75 10.7639 18.75 12.5V16.6667Z" />
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
               <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 50 50"
                  className="w-5 h-5"
                  fill="currentColor"
                >
                  <path d="M12.5 45.8333C11.3542 45.8333 10.3736 45.4257 9.55834 44.6104C8.74306 43.7951 8.33472 42.8139 8.33334 41.6667V20.8333C8.33334 19.6875 8.74167 18.707 9.55834 17.8917C10.375 17.0764 11.3556 16.6681 12.5 16.6667H14.5833V12.5C14.5833 9.61807 15.5993 7.16182 17.6313 5.13126C19.6632 3.10071 22.1194 2.08473 25 2.08334C27.8806 2.08196 30.3375 3.09793 32.3708 5.13126C34.4042 7.1646 35.4194 9.62084 35.4167 12.5V16.6667H37.5C38.6458 16.6667 39.6271 17.075 40.4438 17.8917C41.2604 18.7083 41.6681 19.6889 41.6667 20.8333V41.6667C41.6667 42.8125 41.259 43.7938 40.4438 44.6104C39.6285 45.4271 38.6472 45.8347 37.5 45.8333H12.5ZM12.5 41.6667H37.5V20.8333H12.5V41.6667ZM25 35.4167C26.1458 35.4167 27.1271 35.009 27.9438 34.1938C28.7604 33.3785 29.1681 32.3972 29.1667 31.25C29.1653 30.1028 28.7576 29.1222 27.9438 28.3083C27.1299 27.4945 26.1486 27.0861 25 27.0833C23.8514 27.0806 22.8708 27.4889 22.0583 28.3083C21.2458 29.1278 20.8375 30.1083 20.8333 31.25C20.8292 32.3917 21.2375 33.3729 22.0583 34.1938C22.8792 35.0146 23.8597 35.4222 25 35.4167ZM18.75 16.6667H31.25V12.5C31.25 10.7639 30.6424 9.28821 29.4271 8.07293C28.2118 6.85765 26.7361 6.25001 25 6.25001C23.2639 6.25001 21.7882 6.85765 20.5729 8.07293C19.3576 9.28821 18.75 10.7639 18.75 12.5V16.6667Z" />
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
