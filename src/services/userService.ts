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

/**
 * Service to manage User Profile actions using the apiClient helper
 */
export const getUserProfile = async (): Promise<any> => {
  return apiClient.get('/users/profile');
};

export const updateUserProfile = async (data: { 
  name?: string; 
  fullName?: string;
  username?: string; 
  bio?: string; 
  phonenumber?: string; 
  phoneNumber?: string;
}): Promise<any> => {
  return apiClient.put('/users/profile', {
    name: data.name || data.fullName,
    username: data.username,
    bio: data.bio,
    phonenumber: data.phonenumber || data.phoneNumber
  });
};

export const updateUserAvatar = async (fileOrFormData: File | FormData): Promise<any> => {
  let formData: FormData;
  if (fileOrFormData instanceof FormData) {
    formData = fileOrFormData;
  } else {
    formData = new FormData();
    formData.append("avatar", fileOrFormData);
  }
  return apiClient.upload('/users/avatar', formData);
};

export const changeUserPassword = async (data: { currentPassword?: string; newPassword?: string }): Promise<any> => {
  return apiClient.put('/users/change-password', data);
};
