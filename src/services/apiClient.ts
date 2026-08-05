/**
 * Axios API Client Module
 * Configures Axios instance with base URL, authorization interceptor, and standardized error parsing.
 */
import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Creates and configures an Axios instance with base URL
 */
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

/**
 * Request interceptor to automatically inject Bearer token into headers if logged in
 */
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

/**
 * Standardizes Axios response and error object parsing.
 */
const handleAxiosError = (error: any, defaultMessage: string): Error => {
  const resData = error.response?.data;
  if (resData && resData.errors && Array.isArray(resData.errors) && resData.errors.length > 0) {
    const errorMsg = resData.errors.map((e: any) => e.message || e.msg).join(", ");
    return new Error(errorMsg);
  }
  return new Error(resData?.message || error.message || defaultMessage);
};

/**
 * Custom centralized base Axios client for the application
 */
export const apiClient = {
  async get(endpoint: string): Promise<any> {
    try {
      const response = await axiosInstance.get(endpoint);
      return response.data;
    } catch (error: any) {
      throw handleAxiosError(error, "API GET request failed.");
    }
  },

  async post(endpoint: string, body?: any): Promise<any> {
    try {
      const response = await axiosInstance.post(endpoint, body);
      return response.data;
    } catch (error: any) {
      throw handleAxiosError(error, "API POST request failed.");
    }
  },

  async put(endpoint: string, body?: any): Promise<any> {
    try {
      const response = await axiosInstance.put(endpoint, body);
      return response.data;
    } catch (error: any) {
      throw handleAxiosError(error, "API PUT request failed.");
    }
  },

  async patch(endpoint: string, body?: any): Promise<any> {
    try {
      const response = await axiosInstance.patch(endpoint, body);
      return response.data;
    } catch (error: any) {
      throw handleAxiosError(error, "API PATCH request failed.");
    }
  },

  async delete(endpoint: string): Promise<any> {
    try {
      const response = await axiosInstance.delete(endpoint);
      return response.data;
    } catch (error: any) {
      throw handleAxiosError(error, "API DELETE request failed.");
    }
  },

  async upload(endpoint: string, formData: FormData): Promise<any> {
    try {
      const response = await axiosInstance.patch(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      return response.data;
    } catch (error: any) {
      throw handleAxiosError(error, "File upload failed.");
    }
  }
};
