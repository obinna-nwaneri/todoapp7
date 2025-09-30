import api from "./client.js";

export const listMine = async () => {
  const response = await api.get("/appointments/");
  return response.data;
};

export const createAppointment = async (payload) => {
  const response = await api.post("/appointments/", payload);
  return response.data;
};

export const updateStatus = async (id, status) => {
  const response = await api.patch(`/appointments/${id}/`, { status });
  return response.data;
};

export const cancelAppointment = async (id) => {
  const response = await api.post(`/appointments/${id}/cancel/`);
  return response.data;
};
