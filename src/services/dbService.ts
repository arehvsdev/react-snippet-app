import dbData from '../utils/db.json';

const DB_KEY = 'snippet_app_db_v2';

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
}

export interface DatabaseSchema {
  users: User[];
  snippets: any[];
  categories: any[];
  bookmarks: any[];
  tags: any[];
}

// Initialize database in localStorage if it doesn't exist
const initializeDB = (): DatabaseSchema => {
  const stored = localStorage.getItem(DB_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
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
