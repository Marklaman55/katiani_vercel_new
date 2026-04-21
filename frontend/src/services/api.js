const API_URL = import.meta.env.VITE_API_URL;
console.log("API URL:", API_URL);

export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('adminToken');
  const headers = { ...options.headers };

  // Only set application/json if body is not FormData and Content-Type isn't already set
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      credentials: "include",
      ...options,
      headers
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      throw new Error(errorBody.message || `API error: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error("API ERROR:", error);
    return { error: true, message: error.message };
  }
};

// Compatibility layer for existing calls
const api = {
  get: async (url, options) => {
    const res = await apiRequest(url, { ...options, method: 'GET' });
    if (res.error) throw res;
    return { data: res };
  },
  post: async (url, data, options) => {
    const isFormData = data instanceof FormData;
    const body = isFormData ? data : JSON.stringify(data);
    const headers = { ...options?.headers };
    if (!isFormData) headers["Content-Type"] = "application/json";
    
    const res = await apiRequest(url, { ...options, method: 'POST', body, headers });
    if (res.error) throw res;
    return { data: res };
  },
  patch: async (url, data, options) => {
    const isFormData = data instanceof FormData;
    const body = isFormData ? data : JSON.stringify(data);
    const headers = { ...options?.headers };
    if (!isFormData) headers["Content-Type"] = "application/json";

    const res = await apiRequest(url, { ...options, method: 'PATCH', body, headers });
    if (res.error) throw res;
    return { data: res };
  },
  delete: async (url, options) => {
    const res = await apiRequest(url, { ...options, method: 'DELETE' });
    if (res.error) throw res;
    return { data: res };
  },
};

export default api;
