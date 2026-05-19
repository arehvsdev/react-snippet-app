import type { User } from 'firebase/auth';

/**
 * =================================================================
 * MOCK DATABASE AND AUTHENTICATION SERVICE
 * =================================================================
 * This is a simple in-memory array to simulate a user database.
 * Each registration will add a new user object to this array.
 * NOTE: For a real application, NEVER store plain text passwords.
 * This is only for demonstration purposes.
 */
const usersDB: any[] = [];

// This helps ensure type safety.
export interface RegistrationData {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: string;
}

/**
 * Registers a new user with email/password and stores their profile in Firestore.
 * @param data - The user's registration details.
 * @returns The created user object from Firebase Auth.
 */
export const registerUser = async (data: RegistrationData): Promise<User> => {
  console.log('Registering user with data:', data);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // --- Mock Backend Logic ---

  // Check if user already exists
  if (usersDB.find(user => user.email === data.email)) {
    // In a real app, you'd throw a more specific error.
    // Firebase throws 'auth/email-already-in-use'.
    throw new Error('Email already in use.');
  }

  // Create a new user object and add it to our mock database
  const newUser = {
    uid: `mock-uid-${Date.now()}`, // Generate a simple unique ID
    ...data,
    createdAt: new Date().toISOString(),
  };

  // For our mock login to work, we need to store the password.
  // In a real application, you would store a HASH of the password, not the password itself.
  // delete (newUser as any).password;

  usersDB.push(newUser);

  console.log('User registered! Mock Database:', usersDB);

  // Return a mock user object that satisfies the `User` type from Firebase
  return { uid: newUser.uid, email: newUser.email } as User;
};

/**
 * Logs in a user by checking credentials against the mock database.
 * @param email The user's email.
 * @param password The user's password.
 * @returns The user object if login is successful.
 */
export const loginUser = async (email: string, password: string): Promise<any> => {
  console.log(`Attempting to log in user: ${email}`);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // --- Mock Backend Logic ---

  // Find the user by email
  const user = usersDB.find(u => u.email === email);

  // Check if user exists and if the password matches
  if (!user || user.password !== password) {
    // In a real app, you'd throw a more specific error.
    // Firebase throws 'auth/invalid-credential'.
    throw new Error('Invalid email or password.');
  }

  console.log('Login successful for user:', user.email);

  // Return the user data (without the password)
  const { password: _, ...userToReturn } = user;
  return userToReturn;
};