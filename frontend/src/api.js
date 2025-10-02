const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const defaultHeaders = () => ({
  'Content-Type': 'application/json'
});

export const request = async (endpoint, { method = 'GET', body, token, params } = {}) => {
  const url = new URL(`${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, value);
      }
    });
  }

  const response = await fetch(url.toString(), {
    method,
    headers: {
      ...defaultHeaders(),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Request failed');
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

export const login = (email, password) =>
  request('/accounts/auth/token/', { method: 'POST', body: { email, password } });

export const refreshToken = (refresh) =>
  request('/accounts/auth/token/refresh/', { method: 'POST', body: { refresh } });

export const registerDoctor = (payload) =>
  request('/accounts/auth/register/doctor/', { method: 'POST', body: payload });

export const registerPatient = (payload) =>
  request('/accounts/auth/register/patient/', { method: 'POST', body: payload });

export const fetchCurrentUser = (token) => request('/accounts/users/me/', { token });

export const fetchDoctors = (token, params) => request('/doctors/', { token, params });
export const fetchPatients = (token, params) => request('/patients/', { token, params });
export const fetchAppointments = (token, params) => request('/appointments/', { token, params });
export const createAppointment = (token, data) =>
  request('/appointments/', { method: 'POST', token, body: data });
export const updateAppointment = (token, id, data) =>
  request(`/appointments/${id}/`, { method: 'PUT', token, body: data });
export const deleteAppointment = (token, id) =>
  request(`/appointments/${id}/`, { method: 'DELETE', token });

export const updateAppointmentPartial = (token, id, data) =>
  request(`/appointments/${id}/`, { method: 'PATCH', token, body: data });
