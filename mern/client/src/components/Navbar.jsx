import { Link, NavLink, useNavigate} from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ isLoggedIn = false, user = null }) {
  const navItems = [
    { name: "Home", to: "/Home" },
    { name: "Reports", to: "/reports" },
    { name: "Claims", to: "/claims" },
    { name: "About", to: "/about" },
  ];

  const { logout } = useAuth();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
     setDropdownOpen(false);
    logout();
    navigate("/login");
  };

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
        <Link to="/Home" className="flex items-center space-x-3">
  <div style={{ height: '60px' }}>
    <img 
      src="/logo.png" 
      alt="Project IMULAT Logo" 
      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
    />
  </div>
  <h1 className="text-xl font-bold text-[#4B548B] -m-5">Project IMULAT</h1>
</Link>

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
      <div className="absolute right-0 mt-2 min-w-[200px] bg-white shadow-lg z-50 text-sm rounded-lg">



<div className="rounded-lg hover:bg-gray-100">
  <Link
    to="/profile"
    className="text-center block px-4 py-2 text-[#4B548B]"
  >
    Profile
  </Link>
  <div className="border-t border-gray-200 mx-10" />
</div>

<div className="hover:bg-gray-100">
  <Link
    to="/bookmarks"
    className="text-center block px-4 py-2 text-[#4B548B]"
  >
    Bookmarks
  </Link>
  <div className="border-t border-gray-200 mx-10" />
</div>

<div className="hover:bg-gray-100">
  <Link
    to="/notifications"
    className="text-center block px-4 py-2 text-[#4B548B]"
  >
    Notifications
  </Link>
  <div className="border-t border-gray-200 mx-10" />
</div>

<div className="hover:bg-gray-100 rounded-b-lg">
  <button
  className="text-center w-full px-4 py-2 text-[#4B548B] cursor-pointer"
    onClick={handleLogout}
    
  >
    Logout
  </button>
  
</div>



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
