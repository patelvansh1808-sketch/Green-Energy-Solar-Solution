import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getNotifications } from "../services/notificationService";

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    loadNotifications();
    // Poll for new notifications every 10 seconds
    const interval = setInterval(loadNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await getNotifications();
      console.log("Notifications Response:", res.data);
      setUnreadCount(res.data.unreadCount);
      // Get only the 5 most recent notifications
      setRecentNotifications(res.data.notifications.slice(0, 5));
    } catch (error) {
      console.error("Failed to load notifications:", error);
      console.error("Error details:", error.response?.data);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative hover:text-green-200 transition"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white text-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {unreadCount} new
                </span>
              )}
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto">
            {recentNotifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No notifications yet
              </div>
            ) : (
              recentNotifications.map((notif) => (
                <Link
                  key={notif._id}
                  to="/notifications"
                  onClick={() => setShowDropdown(false)}
                  className={`block p-3 border-b hover:bg-gray-50 transition ${
                    !notif.isRead ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{notif.icon || "📢"}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-800">
                        {notif.title}
                      </p>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notif.createdAt).toLocaleDateString()} •{" "}
                        {new Date(notif.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-1"></span>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>

          <Link
            to="/notifications"
            onClick={() => setShowDropdown(false)}
            className="block w-full text-center p-3 hover:bg-green-50 text-green-600 font-semibold border-t"
          >
            View All Notifications
          </Link>
        </div>
      )}
    </div>
  );
}
