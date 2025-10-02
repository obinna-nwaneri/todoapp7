export const apiRequest = async (endpoint, { method = "GET", body, tokens, headers = {} } = {}) => {
  const config = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers
    }
  };

  if (tokens?.access) {
    config.headers.Authorization = `Bearer ${tokens.access}`;
  }

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`/api/${endpoint}`, config);
  const contentType = response.headers.get("content-type");
  const data = contentType && contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    const detail = data?.detail || data?.non_field_errors?.[0];
    const message = detail || (typeof data === "string" ? data : "Something went wrong.");
    throw new Error(message);
  }

  return data;
};
