import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { formatRelativeTime } from '../../utils/time';

export default function NotificationItem({ notification, onClose, refreshNotifications }) {
  const navigate = useNavigate();

  const getIcon = (type) => {
    const iconMap = {
      report: "text-blue-500",
      comment: "text-green-500",
      claim: "text-orange-500",
      default: "text-gray-500",
    };

    const color = iconMap[type] || iconMap.default;

    return (
      <svg className={`w-4 h-4 ${color}`} fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d={
            type === 'report'
              ? "M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
              : type === 'comment'
                ? "M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                : type === 'claim'
                  ? "M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"
                  : "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          }
          clipRule="evenodd"
        />
      </svg>
    );
  };

  const getMessage = () => {
    if (notification.type === "like") {
      return `${notification.senderId?.username} liked your ${notification.targetType}.`;
    } else if (notification.type === "comment") {
      return `${notification.senderId?.username} commented on your ${notification.targetType}.`;
    }
    return "You have a new notification.";
  };

  const getLink = () => {
    switch (notification.targetType) {
      case "claim":
        return `/claims/${notification.targetId}`;
      case "report":
        return `/reports/${notification.targetId}`;
      case "comment":
        if (notification.postType === "claim") {
          return `/claims/${notification.postId}#comment-${notification.targetId}`;
        } else if (notification.postType === "report") {
          return `/reports/${notification.postId}#comment-${notification.targetId}`;
        }
        return "/";
      default:
        return "/";
    }
  };

  const handleClick = async () => {
    try {
      if (!notification.read) {
        await fetch(`/api/notifications/read/${notification._id}`, {
          method: "PATCH",
        });
        refreshNotifications();
      }
      navigate(getLink());
      onClose();
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  return (
    <div
      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.read ? "bg-blue-50" : ""} rounded-lg`}
    >
      <div className="flex items-center space-x-3">
        <div className="relative flex-shrink-0">
          <Link to={`/profile/${notification.senderId._id}`}>
            {notification.senderId?.profilePictureUrl ? (
              <img
                src={notification.senderId.profilePictureUrl}
                alt={notification.senderId.username}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-medium text-sm hover:bg-gray-400 transition-colors">
                {notification.senderId.username?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
          </Link>
          <div className="absolute bottom-0 right-0 bg-white rounded-full p-0.5 shadow-sm">
            {getIcon(notification.targetType)}
          </div>
        </div>

        <div className="flex-1 min-w-0"
          onClick={handleClick}>
          <p className="text-sm text-gray-600 line-clamp-2">{getMessage()}</p>
          <p className="text-xs text-gray-500 mt-2">
            {formatRelativeTime(notification.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}
