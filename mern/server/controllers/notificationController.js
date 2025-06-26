import NotificationService from "../services/notificationService.js";

const NotificationController = {
  async create(req, res) {
    try {
      const notification = await NotificationService.createNotification(req.body);
      res.status(201).json(notification);
    } catch (err) {
      console.error("Error creating notification:", err);
      res.status(500).json({ message: "Failed to create notification" });
    }
  },

  async getByUser(req, res) {
    try {
      const userId = req.params.userId;
      const notifications = await NotificationService.getNotificationsByUser(userId);
      res.json(notifications);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  },

  async markRead(req, res) {
    try {
      const { id } = req.params;
      const updated = await NotificationService.markAsRead(id);
      res.json(updated);
    } catch (err) {
      console.error("Error marking notification as read:", err);
      res.status(500).json({ message: "Failed to update notification" });
    }
  },

  async markAllRead(req, res) {
    try {
      const userId = req.params.userId;
      await NotificationService.markAllAsRead(userId);
      res.json({ message: "All notifications marked as read" });
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      res.status(500).json({ message: "Failed to mark all as read" });
    }
  },
};

export default NotificationController;
