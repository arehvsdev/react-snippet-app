export interface RegistrationData {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: string;
}

const API_BASE_URL = "http://localhost:5000/api";

/**
 * Registers a new user with the MongoDB backend.
 * @param data - The user's registration details.
 * @returns The created user object mockup.
 */
export const registerUser = async (data: RegistrationData): Promise<any> => {
  console.log('Registering user on backend with data:', data);

  // Automatically generate a valid unique lowercase username
  let cleanUsername = data.fullName.toLowerCase().replace(/[^a-z0-9_]/g, "");
  if (cleanUsername.length < 3) {
    cleanUsername = "user_" + cleanUsername;
  }
  const username = cleanUsername.substring(0, 20) + Math.floor(100 + Math.random() * 900);

  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: data.fullName,
      username: username,
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