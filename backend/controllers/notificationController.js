import Notification from "../models/notificationModel.js";

// Get all notifications (admin or all users)
export const getAllNotifications = async (req, res) => {
  try {
    // If you want user-specific notifications
    const userId = req.userId; // set by authToken middleware
    const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Mark a notification as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notif = await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    );

    if (!notif) return res.status(404).json({ success: false, message: "Notification not found" });

    res.status(200).json({ success: true, notification: notif });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Create a new notification (admin only)
export const createNotification = async (req, res) => {
  try {
    const { title, message, user } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: "Title and message are required" });
    }

    const newNotif = await Notification.create({ title, message, user });
    res.status(201).json({ success: true, notification: newNotif });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Delete a notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notif = await Notification.findByIdAndDelete(id);

    if (!notif) return res.status(404).json({ success: false, message: "Notification not found" });

    res.status(200).json({ success: true, message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
