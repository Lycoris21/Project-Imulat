import { Link, NavLink } from "react-router-dom";

export default function Navbar({ isLoggedIn = false, user = null }) {
  const navItems = [
    { name: "Home", to: "/" },
    { name: "Reports", to: "/reports" },
    { name: "Claims", to: "/claims" },
    { name: "About", to: "/about" },
  ];

  return (
    <nav className="bg-white border-b shadow-sm px-6 py-4 flex justify-between items-center">      {/* Left side - Logo and App Name */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-blue-600">
          <img 
            src="/logo.png" 
            alt="Project IMULAT Logo" 
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to SVG if image doesn't load
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'block';
            }}
          />
          <svg 
            className="w-6 h-6 text-white hidden" 
            fill="currentColor" 
            viewBox="0 0 20 20"
            style={{ display: 'none' }}
          >
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-800">Project IMULAT</h1>
      </div>

      {/* Center - Navigation Items */}
      <div className="flex items-center space-x-8">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            className={({ isActive }) =>
              `text-gray-600 hover:text-blue-600 font-medium transition-colors ${
                isActive ? "text-blue-600 border-b-2 border-blue-500 pb-1" : ""
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
          <Link 
            to="/profile" 
            className="flex items-center space-x-3 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
              {user.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-600 font-medium text-sm">
                  {user.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <span className="text-gray-700 font-medium">{user.username}</span>
          </Link>
        ) : (
          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
