const API_BASE_URL = "http://localhost:5000/api";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
};

/**
 * Fetches user profile data from the MongoDB database via API.
 * @param id - Optional user ID (not strictly needed as auth token determines the profile).
 * @returns The user's profile details.
 */
export const getUserProfile = async (id?: number | string): Promise<any> => {
  console.log(`Fetching profile data from backend. ID parameter (ignored): ${id}`);
  
  const response = await fetch(`${API_BASE_URL}/users/profile`, {
    method: "GET",
    headers: getHeaders()
  });

  const resData = await response.json();

  if (!response.ok) {
    throw new Error(resData.message || "Failed to fetch user profile.");
  }

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
  console.log("Updating profile data on backend:", data);

  const response = await fetch(`${API_BASE_URL}/users/profile`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({
      name: data.fullName,
      username: data.username,
      phonenumber: data.phoneNumber,
      bio: data.bio
    })
  });

  const resData = await response.json();

  if (!response.ok) {
    const errorMsg = resData.errors && resData.errors.length > 0
      ? resData.errors.map((e: any) => e.message).join(", ")
      : (resData.message || "Failed to update profile.");
    throw new Error(errorMsg);
  }

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
  console.log("Uploading user avatar file to backend:", file.name);

  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await fetch(`${API_BASE_URL}/users/avatar`, {
    method: "PATCH",
    headers: token ? { "Authorization": `Bearer ${token}` } : {},
    body: formData
  });

  const resData = await response.json();

  if (!response.ok) {
    const errorMsg = resData.errors && resData.errors.length > 0
      ? resData.errors.map((e: any) => e.message).join(", ")
      : (resData.message || "Failed to upload avatar.");
    throw new Error(errorMsg);
  }

  return resData.avatar || (resData.data && resData.data.avatar);
};
