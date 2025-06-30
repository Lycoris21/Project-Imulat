import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import NotificationList from "../notifications/NotificationList";

const socket = io("http://localhost:5050");

export default function NotificationBell({ user, notifications, setNotifications, refreshNotifications }) {
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ref = useRef();
  const navigate = useNavigate();

  const notificationsPerPage = 15;
  const unreadCount = notifications.filter(n => !n.read).length;
  const current = notifications.slice((currentPage - 1) * notificationsPerPage, currentPage * notificationsPerPage);
  const totalPages = Math.ceil(notifications.length / notificationsPerPage);

  // Join the socket room and listen for new notifications
  useEffect(() => {
    if (!user?._id) return;

    socket.emit("join", user._id);

    socket.on("new-notification", (newNotif) => {
      setNotifications(prev => [newNotif, ...prev]);
    });

    return () => {
      socket.off("new-notification");
    };
  }, [user?._id]);

  const markAllAsRead = async () => {
    try {
      await fetch(`/api/notifications/read-all/${user._id}`, {
        method: "PATCH",
      });

      // Optimistically update UI
      refreshNotifications();
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
    } catch (err) {
      console.error("Failed to mark all notifications as read", err);
    }
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
      <button onClick={() => setOpen(!open)} className="relative p-2 text-gray-600 hover:text-gray-800 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors">
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
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex flex-col space-y-0">
                <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                <span className="text-xs text-gray-500">{unreadCount} unread</span>
              </div>
              <button
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className={`text-sm font-medium ${unreadCount > 0
                  ? 'text-[color:var(--color-base)] hover:text-[color:var(--color-dark)] cursor-pointer'
                  : 'text-gray-400 cursor-not-allowed'
                  }`}
              >
                Mark all as read
              </button>
            </div>
          </div>

          <NotificationList
            notifications={current}
            onClose={() => setOpen(false)} // Pass the setOpen function to close the bell
            refreshNotifications={refreshNotifications}
          />

          {totalPages > 1 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
