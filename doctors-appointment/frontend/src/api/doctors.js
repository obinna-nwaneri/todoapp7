import api from "./client.js";

export const listDoctors = async ({ search = "", specialty = "", ordering = "", page = 1 } = {}) => {
  const params = {};
  if (search) params.search = search;
  if (specialty) params.specialty = specialty;
  if (ordering) params.ordering = ordering;
  if (page) params.page = page;
  const response = await api.get("/doctors/", { params });
  return response.data;
};

export const getDoctor = async (id) => {
  const response = await api.get(`/doctors/${id}/`);
  return response.data;
};

export const getSlots = async (id, date) => {
  const response = await api.get(`/doctors/${id}/slots/`, { params: { date } });
  return response.data;
};

export const listSpecialties = async () => {
  const response = await api.get("/specialties/");
  return response.data;
};
