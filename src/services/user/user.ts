import { getDB } from '../dbService';

/**
 * Fetches user profile data from the database by user ID.
 * @param id - The ID of the user.
 * @returns The user's profile details.
 */
export const getUserProfile = async (id: number | string): Promise<any> => {
  console.log(`Fetching profile data for user ID: ${id}`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const db = getDB();
  const userId = typeof id === 'string' ? parseInt(id, 10) : id;
  const user = db.users.find(u => u.id === userId);

  if (!user) {
    throw new Error('User not found.');
  }

  // Return the user profile data (without password), mapping id to uid for compatibility
  const { password: _, ...profile } = user;
  return {
    ...profile,
    uid: String(profile.id),
  };
};
