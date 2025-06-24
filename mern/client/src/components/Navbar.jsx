import { Link, NavLink } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

export default function Navbar({ isLoggedIn = false, user = null }) {
  const navItems = [
    { name: "Home", to: "/" },
    { name: "Reports", to: "/reports" },
    { name: "Claims", to: "/claims" },
    { name: "About", to: "/about" },
  ];

const [dropdownOpen, setDropdownOpen] = useState(false);
const dropdownRef = useRef(null);
useEffect(() => {
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(false);
    }
  };
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);
  
  return (
    <nav className="h-20 bg-white border-b shadow-sm px-6 py-4 flex justify-between items-center">      
    {/* Left side - Logo and App Name */}
      <div className="flex items-center space-x-3">
        <div style={{height: '60px' }}>
          <img 
            src="logo.png" 
            alt="Project IMULAT Logo" 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
        <h1 className="text-xl font-bold text-[#4B548B] -m-5">Project IMULAT</h1>
      </div>

      {/* Center - Navigation Items */}
      <div className="flex items-center space-x-8">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            className={({ isActive }) =>
              `text-[#4B548B] hover:text-[#1E275E] font-medium transition-colors ${
                isActive ? "text-[#1E275E] opacity-60 border-b-2 border-[#1E275E] pb-1" : ""
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </div>

      {/* Right side - User Authentication */}
      <div className="flex items-center">
        {isLoggedIn && user ? (
  <div className="relative" ref={dropdownRef}>
    <button
      onClick={() => setDropdownOpen((prev) => !prev)}
      className="flex items-center space-x-3 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors cursor-pointer"
    >
      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
        {user.profilePictureUrl ? (
          <img
            src={user.profilePictureUrl}
            alt={user.username}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-gray-600 font-medium text-sm">
            {user.username?.charAt(0).toUpperCase() || "U"}
          </span>
        )}
      </div>
      <span className="text-gray-700 font-medium">{user.username}</span>
    </button>

    {dropdownOpen && (
      <div className="absolute right-0 mt-2 w-full bg-white border-none shadow-lg z-50 text-sm rounded-none focus:outline-none">

        <Link
          to="/profile"
          className="block px-4 py-2 hover:bg-gray-100 text-[#4B548B]"
        >
          Profile
        </Link>
        <Link
          to="/bookmarks"
          className="block px-4 py-2 hover:bg-gray-100 text-[#4B548B]"
        >
          Bookmarks
        </Link>
        <Link
          to="/notifications"
          className="block px-4 py-2 hover:bg-gray-100 text-[#4B548B]"
        >
          Notifications
        </Link>
        <button
          onClick={() => {
            // logout logic here (e.g., clear token, redirect, etc.)
            console.log("Logging out...");
          }}
          className="w-full text-left px-4 py-2 hover:bg-gray-100 text-[#4B548B]"
        >
          Logout
        </button>
      </div>
    )}
  </div>
) : (
  <div className="flex items-center space-x-3">
    <Link
      to="/login"
      className="px-4 py-2 border-1 border-[#4B548B] text-[#4B548B] hover:text-white hover:border-white hover:bg-[#4B548B] font-medium rounded-lg transition-colors"
    >
      Login / Sign up
    </Link>
  </div>
)}

      </div>
    </nav>
  );
}
