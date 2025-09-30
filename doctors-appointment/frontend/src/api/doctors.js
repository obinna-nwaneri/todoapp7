import api from "./client.js";

export const listDoctors = async ({ search = "", specialty = "", ordering = "", page = 1 } = {}) => {
  const params = {};
  if (search) params.search = search;
  if (specialty) params.specialty = specialty;
  if (ordering) params.ordering = ordering;
  if (page) params.page = page;
  const { data } = await api.get("/doctors/", { params });
  return data;
};

export const listSpecialties = async () => {
  const { data } = await api.get("/specialties/");
  return data;
};

export const getDoctor = async (id) => {
  const { data } = await api.get(`/doctors/${id}/`);
  return data;
};

export const getSlots = async (id, date) => {
  const { data } = await api.get(`/doctors/${id}/slots/`, { params: { date } });
  return data;
};
