import { apiClient } from './apiClient';

/**
 * Service to manage Admin User actions using the apiClient helper
 */
export const getAllUsers = async (params: { 
  page?: number; 
  limit?: number; 
  search?: string; 
  role?: string; 
  status?: string; 
}): Promise<any> => {
  const query = new URLSearchParams();
  if (params.page) query.append("page", String(params.page));
  if (params.limit) query.append("limit", String(params.limit));
  if (params.search) query.append("search", params.search);
  if (params.role) query.append("role", params.role);
  if (params.status) query.append("status", params.status);

  return apiClient.get(`/admin/users?${query.toString()}`);
};

export const getUserDetails = async (id: string): Promise<any> => {
  return apiClient.get(`/admin/users/${id}`);
};

export const updateUserRole = async (id: string, role: string): Promise<any> => {
  return apiClient.put(`/admin/users/${id}/role`, { role });
};

export const toggleUserStatus = async (id: string, active: boolean): Promise<any> => {
  return apiClient.put(`/admin/users/${id}/status`, { active });
};

export const deleteUser = async (id: string): Promise<any> => {
  return apiClient.delete(`/admin/users/${id}`);
};
