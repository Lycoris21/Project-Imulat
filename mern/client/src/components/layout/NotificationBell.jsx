import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function NotificationBell({ notifications, setNotifications }) {
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ref = useRef();
  const navigate = useNavigate();

  const notificationsPerPage = 15;
  const unreadCount = notifications.filter(n => !n.read).length;
  const current = notifications.slice((currentPage - 1) * notificationsPerPage, currentPage * notificationsPerPage);
  const totalPages = Math.ceil(notifications.length / notificationsPerPage);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleClickOutside = (e) => {
    if (ref.current && !ref.current.contains(e.target)) setOpen(false);
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {/* Bell Icon */}
      <button onClick={() => setOpen(!open)} className="relative p-2 hover:bg-gray-100 rounded-lg">
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg border rounded-lg z-50">
          {/* Render list of notifications with pagination and mark all as read */}
          {/* You can extract NotificationItem if needed */}
        </div>
      )}
    </div>
  );
}
