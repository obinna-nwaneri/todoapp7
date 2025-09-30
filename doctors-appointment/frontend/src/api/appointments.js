import api from "./client.js";

export const listAppointments = async (params = {}) => {
  const { data } = await api.get("/appointments/", { params });
  return data;
};

export const createAppointment = async (payload) => {
  const { data } = await api.post("/appointments/", payload);
  return data;
};

export const updateStatus = async (id, status) => {
  const { data } = await api.patch(`/appointments/${id}/`, { status });
  return data;
};

export const rescheduleAppointment = async (id, payload) => {
  const { data } = await api.patch(`/appointments/${id}/`, payload);
  return data;
};

export const cancelAppointment = async (id) => {
  const { data } = await api.patch(`/appointments/${id}/`, { status: "CANCELLED" });
  return data;
};
