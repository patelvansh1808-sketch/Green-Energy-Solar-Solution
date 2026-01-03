import { useEffect, useState } from "react";
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from "../../services/notificationService";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data.notifications);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      loadNotifications();
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      loadNotifications();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      loadNotifications();
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    if (filter === "read") return n.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return <div className="p-6 text-center">Loading notifications...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-green-700">Notifications</h2>
            <p className="text-gray-500 text-sm">
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-semibold"
            >
              Mark All as Read
            </button>
          )}
        </div>

        {/* FILTERS */}
        <div className="flex gap-2 mb-6">
          {["all", "unread", "read"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded text-sm font-semibold transition ${
                filter === f
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* NOTIFICATIONS LIST */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-white p-6 rounded-lg text-center text-gray-500">
              No notifications to display
            </div>
          ) : (
            filtered.map((notification) => (
              <div
                key={notification._id}
                className={`p-4 rounded-lg border-l-4 transition ${
                  notification.isRead
                    ? "bg-gray-50 border-gray-300"
                    : "bg-blue-50 border-blue-500 shadow-sm"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{notification.icon}</span>
                      <h3 className="font-semibold text-gray-800">
                        {notification.title}
                      </h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-white text-gray-600">
                        {notification.type}
                      </span>
                      {!notification.isRead && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm mb-2">
                      {notification.message}
                    </p>

                    <p className="text-xs text-gray-500">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex gap-2 ml-4">
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification._id)}
                        className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition"
                      >
                        Mark Read
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification._id)}
                      className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
