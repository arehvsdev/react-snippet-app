export const API_BASE_URL = "http://localhost:5000/api";

export const getHeaders = (isMultipart = false) => {
  const token = localStorage.getItem("token");
  return {
    ...(isMultipart ? {} : { "Content-Type": "application/json" }),
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
};

/**
 * Custom base fetch helper client for the application services
 */
export const apiClient = {
  async get(endpoint: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      headers: getHeaders()
    });
    const resData = await response.json();
    if (!response.ok) throw new Error(resData.message || "API request failed");
    return resData;
  },

  async post(endpoint: string, body?: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: getHeaders(),
      body: body ? JSON.stringify(body) : undefined
    });
    const resData = await response.json();
    if (!response.ok) throw new Error(resData.message || "API request failed");
    return resData;
  },

  async put(endpoint: string, body?: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: getHeaders(),
      body: body ? JSON.stringify(body) : undefined
    });
    const resData = await response.json();
    if (!response.ok) throw new Error(resData.message || "API request failed");
    return resData;
  },

  async delete(endpoint: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: getHeaders()
    });
    const resData = await response.json();
    if (!response.ok) throw new Error(resData.message || "API request failed");
    return resData;
  }
};
