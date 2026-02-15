import express from "express";
import authToken from "../middleware/authToken.js";
import isAdmin from '../middleware/adminAuth.js' // your admin check middleware
import {
  getAllNotifications,
  createNotification,
  markAsRead,
  deleteNotification,
} from "../controllers/notificationController.js";

const router = express.Router();

// ================= PUBLIC / USER ROUTES =================
// Get all notifications for the logged-in user
router.get("/", authToken, getAllNotifications);

// Mark a notification as read (user)
router.put("/read/:id", authToken, markAsRead);

// ================= PROTECTED / ADMIN ROUTES =================
// Create a new notification (admin only)
router.post("/add", authToken, isAdmin, createNotification);

// Delete a notification (admin only)
router.delete("/:id", authToken, isAdmin, deleteNotification);

export default router;
