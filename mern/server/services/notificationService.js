import Notification from "../models/Notification.js";

class NotificationService {
  static async createNotification({ recipientId, senderId, type, targetType, targetId }) {
    const newNotification = new Notification({
      recipientId,
      senderId,
      type,
      targetType,
      targetId,
    });
    return await newNotification.save();
  }

  static async getNotificationsByUser(userId) {
    const notifications = await Notification.find({ recipientId: userId })
      .sort({ createdAt: -1 })
      .populate("senderId", "username")
      .lean();

    console.log("Fetched notifications for user:", userId);
    console.log("Notifications:", notifications);

    return notifications;
  }

  static async markAsRead(notificationId) {
    return await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );
  }

  static async markAllAsRead(userId) {
    return await Notification.updateMany(
      { recipientId: userId, read: false },
      { read: true }
    );
  }
}

export default NotificationService;
