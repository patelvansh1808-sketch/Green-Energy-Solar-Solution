import API from "./api";

export const getNotifications = async () => {
  return API.get("/notifications");
};

export const markAsRead = async (id) => {
  return API.patch(`/notifications/${id}/read`);
};

export const markAllAsRead = async () => {
  return API.patch("/notifications/read-all");
};

export const deleteNotification = async (id) => {
  return API.delete(`/notifications/${id}`);
};

export const getUnreadCount = async () => {
  return API.get("/notifications/count/unread");
};

export const createNotification = async (data) => {
  return API.post("/notifications", data);
};
