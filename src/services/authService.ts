export interface RegistrationData {
  fullName: string;
  username: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: string;
}

const API_BASE_URL = "http://localhost:5000/api";

/**
 * Checks if a username is available.
 * @param username - The username to check.
 * @returns boolean indicating if the username is available (true) or taken (false).
 */
export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/check-username?username=${encodeURIComponent(username.trim())}`);
    const resData = await response.json();
    if (!response.ok) {
      return false;
    }
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
  console.log('Registering user on backend with data:', data);

  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: data.fullName,
      username: data.username.trim().toLowerCase(),
      email: data.email,
      password: data.password,
      phonenumber: data.phoneNumber,
      role: data.role
    })
  });

  const resData = await response.json();

  if (!response.ok) {
    const errorMsg = resData.errors && resData.errors.length > 0
      ? resData.errors.map((e: any) => e.message).join(", ")
      : (resData.message || "Failed to register.");
    throw new Error(errorMsg);
  }

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
  console.log(`Attempting to log in user via backend: ${email}`);

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const resData = await response.json();

  if (!response.ok) {
    const errorMsg = resData.errors && resData.errors.length > 0
      ? resData.errors.map((e: any) => e.message).join(", ")
      : (resData.message || "Invalid email or password.");
    throw new Error(errorMsg);
  }

  const token = resData.token;
  const backendUser = resData.user || (resData.data && resData.data.user) || resData.data;

  if (!backendUser) {
    throw new Error("User data not returned from server.");
  }

  console.log('Login successful for user:', backendUser.email);

  // Return the user data mapped to frontend compatibility, including the JWT token
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
  const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });

  const resData = await response.json();
  if (!response.ok) {
    throw new Error(resData.message || "Email is not registered.");
  }
  return true;
};

/**
 * Resets the password for a registered email.
 * @param email - The user's email.
 * @param password - The new password.
 */
export const resetPassword = async (email: string, password: string): Promise<boolean> => {
  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const resData = await response.json();
  if (!response.ok) {
    throw new Error(resData.message || "Failed to reset password.");
  }
  return true;
};