import { Link, NavLink, useNavigate} from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

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
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'report',
      title: 'New Report Available',
      message: 'A fact-check report has been published for your claim "COVID-19 Vaccine Safety"',
      timestamp: '2 hours ago',
      read: false,
      link: '/reports/123'
    },
    {
      id: 2,
      type: 'comment',
      title: 'New Comment',
      message: 'John Doe commented on your claim "Climate Change Impact"',
      timestamp: '5 hours ago',
      read: false,
      link: '/claims/456'
    },
    {
      id: 3,
      type: 'claim',
      title: 'Claim Status Update',
      message: 'Your claim "Economic Recession 2025" is now under review',
      timestamp: '1 day ago',
      read: true,
      link: '/claims/789'
    },
    {
      id: 4,
      type: 'report',
      title: 'Report Liked',
      message: 'Your report "Social Media Misinformation" received 10 new likes',
      timestamp: '2 days ago',
      read: true,
      link: '/reports/101'
    },
    {
      id: 5,
      type: 'comment',
      title: 'Reply to Comment',
      message: 'Jane Smith replied to your comment on "Artificial Intelligence Ethics"',
      timestamp: '3 days ago',
      read: true,
      link: '/claims/112'
    },
    // Additional mock notifications for pagination demo
    {
      id: 6,
      type: 'report',
      title: 'Report Update',
      message: 'Your report "Vaccine Misinformation" has been updated with new evidence',
      timestamp: '4 days ago',
      read: false,
      link: '/reports/113'
    },
    {
      id: 7,
      type: 'comment',
      title: 'Comment Reply',
      message: 'Sarah Wilson replied to your comment on "Global Warming Facts"',
      timestamp: '5 days ago',
      read: true,
      link: '/claims/114'
    },
    {
      id: 8,
      type: 'claim',
      title: 'Claim Approved',
      message: 'Your claim "Renewable Energy Benefits" has been approved for fact-checking',
      timestamp: '6 days ago',
      read: false,
      link: '/claims/115'
    },
    {
      id: 9,
      type: 'report',
      title: 'New Report',
      message: 'A new report has been published about "Space Exploration Claims"',
      timestamp: '1 week ago',
      read: true,
      link: '/reports/116'
    },
    {
      id: 10,
      type: 'comment',
      title: 'Comment Liked',
      message: 'Your comment on "Technology Ethics" received 5 new likes',
      timestamp: '1 week ago',
      read: true,
      link: '/claims/117'
    },
    {
      id: 11,
      type: 'claim',
      title: 'Claim Under Review',
      message: 'Your claim "Health Benefits of Exercise" is currently under expert review',
      timestamp: '1 week ago',
      read: false,
      link: '/claims/118'
    },
    {
      id: 12,
      type: 'report',
      title: 'Report Shared',
      message: 'Your report "Social Media Facts" has been shared 50 times',
      timestamp: '2 weeks ago',
      read: true,
      link: '/reports/119'
    },
    {
      id: 13,
      type: 'comment',
      title: 'New Discussion',
      message: 'A new discussion started on your claim "Educational Policy Changes"',
      timestamp: '2 weeks ago',
      read: true,
      link: '/claims/120'
    },
    {
      id: 14,
      type: 'report',
      title: 'Expert Review',
      message: 'An expert has reviewed your report "Environmental Impact Study"',
      timestamp: '2 weeks ago',
      read: false,
      link: '/reports/121'
    },
    {
      id: 15,
      type: 'claim',
      title: 'Claim Featured',
      message: 'Your claim "Digital Privacy Rights" has been featured on the homepage',
      timestamp: '3 weeks ago',
      read: true,
      link: '/claims/122'
    },
    {
      id: 16,
      type: 'comment',
      title: 'Comment Mentioned',
      message: 'You were mentioned in a comment on "Artificial Intelligence Safety"',
      timestamp: '3 weeks ago',
      read: false,
      link: '/claims/123'
    },
    {
      id: 17,
      type: 'report',
      title: 'Report Verification',
      message: 'Your report "Climate Science Data" has been verified by our experts',
      timestamp: '3 weeks ago',
      read: true,
      link: '/reports/124'
    }
  ]);
  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);

  const notificationsPerPage = 15;
  const totalPages = Math.ceil(notifications.length / notificationsPerPage);
  const startIndex = (currentPage - 1) * notificationsPerPage;
  const endIndex = startIndex + notificationsPerPage;
  const currentNotifications = notifications.slice(startIndex, endIndex);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
     setDropdownOpen(false);
    logout();
    navigate("/login");
  };

  const handleNotificationClick = (notification) => {
    setNotificationsOpen(false);
    navigate(notification.link);
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'report':
        return (
          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
      case 'comment':
        return (
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
          </svg>
        );
      case 'claim':
        return (
          <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
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
  <h1 className="text-xl font-bold text-base -m-5">Project IMULAT</h1>
</Link>

        {/* Center - Navigation Items */}
        <div className="flex items-center space-x-8">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                `text-base hover:text-dark font-medium transition-colors ${
                  isActive ? "text-dark opacity-60 border-b-2 border-dark pb-1" : ""
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
            <div className="flex items-center space-x-4">
              {/* Notifications Bell */}
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Modal */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg z-50 rounded-lg border border-gray-200 max-h-136 overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex flex-col space-y-0">
                          <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                          <span className="text-xs text-gray-500">{unreadCount} unread</span>
                        </div>
                        <button
                          onClick={markAllAsRead}
                          disabled={unreadCount === 0}
                          className={`text-sm font-medium ${
                            unreadCount > 0 
                              ? 'text-base hover:text-dark' 
                              : 'text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          Mark all as read
                        </button>
                      </div>
                    </div>

                    <div className="divide-y divide-gray-200 max-h-100 overflow-y-auto">
                      {currentNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                            !notification.read ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className={`text-sm font-medium ${
                                  !notification.read ? 'text-gray-900' : 'text-gray-700'
                                }`}>
                                  {notification.title}
                                </p>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-2">
                                {notification.timestamp}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {totalPages > 1 && (
                      <div className="p-3 border-t border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Previous
                          </button>
                          <span className="text-sm text-gray-600">
                            Page {currentPage} of {totalPages}
                          </span>
                          <button
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User Profile Dropdown */}
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
                  <div className="absolute -right-6 mt-1 min-w-[200px] bg-white shadow-lg z-50 border border-gray-200 text-sm rounded-lg">
                    <div className="rounded-lg hover:bg-gray-100">
                      <Link
                        to={`/profile/${user?._id}`}
                        className="text-center block px-4 py-2 text-base"
                      >
                        Profile
                      </Link>
                      <div className="border-t border-gray-200 mx-10" />
                    </div>

                    <div className="hover:bg-gray-100">
                      <Link
                        to="/bookmarks"
                        className="text-center block px-4 py-2 text-base"
                      >
                        Bookmarks
                      </Link>
                      <div className="border-t border-gray-200 mx-10" />
                    </div>

                    <div className="hover:bg-gray-100 rounded-b-lg">
                      <button
                        className="text-center w-full px-4 py-2 text-base cursor-pointer"
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
      </nav>
    );
  }
