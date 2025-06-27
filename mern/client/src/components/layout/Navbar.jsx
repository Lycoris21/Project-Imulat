import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import ConfirmLogout from "../modals/ConfirmLogout";
import { useAuth } from "../../context/AuthContext";

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

  const [notifications, setNotifications] = useState([]);

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
        <h1 className="text-xl font-bold text-base -m-5">Project IMULAT</h1>
      </Link>

      {/* Center - Navigation Items */}
      <div className="flex items-center space-x-8">
        {navItems.map((item) => (
          <NavItem
            key={item.name}
            to={item.to}
            name={item.name} // ✅ pass this!
          />
        ))}
      </div>

      {/* Right side - User Authentication */}
      <div className="flex items-center">
        {isLoggedIn && user ? (
          <div className="flex items-center space-x-4">
            {/* Notifications Bell */}
            <NotificationBell
              notifications={notifications}
              setNotifications={setNotifications}
              refreshNotifications={fetchNotifications}
            />


            {/* User Profile Dropdown */}
            <UserDropdown user={user} onLogout={() => setShowLogoutConfirm(true)} />
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="px-4 py-2 border-1 border-base text-base hover:text-white hover:border-white hover:bg-base font-medium rounded-lg transition-colors"
            >
              Login / Sign up
            </Link>
          </div>
        )}
      </div>
      <ConfirmLogout
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
  );
}
