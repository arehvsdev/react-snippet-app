import { apiClient } from "../apiClient";

/**
 * Fetches user profile data from the MongoDB database via API.
 * @param id - Optional user ID (not strictly needed as auth token determines the profile).
 * @returns The user's profile details.
 */
export const getUserProfile = async (_id?: number | string): Promise<any> => {
  const resData = await apiClient.get('/users/profile');
  const backendUser = resData.user || resData.data;

  return {
    uid: backendUser._id,
    id: backendUser._id,
    fullName: backendUser.name,
    email: backendUser.email,
    phoneNumber: backendUser.phonenumber,
    role: backendUser.role,
    createdAt: backendUser.createdAt,
    username: backendUser.username,
    bio: backendUser.bio || "",
    avatar: backendUser.avatar || ""
  };
};

/**
 * Updates user profile data on the MongoDB database via API.
 * @param data - Profile fields to update.
 */
export const updateUserProfile = async (data: {
  fullName: string;
  username: string;
  phoneNumber: string;
  bio: string;
}): Promise<any> => {
  const resData = await apiClient.put('/users/profile', {
    name: data.fullName,
    username: data.username,
    phonenumber: data.phoneNumber,
    bio: data.bio
  });

  const backendUser = resData.user || resData.data;
  return {
    uid: backendUser._id,
    id: backendUser._id,
    fullName: backendUser.name,
    email: backendUser.email,
    phoneNumber: backendUser.phonenumber,
    role: backendUser.role,
    createdAt: backendUser.createdAt,
    username: backendUser.username,
    bio: backendUser.bio || "",
    avatar: backendUser.avatar || ""
  };
};

/**
 * Updates user avatar file on the MongoDB database via multipart form upload.
 * @param file - The image file object.
 * @returns The newly created avatar file URL.
 */
export const updateUserAvatar = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("avatar", file);

  const resData = await apiClient.upload('/users/avatar', formData);
  return resData.avatar || (resData.data && resData.data.avatar);
};

/**
 * Changes password for the authenticated user.
 */
export const changeUserPassword = async (data: {
  currentPassword: string;
  newPassword: string;
}): Promise<boolean> => {
  await apiClient.put('/users/change-password', data);
  return true;
};
