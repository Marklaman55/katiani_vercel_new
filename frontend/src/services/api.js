const API_URL = import.meta.env.VITE_API_URL || "";
console.log("API URL:", API_URL || "(relative)");

export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('adminToken');
  const headers = { ...options.headers };
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

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
      headers,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const contentType = res.headers.get("content-type");
    
    if (!res.ok) {
      let errorMessage = `API error: ${res.status}`;
      
      if (contentType && contentType.includes("application/json")) {
        try {
          const errorBody = await res.json();
          console.error("API Error Body:", errorBody);
          errorMessage = errorBody.message || errorMessage;
          if (errorBody.debug) errorMessage += ` (Debug: ${errorBody.debug})`;
        } catch (e) {
          console.error("Failed to parse JSON error:", e);
        }
      } else {
        const text = await res.text().catch(() => "");
        console.error("Non-JSON error response:", text.substring(0, 500));
        errorMessage = `Server returned HTML/Text instead of JSON. (Status: ${res.status}). Error starts with: ${text.substring(0, 50).replace(/<[^>]*>?/gm, '')}`;
      }
      throw new Error(errorMessage);
    }

    if (contentType && contentType.includes("application/json")) {
      return await res.json();
    } else {
      const text = await res.text();
      console.error("Expected JSON but got:", text.substring(0, 100));
      throw new Error(`Expected JSON but received: ${text.substring(0, 20).replace(/<[^>]*>?/gm, '')}... This usually happens when an API route is missing and the server yields index.html instead.`);
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. The server might be waking up or struggling to connect to the database.');
    }
    console.error("API ERROR:", error);
    throw error;
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
