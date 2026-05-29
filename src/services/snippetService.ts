import { getDB, saveDB } from './dbService';

export interface SnippetData {
  title: string;
  language: string;
  description: string;
  code: string;
  tags: string[];
  userId: number;
}

/**
 * Saves a new snippet to the mock database.
 */
export const createSnippet = async (data: SnippetData): Promise<any> => {
  // Simulate API lag
  await new Promise((resolve) => setTimeout(resolve, 300));

  const db = getDB();
  const newSnippetId = db.snippets.length > 0 ? Math.max(...db.snippets.map((s) => s.id)) + 1 : 1;

  const newSnippet = {
    id: newSnippetId,
    title: data.title,
    language: data.language,
    description: data.description,
    code: data.code,
    tags: data.tags,
    userId: data.userId,
    createdAt: "Just now",
    likes: 0,
    comments: 0,
    views: 0,
    isBookmarked: false,
    visibility: "public" as const,
  };

  db.snippets.unshift(newSnippet);
  saveDB(db);

  return newSnippet;
};

/**
 * Toggles a snippet bookmark state in the database.
 */
export const toggleBookmarkInDB = async (snippetId: string, userId: number, snippetInfo: any): Promise<boolean> => {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const db = getDB();
  
  // Ensure bookmarks array exists
  if (!db.bookmarks) db.bookmarks = [];

  const isAlreadyBookmarked = db.bookmarks.some(
    (b) => String(b.id) === String(snippetId) && Number(b.userId) === Number(userId)
  );

  const newBookmarkState = !isAlreadyBookmarked;

  if (newBookmarkState) {
    db.bookmarks.push({
      id: Number(snippetId),
      title: snippetInfo.title,
      language: snippetInfo.language,
      description: snippetInfo.description,
      tags: snippetInfo.tags,
      code: snippetInfo.code,
      userId: userId,
      bookmarkedAt: 'Just now'
    });
    
    const dbSnippet = db.snippets.find((s) => String(s.id) === String(snippetId));
    if (dbSnippet) dbSnippet.isBookmarked = true;
  } else {
    db.bookmarks = db.bookmarks.filter(
      (b) => !(String(b.id) === String(snippetId) && Number(b.userId) === Number(userId))
    );
    
    const dbSnippet = db.snippets.find((s) => String(s.id) === String(snippetId));
    if (dbSnippet) dbSnippet.isBookmarked = false;
  }

  saveDB(db);
  return newBookmarkState;
};

/**
 * Appends a comment to a snippet (local state side is updated by callers).
 */
export const saveCommentToDB = async (snippetId: string, comment: any): Promise<any> => {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const db = getDB();
  const dbSnippet = db.snippets.find((s) => String(s.id) === String(snippetId));
  
  if (dbSnippet) {
    if (!dbSnippet.commentsCount) {
      dbSnippet.commentsCount = (dbSnippet.comments || 0) + 1;
    } else {
      dbSnippet.commentsCount += 1;
    }
    // Sync comments metadata back to the master list
    dbSnippet.comments = dbSnippet.commentsCount;
    saveDB(db);
  }
  
  return comment;
};
