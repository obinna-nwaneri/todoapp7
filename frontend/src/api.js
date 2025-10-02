const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const getHeaders = (token, isJSON = true) => {
  const headers = {};
  if (isJSON) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export const apiRequest = async (path, { method = "GET", body, token, isForm = false } = {}) => {
  const options = {
    method,
    headers: getHeaders(token, !isForm)
  };

  if (body && !isForm) {
    options.body = JSON.stringify(body);
  } else if (body) {
    options.body = body;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const fieldErrors =
      data && typeof data === "object" && !Array.isArray(data)
        ? Object.values(data)
            .flatMap((value) => (Array.isArray(value) ? value : [value]))
            .join(" ")
        : null;
    throw new Error(data?.detail || data?.non_field_errors?.join(" ") || fieldErrors || "An error occurred");
  }

  return data;
};

export const endpoints = {
  register: "/api/auth/register/",
  login: "/api/auth/login/",
  refresh: "/api/auth/refresh/",
  me: "/api/auth/me/",
  changePassword: "/api/auth/change-password/",
  doctors: "/api/doctors/",
  appointments: "/api/appointments/",
  upcomingAppointments: "/api/appointments/upcoming/",
  pastAppointments: "/api/appointments/history/",
  adminAppointments: "/api/admin/appointments/",
  adminDoctor: "/api/doctors/"
};
