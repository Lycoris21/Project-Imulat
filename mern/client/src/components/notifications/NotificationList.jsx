import React from "react";
import NotificationItem from "./NotificationItem";

export default function NotificationList({ notifications, onClose, refreshNotifications}) {
  return (
    <div className="divide-y divide-gray-200 max-h-100 overflow-y-auto">
      {notifications.map((n) => (
        <NotificationItem
          key={n._id}
          notification={n}
          onClose={onClose} 
          refreshNotifications={refreshNotifications}
        />
      ))}
    </div>
  );
}
