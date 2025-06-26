import Notification from "../models/Notification.js";

const NotificationService = {
  async createNotification({ recipientId, senderId, type, targetType, targetId }) {
    const newNotification = new Notification({
      recipientId,
      senderId,
      type,
      targetType,
      targetId,
    });
    return await newNotification.save();
  },

  async getNotificationsByUser(userId) {
    return await Notification.find({ recipientId: userId })
      .sort({ createdAt: -1 })
      .populate("senderId", "username")
      .lean();
  },

  async markAsRead(notificationId) {
    return await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );
  },

  async markAllAsRead(userId) {
    return await Notification.updateMany(
      { recipientId: userId, read: false },
      { read: true }
    );
  }
};

export default NotificationService;
