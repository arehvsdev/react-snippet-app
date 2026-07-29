import dbData from '../utils/db.json';

const DB_KEY = 'snippet_app_db_v3';

export interface User {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  password?: string;
  active: boolean;
  plan: string;
  createdAt: string;
  username?: string;
  bio?: string;
  avatar?: string;
}

export interface DatabaseSchema {
  users: User[];
  snippets: any[];
  bookmarks: any[];
  tags: any[];
}

// Initialize database in localStorage if it doesn't exist
const initializeDB = (): DatabaseSchema => {
  const stored = localStorage.getItem(DB_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Sync users fields (username, bio, avatar) and bookmarks from dbData if they are not yet in localStorage
      const needsUserUpdate = parsed.users && parsed.users.some((u: any) => !u.username);
      const needsBookmarks = !parsed.bookmarks || parsed.bookmarks.length === 0;
      if (needsUserUpdate || needsBookmarks) {
        // Merge users instead of overwriting to preserve new registrations
        const existingUsers = new Map(parsed.users.map((u: User) => [u.email, u]));
        dbData.users.forEach((defaultUser: User) => {
          if (!existingUsers.has(defaultUser.email)) {
            existingUsers.set(defaultUser.email, defaultUser);
          }
        });

        const updated = {
          ...parsed,
          users: Array.from(existingUsers.values()),
          bookmarks: dbData.bookmarks && dbData.bookmarks.length > 0 ? dbData.bookmarks : (parsed.bookmarks || [])
        };
        localStorage.setItem(DB_KEY, JSON.stringify(updated));
        return updated;
      }
      return parsed;
    } catch (e) {
      console.error("Error parsing stored DB, resetting to default db.json:", e);
    }
  }
  
  // Save initial dbData to localStorage
  localStorage.setItem(DB_KEY, JSON.stringify(dbData));
  return dbData as DatabaseSchema;
};

export const getDB = (): DatabaseSchema => {
  return initializeDB();
};

export const saveDB = (db: DatabaseSchema) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};
