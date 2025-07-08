import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from "../context/AuthContext"; // adjust path if needed

export default function SignUp() {
  const navigate = useNavigate();
  const datePickerRef = useRef(null);
  const { user, login } = useAuth();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthdate: null,
  });

  const [error, setError] = useState("");
  const [birthdateError, setBirthdateError] = useState("");

  useEffect(() => {
    if (user) {
      navigate("/home");
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleIconClick = () => {
    if (datePickerRef.current) {
      datePickerRef.current.setOpen(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBirthdateError("");

    if (!form.birthdate) {
      setBirthdateError("Birthdate is required.");
      return;
    }

    const today = new Date();
    const birthdate = new Date(form.birthdate);
    const ageDifMs = today - birthdate;
    const ageDate = new Date(ageDifMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    if (age < 13) {
      setBirthdateError("You must be at least 13 years old to register.");
      return;
    }

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
          birthdate: form.birthdate,
          bio: form.bio || "",
          profilePictureUrl: null,
          coverPhotoUrl: null,
          role: "user"
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        let message = "Validation failed.";
        if (Array.isArray(data.details)) {
          message = data.details.map((e) => `• ${e.msg}`).join("\n");
        } else if (data.message) {
          message = data.message;
        }
        throw new Error(message);
      }

      login(data.user);
      navigate("/home");
    } catch (err) {
      setError(err.message);
    }
  };


  return (
    <div className="min-h-[calc(100vh-5rem)] bg-base-gradient flex flex-col justify-center items-center text-center py-6 px-4">
      <div className="bg-[#ffffff] shadow-xl rounded-xl w-full max-w-lg p-8 m-auto">
        <h2 className="text-3xl font-bold text-center text-[color:var(--color-deep)] mb-6">
          Create Your Account
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 text-sm p-3 rounded-lg mb-4">
            {error.split('\n').map((line, idx) => (
              <p key={idx}>• {line.replace(/^•\s?/, '')}</p>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[color:var(--color-deep)] mb-1 text-left">
              Username
            </label>
            <div className="flex items-center border-b border-gray-400 py-2">
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                maxLength={15}
                placeholder="Enter Username"
                className="appearance-none bg-transparent border-none w-full text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-b-2 focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[color:var(--color-deep)] mb-1 text-left">
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
            <label className="block text-sm font-medium text-[color:var(--color-deep)] mb-1 text-left">
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
            <label className="block text-sm font-medium text-[color:var(--color-deep)] mb-1 text-left">
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
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="ml-2 whitespace-nowrap text-xs text-red-600">Passwords do not match.</p>
              )}
            </div>


          </div>


          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-[color:var(--color-deep)] mb-1 text-left">
              <span>Birthdate</span>
              <svg
                onClick={handleIconClick}
                className="cursor-pointer"
                width="20"
                height="20"
                viewBox="0 0 29 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M25.9998 6H2.6665V11H25.9998V6Z" fill="#4B548B" />
                <path
                  d="M14.3333 4.33337H26C26.9167 4.33337 27.6667 5.08337 27.6667 6.00004V29.3334C27.6667 30.25 26.9167 31 26 31H2.66667C1.75 31 1 30.25 1 29.3334V6.00004C1 5.08337 1.75 4.33337 2.66667 4.33337H14.3333Z"
                  stroke="#4B548B"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 4.33333V1M22.6667 4.33333V1"
                  stroke="#4B548B"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 16H22.6667"
                  stroke="#4B548B"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 22.6666H17.6667"
                  stroke="#4B548B"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </label>

            <div className="flex items-center border-b border-gray-400 py-2">
              <DatePicker
                ref={datePickerRef}
                selected={form.birthdate}
                onChange={(date) => setForm({ ...form, birthdate: date })}
                placeholderText="mm/dd/yyyy"
                maxDate={new Date()}
                className="appearance-none bg-transparent border-none w-full text-black placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-b-2 focus:border-blue-600"
                dateFormat="MM/dd/yyyy"
                showYearDropdown
                scrollableYearDropdown
                yearDropdownItemNumber={100}
              />
              {birthdateError && (
                <div className="flex justify-end w-full">
                  <p className="whitespace-nowrap text-xs text-red-600">{birthdateError}</p>
                </div>
              )}


            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[color:var(--color-dark)] text-white font-semibold py-2 rounded-xl hover:bg-[color:var(--color-darker)] transition"
          >
            Sign Up
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-[color:var(--color-base)] hover:underline font-medium">
            Log In
          </a>
        </p>
      </div>
    </div>
  );
}
