import api from './client'

export async function listDoctors(params = {}) {
  const response = await api.get('/doctors', { params })
  return response.data
}

export async function getDoctor(id) {
  const response = await api.get(`/doctors/${id}`)
  return response.data
}

export async function getDoctorSlots(id, date) {
  const response = await api.get(`/doctors/${id}/slots/`, { params: { date } })
  return response.data
}

export async function listSpecialties() {
  const response = await api.get('/specialties')
  return response.data
}
