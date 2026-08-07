import { apiClient } from "./apiClient";

export interface RegistrationData {
  fullName: string;
  username: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: string;
}

export interface UserProfileResponse {
  uid: string;
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  createdAt: string;
  username: string;
  bio: string;
  avatar: string;
  plan: "FREE" | "PRO";
}

/**
 * Checks if a username is available.
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
 * Registers a new user with the backend.
 */
export const registerUser = async (data: RegistrationData): Promise<unknown> => {
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
 * Logs in a user by checking credentials against the backend.
 */
export const loginUser = async (email: string, password: string): Promise<UserProfileResponse & { token?: string }> => {
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
    plan: backendUser.subscription?.plan || "FREE",
    token: token
  };
};

/**
 * Validates the stored JWT token with backend via GET /api/auth/me.
 * Returns normalized User object if token is valid, throws error if 401/expired.
 */
export const getMe = async (): Promise<UserProfileResponse> => {
  const resData = await apiClient.get("/auth/me");
  const backendUser = resData.user || resData.data;

  if (!backendUser) {
    throw new Error("Invalid token session.");
  }

  return {
    uid: backendUser._id || backendUser.id,
    id: backendUser._id || backendUser.id,
    fullName: backendUser.name || backendUser.fullName || "User",
    email: backendUser.email,
    phoneNumber: backendUser.phonenumber || backendUser.phoneNumber || "",
    role: backendUser.role || "developer",
    createdAt: backendUser.createdAt || new Date().toISOString(),
    username: backendUser.username || "",
    bio: backendUser.bio || "",
    avatar: backendUser.avatar || "",
    plan: backendUser.subscription?.plan || backendUser.plan || "FREE",
  };
};

/**
 * Verifies if an email exists on the backend.
 */
export const verifyEmail = async (email: string): Promise<boolean> => {
  await apiClient.post("/auth/verify-email", { email });
  return true;
};

/**
 * Resets the password for a registered email.
 */
export const resetPassword = async (email: string, password: string): Promise<boolean> => {
  await apiClient.post("/auth/reset-password", { email, password });
  return true;
};