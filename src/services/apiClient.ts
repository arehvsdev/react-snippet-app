export const API_BASE_URL = "http://localhost:5000/api";

export const getHeaders = (isMultipart = false) => {
  const token = localStorage.getItem("token");
  return {
    ...(isMultipart ? {} : { "Content-Type": "application/json" }),
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
};

/**
 * Standardizes backend error response parsing.
 * Formats express-validator error arrays or standard message strings into clean JavaScript errors.
 */
const parseError = (resData: any, defaultMessage: string): Error => {
  if (resData && resData.errors && Array.isArray(resData.errors) && resData.errors.length > 0) {
    const errorMsg = resData.errors.map((e: any) => e.message || e.msg).join(", ");
    return new Error(errorMsg);
  }
  return new Error(resData?.message || defaultMessage);
};

/**
 * Custom centralized base fetch client for the application
 */
export const apiClient = {
  async get(endpoint: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      headers: getHeaders()
    });
    const resData = await response.json();
    if (!response.ok) throw parseError(resData, "API GET request failed.");
    return resData;
  },

  async post(endpoint: string, body?: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: getHeaders(),
      body: body ? JSON.stringify(body) : undefined
    });
    const resData = await response.json();
    if (!response.ok) throw parseError(resData, "API POST request failed.");
    return resData;
  },

  async put(endpoint: string, body?: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: getHeaders(),
      body: body ? JSON.stringify(body) : undefined
    });
    const resData = await response.json();
    if (!response.ok) throw parseError(resData, "API PUT request failed.");
    return resData;
  },

  async patch(endpoint: string, body?: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: body ? JSON.stringify(body) : undefined
    });
    const resData = await response.json();
    if (!response.ok) throw parseError(resData, "API PATCH request failed.");
    return resData;
  },

  async delete(endpoint: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: getHeaders()
    });
    const resData = await response.json();
    if (!response.ok) throw parseError(resData, "API DELETE request failed.");
    return resData;
  },

  async upload(endpoint: string, formData: FormData): Promise<any> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PATCH",
      headers: getHeaders(true),
      body: formData
    });
    const resData = await response.json();
    if (!response.ok) throw parseError(resData, "File upload failed.");
    return resData;
  }
};
