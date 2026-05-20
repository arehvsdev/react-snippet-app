import { getDB, saveDB } from './dbService';

export interface RegistrationData {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: string;
}

/**
 * Registers a new user with email/password and stores their profile in db.json (localStorage).
 * @param data - The user's registration details.
 * @returns The created user object mockup.
 */
export const registerUser = async (data: RegistrationData): Promise<any> => {
  console.log('Registering user with data:', data);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const db = getDB();

  // Check if user already exists
  const emailExists = db.users.some(
    user => user.email.toLowerCase() === data.email.toLowerCase()
  );
  if (emailExists) {
    throw new Error('Email already in use.');
  }

  // Create a new user ID (incrementing from max current ID)
  const nextId = db.users.reduce((max, u) => u.id > max ? u.id : max, 0) + 1;

  const newUser = {
    id: nextId,
    fullName: data.fullName,
    email: data.email,
    phoneNumber: data.phoneNumber,
    role: data.role,
    password: data.password,
    active: true,
    plan: 'free',
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  saveDB(db);

  console.log('User registered! Database updated.');

  return { uid: String(newUser.id), email: newUser.email };
};

/**
 * Logs in a user by checking credentials against the database.
 * @param email The user's email.
 * @param password The user's password.
 * @returns The user object if login is successful.
 */
export const loginUser = async (email: string, password: string): Promise<any> => {
  console.log(`Attempting to log in user: ${email}`);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const db = getDB();

  // Find the user by email
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

  // Check if user exists and if the password matches
  if (!user || user.password !== password) {
    throw new Error('Invalid email or password.');
  }

  console.log('Login successful for user:', user.email);

  // Return the user data without the password, mapping id to uid for compatibility
  const { password: _, ...userToReturn } = user;
  return {
    ...userToReturn,
    uid: String(user.id),
  };
};