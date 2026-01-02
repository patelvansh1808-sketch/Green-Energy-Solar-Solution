import api from "./api";

export const createCustomer = (data) =>
  api.post("/customers", data);

export const getMyCustomer = () =>
  api.get("/customers/me");

export const getAllCustomers = () =>
  api.get("/customers");

export const updateCustomerStatus = (id, status) =>
  api.patch(`/customers/${id}/status`, { status });
