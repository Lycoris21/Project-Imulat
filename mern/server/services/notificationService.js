import Notification from "../models/Notification.js";
import { io } from "../server.js";

class NotificationService {
  static async createNotification({ recipientId, senderId, type, targetType, targetId }) {
    const newNotification = new Notification({
      recipientId,
      senderId,
      type,
      targetType,
      targetId,
    });

    const saved = await newNotification.save();

    // Emit to recipient via Socket.IO
    io.to(recipientId.toString()).emit("new-notification", saved);

    return saved;
  }

  static async getNotificationsByUser(userId) {
    const notifications = await Notification.find({ recipientId: userId })
      .sort({ createdAt: -1 })
      .populate("senderId", "username profilePictureUrl")
      .lean();

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
