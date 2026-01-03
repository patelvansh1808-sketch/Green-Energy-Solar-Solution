import API from "./api";

export const createMessage = async (data) => {
  return API.post("/messages", data);
};

export const getMyMessages = async () => {
  return API.get("/messages");
};

export const getMessage = async (id) => {
  return API.get(`/messages/${id}`);
};

export const addReply = async (id, message) => {
  return API.post(`/messages/${id}/reply`, { message });
};

export const updateMessageStatus = async (id, status) => {
  return API.patch(`/messages/${id}/status`, { status });
};
