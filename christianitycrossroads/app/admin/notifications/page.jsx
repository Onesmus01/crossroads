"use client";

import { useState, useEffect } from "react";

let backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newNotif, setNewNotif] = useState({ title: "", message: "" });
  const [adding, setAdding] = useState(false);

  // Fetch all notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${backendUrl}/notifications`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setNotifications(data.notifications || []);
      else alert("Failed to fetch notifications");
    } catch (error) {
      console.error("Error fetching notifications:", error);
      alert("Error fetching notifications");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      const res = await fetch(`${backendUrl}/notification/read/${id}`, {
        method: "PUT",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, read: true } : n))
        );
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  // Delete notification (admin)
  const deleteNotification = async (id) => {
    if (!confirm("Are you sure you want to delete this notification?")) return;
    try {
      const res = await fetch(`${backendUrl}/notification/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) => prev.filter((n) => n._id !== id));
      } else alert("Failed to delete notification");
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // Add new notification (admin)
  const handleAddNotification = async (e) => {
    e.preventDefault();
    if (!newNotif.title || !newNotif.message) return;
    setAdding(true);
    try {
      const res = await fetch(`${backendUrl}/notification/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newNotif),
      });
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) => [data.notification, ...prev]);
        setNewNotif({ title: "", message: "" });
      } else alert(data.message || "Failed to add notification");
    } catch (error) {
      console.error("Error adding notification:", error);
    }
    setAdding(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>

      {/* Add Notification Form (admin only) */}
      <form onSubmit={handleAddNotification} className="mb-6 space-y-2">
        <input
          type="text"
          placeholder="Title"
          value={newNotif.title}
          onChange={(e) => setNewNotif({ ...newNotif, title: e.target.value })}
          className="w-full border px-3 py-2 rounded"
        />
        <textarea
          placeholder="Message"
          value={newNotif.message}
          onChange={(e) => setNewNotif({ ...newNotif, message: e.target.value })}
          className="w-full border px-3 py-2 rounded"
        />
        <button
          type="submit"
          disabled={adding}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:opacity-90"
        >
          {adding ? "Adding..." : "Add Notification"}
        </button>
      </form>

      {/* Notifications List */}
      {loading ? (
        <p>Loading...</p>
      ) : notifications.length === 0 ? (
        <p>No notifications found.</p>
      ) : (
        <ul className="space-y-4">
          {notifications.map((notif) => (
            <li
              key={notif._id}
              className={`p-4 border rounded-lg flex justify-between items-start ${
                notif.read ? "bg-gray-50" : "bg-blue-50"
              }`}
            >
              <div>
                <h2 className="font-semibold text-gray-800">{notif.title}</h2>
                <p className="text-gray-700 mt-1">{notif.message}</p>
                <span className="text-sm text-gray-500">
                  {new Date(notif.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col gap-2 ml-4">
                {!notif.read && (
                  <button
                    onClick={() => markAsRead(notif._id)}
                    className="text-sm bg-green-500 text-white px-2 py-1 rounded hover:opacity-90"
                  >
                    Mark as read
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notif._id)}
                  className="text-sm bg-red-500 text-white px-2 py-1 rounded hover:opacity-90"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
