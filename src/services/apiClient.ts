/**
 * Axios API Client Module
 * Configures Axios instance with base URL, authorization interceptor, 401 unauthorized response handling, and standardized error parsing.
 */
import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Creates and configures an Axios instance with base URL
 */
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor to automatically inject Bearer token into headers if present
 */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor to clear credentials and redirect on 401 Unauthorized status
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear invalid or expired token credentials from localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Prevent infinite redirect loops if user is already on public/auth routes
      const currentPath = window.location.pathname;
      if (
        currentPath !== "/" &&
        currentPath !== "/login" &&
        currentPath !== "/register"
      ) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Standardizes Axios response and error object parsing.
 */
const handleAxiosError = (error: unknown, defaultMessage: string): Error => {
  const err = error as { response?: { data?: { message?: string; errors?: { message?: string; msg?: string }[] } }; message?: string };
  const resData = err.response?.data;
  if (resData && resData.errors && Array.isArray(resData.errors) && resData.errors.length > 0) {
    const errorMsg = resData.errors.map((e) => e.message || e.msg).join(", ");
    return new Error(errorMsg);
  }
  return new Error(resData?.message || err.message || defaultMessage);
};

/**
 * Custom centralized base Axios client for the application
 */
export const apiClient = {
  async get(endpoint: string): Promise<any> {
    try {
      const response = await axiosInstance.get(endpoint);
      return response.data;
    } catch (error: unknown) {
      throw handleAxiosError(error, "API GET request failed.");
    }
  },

  async post(endpoint: string, body?: unknown): Promise<any> {
    try {
      const response = await axiosInstance.post(endpoint, body);
      return response.data;
    } catch (error: unknown) {
      throw handleAxiosError(error, "API POST request failed.");
    }
  },

  async put(endpoint: string, body?: unknown): Promise<any> {
    try {
      const response = await axiosInstance.put(endpoint, body);
      return response.data;
    } catch (error: unknown) {
      throw handleAxiosError(error, "API PUT request failed.");
    }
  },

  async patch(endpoint: string, body?: unknown): Promise<any> {
    try {
      const response = await axiosInstance.patch(endpoint, body);
      return response.data;
    } catch (error: unknown) {
      throw handleAxiosError(error, "API PATCH request failed.");
    }
  },

  async delete(endpoint: string): Promise<any> {
    try {
      const response = await axiosInstance.delete(endpoint);
      return response.data;
    } catch (error: unknown) {
      throw handleAxiosError(error, "API DELETE request failed.");
    }
  },

  async upload(endpoint: string, formData: FormData): Promise<any> {
    try {
      const response = await axiosInstance.patch(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: unknown) {
      throw handleAxiosError(error, "File upload failed.");
    }
  },
};
