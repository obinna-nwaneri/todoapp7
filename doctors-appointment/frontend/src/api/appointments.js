import api from './client'

export async function listMyAppointments(params = {}) {
  const response = await api.get('/appointments', { params })
  return response.data
}

export async function listDoctorAppointments(params = {}) {
  const response = await api.get('/appointments', { params })
  return response.data
}

export async function createAppointment(payload) {
  const response = await api.post('/appointments/', payload)
  return response.data
}

export async function updateStatus(id, status) {
  const response = await api.patch(`/appointments/${id}/`, { status })
  return response.data
}

export async function cancelAppointment(id) {
  return api.delete(`/appointments/${id}/`)
}
