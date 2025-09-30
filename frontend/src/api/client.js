const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const buildHeaders = (token) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = data?.message || 'Request failed';
    throw new Error(error);
  }
  return data;
};

export const loginRequest = async (credentials) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(credentials)
  });
  return handleResponse(response);
};

export const fetchContacts = async ({ token, search }) => {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  const response = await fetch(`${API_URL}/contacts${query}`, {
    headers: buildHeaders(token)
  });
  return handleResponse(response);
};

export const fetchContact = async ({ token, id }) => {
  const response = await fetch(`${API_URL}/contacts/${id}`, {
    headers: buildHeaders(token)
  });
  return handleResponse(response);
};

export const createContact = async ({ token, values }) => {
  const response = await fetch(`${API_URL}/contacts`, {
    method: 'POST',
    headers: buildHeaders(token),
    body: JSON.stringify(values)
  });
  return handleResponse(response);
};

export const updateContact = async ({ token, id, values }) => {
  const response = await fetch(`${API_URL}/contacts/${id}`, {
    method: 'PUT',
    headers: buildHeaders(token),
    body: JSON.stringify(values)
  });
  return handleResponse(response);
};

export const deleteContact = async ({ token, id }) => {
  const response = await fetch(`${API_URL}/contacts/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(token)
  });
  return handleResponse(response);
};
