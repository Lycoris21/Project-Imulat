import React, { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await fetch("http://localhost:5050/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      let message = "Something went wrong.";
      if (Array.isArray(data.details)) {
        message = data.details.map((e) => `• ${e.msg}`).join("\n");
      } else if (data.message) {
        message = data.message;
      }

      res.ok ? setMessage(message) : setError(message);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-base-gradient flex flex-col justify-center items-center px-4 text-center">
      <div className="bg-white shadow-xl rounded-xl w-full max-w-lg p-8">
        <h2 className="text-3xl font-bold text-center text-[color:var(--color-deep)] mb-6">Forgot Password</h2>

        {message && (
          <div className="bg-green-100 text-green-700 text-sm p-3 rounded-lg mb-4">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 text-sm p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <div className="flex items-center border-b border-gray-400 py-2">
              <span className="text-gray-500 mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 50 50"
                  className="w-5 h-5"
                  fill="currentColor"
                >
                  <path d="M45.8333 12.5C45.8333 10.2083 43.9583 8.33333 41.6667 8.33333H8.33333C6.04166 8.33333 4.16666 10.2083 4.16666 12.5V37.5C4.16666 39.7917 6.04166 41.6667 8.33333 41.6667H41.6667C43.9583 41.6667 45.8333 39.7917 45.8333 37.5V12.5ZM41.6667 12.5L25 22.9167L8.33333 12.5H41.6667ZM41.6667 37.5H8.33333V16.6667L25 27.0833L41.6667 16.6667V37.5Z" />
                </svg>
              </span>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className="appearance-none bg-transparent border-none w-full text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-b-2 focus:border-blue-600"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[color:var(--color-dark)] text-white font-semibold py-2 rounded-xl hover:bg-[color:var(--color-darker)] transition"
          >
            Send Reset Link
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-6">
          Remembered your password?{" "}
          <a href="/login" className="text-[color:var(--color-base)] hover:underline font-medium">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
