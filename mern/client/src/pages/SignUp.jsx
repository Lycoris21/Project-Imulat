import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5050/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
          birthdate: form.birthdate || null,
          bio: form.bio || "",
          profilePictureUrl: null,
          backgroundImageUrl: null,
          role: "user"
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Signup failed");

      navigate("/login");
    } catch (err) {
      setError(err.message);
    }
  };


  return (
    <div className="min-h-screen bg-[linear-gradient(to_bottom,_#4B548B_0%,_#2F3558_75%,_#141625_100%)] flex flex-col justify-center items-center text-center px-4">
      <div className="bg-[#ffffff] shadow-xl rounded-2xl w-[40%] p-8 m-auto">
        <h2 className="text-3xl font-bold text-center text-deep mb-6">
          Create Your Account
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 text-sm p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-deep mb-1 text-left">
              Username
            </label>
   <div className="flex items-center border-b border-gray-400 py-2">
    <input
      type="text"
      name="username"
      value={form.username}
      onChange={handleChange}
      required
      placeholder="Enter Username"
      className="appearance-none bg-transparent border-none w-full text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-b-2 focus:border-blue-600"
    />
  </div>
   </div>

          <div>
            <label className="block text-sm font-medium text-deep mb-1 text-left">
              Email
            </label>

    <div className="flex items-center border-b border-gray-400 py-2">
      <input
        type="email"
        name="email"
        value={form.email}
        onChange={handleChange}
        required
        placeholder="Enter Email"
        className="appearance-none bg-transparent border-none w-full text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-b-2 focus:border-blue-600"
      />
    </div>
  </div>

          <div>
            <label className="block text-sm font-medium text-deep mb-1 text-left">
              Password
            </label>

      <div className="flex items-center border-b border-gray-400 py-2">
      <input
        type="password"
        name="password"
        value={form.password}
        onChange={handleChange}
        required
        placeholder="Enter Password"
        className="appearance-none bg-transparent border-none w-full text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-b-2 focus:border-blue-600"
      />
    </div>
  </div>

          <div>
            <label className="block text-sm font-medium text-deep mb-1 text-left">
              Confirm Password
            </label>

    <div className="flex items-center border-b border-gray-400 py-2">
      <input
        type="password"
        name="confirmPassword"
        value={form.confirmPassword}
        onChange={handleChange}
        required
        placeholder="Re-enter Password"
        className="appearance-none bg-transparent border-none w-full text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-b-2 focus:border-blue-600"
      />
    </div>
    
  </div>
 
 
<div>
  <label className="block text-sm font-medium text-deep mb-1 text-left">
    Birthdate
  </label>
  <div className="flex items-center border-b border-gray-400 py-2">
    <input
      type="date"
      name="birthdate"
      value={form.birthdate}
      onChange={handleChange}
      className="appearance-none bg-transparent border-none w-full text-gray-700 focus:outline-none focus:ring-0 focus:border-b-2 focus:border-blue-600"
    />
  </div>
</div>





          <button
            type="submit"
              className="w-full bg-[#1E275E] text-white font-semibold py-2 rounded-xl hover:bg-[#161e49] transition"
          >
            Sign Up
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-[#4B548B] hover:underline font-medium">
            Log In
          </a>
        </p>
      </div>
    </div>
  );
}
