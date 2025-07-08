import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import ConfirmLogoutModal from "../modals/ConfirmLogoutModal";
import { useAuth } from "../../context/AuthContext";

import DarkModeToggle from './DarkModeToggle';
import NavItem from './NavItem';
import NotificationBell from './NotificationBell';
import UserDropdown from './UserDropdown';

export default function Navbar({ isLoggedIn = false, user = null }) {
  const navItems = [
    { name: "Home", to: "/Home" },
    { name: "Reports", to: "/reports" },
    { name: "Claims", to: "/claims" },
    { name: "About", to: "/about" },
  ];

  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showPasswordSuccessMessage, setShowPasswordSuccessMessage] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);

  const handlePasswordChanged = () => {
    setShowPasswordSuccessMessage(true);
    setTimeout(() => {
      setShowPasswordSuccessMessage(false);
    }, 4000);
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/notifications/${user._id}`);
      const data = await response.json();
      setNotifications(data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchNotifications();
    }
  }, [user]);

  return (
    <>
      {/* Password Change Success Notification */}
      {showPasswordSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 animate-slide-in">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Password changed successfully!</span>
          <button 
            onClick={() => setShowPasswordSuccessMessage(false)}
            className="ml-2 text-green-200 hover:text-white"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      <nav className="h-16 sm:h-20 bg-white border-b shadow-sm px-1 xs:px-2 sm:px-4 lg:px-6 py-2 sm:py-4 flex justify-between items-center">
      {/* Left side - Logo and App Name */}
      <Link to="/Home" className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3 flex-shrink-0">
        <div className="h-14 w-14">
          <img
            src="/logo.png"
            alt="Project IMULAT Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-base sm:text-base md:text-lg lg:text-xl font-medium sm:font-bold text-[color:var(--color-base)] -ml-1 sm:-ml-2 md:-ml-3 lg:-ml-4 whitespace-nowrap">Project IMULAT</h1>
      </Link>

      {/* Center - Navigation Items */}
      <div className="hidden sm:flex items-center space-x-1 md:space-x-3 lg:space-x-5 xl:space-x-7 flex-shrink-0">
        {navItems.map((item) => (
          <NavItem
            key={item.name}
            to={item.to}
            name={item.name}
          />
        ))}
      </div>

      {/* Right side - User Authentication */}
      <div className="flex items-center">
        {isLoggedIn && user ? (
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Mobile Menu Button - only shown when logged in */}
            <button
              className="sm:hidden p-2 text-[color:var(--color-base)] hover:text-[color:var(--color-dark)] transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Notifications Bell */}
            <NotificationBell
              user={user}
              notifications={notifications}
              setNotifications={setNotifications}
              refreshNotifications={fetchNotifications}
            />

            {/* User Profile Dropdown */}
            <UserDropdown user={user} onLogout={() => setShowLogoutConfirm(true)} onPasswordChanged={handlePasswordChanged} />
          </div>
        ) : (
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Mobile Menu Button - only shown when not logged in */}
            <button
              className="sm:hidden p-2 text-[color:var(--color-base)] hover:text-[color:var(--color-dark)] transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <Link
              to="/login"
              className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm border-1 border-[color:var(--color-base)] text-[color:var(--color-base)] hover:text-white hover:border-white hover:bg-[color:var(--color-base)] font-medium rounded-lg transition-colors"
            >
              <span className="hidden sm:inline">Login / Sign up</span>
              <span className="sm:hidden">Login</span>
            </Link>
          </div>
        )}
      </div>
      <ConfirmLogoutModal
        isOpen={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={() => {
          setShowLogoutConfirm(false);
          setDropdownOpen(false);
          logout();
          navigate("/login");
        }}
      />

    </nav>

    {/* Mobile Menu */}
    {mobileMenuOpen && (
      <div className="sm:hidden bg-white border-b shadow-lg">
        <div className="px-4 py-2 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive 
                    ? "text-[color:var(--color-dark)] bg-gray-100" 
                    : "text-[color:var(--color-base)] hover:text-[color:var(--color-dark)] hover:bg-gray-50"
                }`
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}
            </NavLink>
          ))}
        </div>
      </div>
    )}
    </>
  );
}
