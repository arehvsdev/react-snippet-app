import { apiClient } from "./apiClient";

export interface RegistrationData {
  fullName: string;
  username: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: string;
}

/**
 * Checks if a username is available.
 * @param username - The username to check.
 * @returns boolean indicating if the username is available (true) or taken (false).
 */
export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  try {
    const resData = await apiClient.get(`/auth/check-username?username=${encodeURIComponent(username.trim())}`);
    return !!resData.available;
  } catch (error) {
    console.error("Error checking username availability:", error);
    return false;
  }
};

/**
 * Registers a new user with the MongoDB backend.
 * @param data - The user's registration details.
 * @returns The created user object mockup.
 */
export const registerUser = async (data: RegistrationData): Promise<any> => {
  const resData = await apiClient.post("/auth/register", {
    name: data.fullName,
    username: data.username.trim().toLowerCase(),
    email: data.email,
    password: data.password,
    phonenumber: data.phoneNumber,
    role: data.role
  });

  const backendUser = resData.user || resData.data;
  return {
    uid: backendUser._id,
    id: backendUser._id,
    email: backendUser.email
  };
};

/**
 * Logs in a user by checking credentials against the MongoDB database.
 * @param email The user's email.
 * @param password The user's password.
 * @returns The user object if login is successful.
 */
export const loginUser = async (email: string, password: string): Promise<any> => {
  const resData = await apiClient.post("/auth/login", { email, password });

  const token = resData.token;
  const backendUser = resData.user || (resData.data && resData.data.user) || resData.data;

  if (!backendUser) {
    throw new Error("User data not returned from server.");
  }

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
    avatar: backendUser.avatar || "",
    token: token
  };
};

/**
 * Verifies if an email exists on the backend.
 * @param email - The email to verify.
 */
export const verifyEmail = async (email: string): Promise<boolean> => {
  await apiClient.post("/auth/verify-email", { email });
  return true;
};

/**
 * Resets the password for a registered email.
 * @param email - The user's email.
 * @param password - The new password.
 */
export const resetPassword = async (email: string, password: string): Promise<boolean> => {
  await apiClient.post("/auth/reset-password", { email, password });
  return true;
};