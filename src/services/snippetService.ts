const API_BASE_URL = "http://localhost:5000/api";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
};

export interface SnippetData {
  title: string;
  language: string;
  description: string;
  code: string;
  tags: string[];
  category?: string;
}

const normalizeSnippet = (s: any) => {
  const authorName = s.createdBy?.name || "Unknown User";
  const authorAvatar = s.createdBy?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=3b82f6&color=fff`;
  const authorUsername = s.createdBy?.username || "unknown";

  return {
    ...s,
    id: String(s._id),
    author: {
      name: authorName,
      avatar: authorAvatar,
      username: authorUsername
    },
    comments: s.commentsCount || s.comments || 0,
    createdAt: s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'Just now'
  };
};

const normalizeComment = (c: any) => {
  const authorName = c.userId?.name || "Unknown User";
  const authorAvatar = c.userId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=3b82f6&color=fff`;

  return {
    id: String(c._id),
    author: {
      name: authorName,
      avatar: authorAvatar
    },
    content: c.content,
    createdAt: c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'Just now',
    likes: c.likes || 0
  };
};

/**
 * Fetches all snippets (optionally filtered by query params).
 */
export const getSnippets = async (filters?: { userId?: string; visibility?: string }): Promise<any[]> => {
  const queryParams = new URLSearchParams();
  if (filters?.userId) queryParams.append("userId", filters.userId);
  if (filters?.visibility) queryParams.append("visibility", filters.visibility);

  const url = `${API_BASE_URL}/snippets${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders()
  });

  const resData = await response.json();
  if (!response.ok) {
    throw new Error(resData.message || "Failed to fetch snippets.");
  }

  const list = resData.snippets || resData.data || [];
  return list.map(normalizeSnippet);
};

/**
 * Fetches a single snippet by ID.
 */
export const getSnippetById = async (id: string): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/snippets/${id}`, {
    method: "GET",
    headers: getHeaders()
  });

  const resData = await response.json();
  if (!response.ok) {
    throw new Error(resData.message || "Failed to fetch snippet details.");
  }

  const s = resData.snippet || resData.data;
  return normalizeSnippet(s);
};

/**
 * Saves a new snippet to the MongoDB database.
 */
export const createSnippet = async (data: SnippetData): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/snippets`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      title: data.title,
      language: data.language,
      description: data.description,
      code: data.code,
      tags: data.tags,
      category: data.category || undefined
    })
  });

  const resData = await response.json();
  if (!response.ok) {
    const errorMsg = resData.errors && resData.errors.length > 0
      ? resData.errors.map((e: any) => e.message).join(", ")
      : (resData.message || "Failed to create snippet.");
    throw new Error(errorMsg);
  }

  const s = resData.snippet || resData.data;
  return normalizeSnippet(s);
};

/**
 * Updates an existing snippet.
 */
export const updateSnippet = async (id: string, data: Partial<SnippetData>): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/snippets/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data)
  });

  const resData = await response.json();
  if (!response.ok) {
    const errorMsg = resData.errors && resData.errors.length > 0
      ? resData.errors.map((e: any) => e.message).join(", ")
      : (resData.message || "Failed to update snippet.");
    throw new Error(errorMsg);
  }

  const s = resData.snippet || resData.data;
  return normalizeSnippet(s);
};

/**
 * Deletes a snippet.
 */
export const deleteSnippet = async (id: string): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/snippets/${id}`, {
    method: "DELETE",
    headers: getHeaders()
  });

  const resData = await response.json();
  if (!response.ok) {
    throw new Error(resData.message || "Failed to delete snippet.");
  }

  return resData;
};

/**
 * Toggles a snippet bookmark state in the backend database.
 */
export const toggleBookmarkInDB = async (snippetId: string, _userId?: number, _snippetInfo?: any): Promise<boolean> => {
  const response = await fetch(`${API_BASE_URL}/snippets/${snippetId}/bookmarks`, {
    method: "POST",
    headers: getHeaders()
  });

  const resData = await response.json();
  if (!response.ok) {
    throw new Error(resData.message || "Failed to toggle bookmark.");
  }

  // Returns true if now bookmarked, false if unbookmarked
  return resData.bookmarked || (resData.data && resData.data.bookmarked);
};

/**
 * Fetches user bookmarks from the backend database.
 */
export const getUserBookmarks = async (): Promise<any[]> => {
  const response = await fetch(`${API_BASE_URL}/snippets/my/bookmarks`, {
    method: "GET",
    headers: getHeaders()
  });

  const resData = await response.json();
  if (!response.ok) {
    throw new Error(resData.message || "Failed to fetch user bookmarks.");
  }

  const list = resData.bookmarks || resData.data || [];
  return list.map(normalizeSnippet);
};

/**
 * Fetches comments for a snippet.
 */
export const getComments = async (snippetId: string): Promise<any[]> => {
  const response = await fetch(`${API_BASE_URL}/snippets/${snippetId}/comments`, {
    method: "GET",
    headers: getHeaders()
  });

  const resData = await response.json();
  if (!response.ok) {
    throw new Error(resData.message || "Failed to fetch comments.");
  }

  const list = resData.comments || resData.data || [];
  return list.map(normalizeComment);
};

/**
 * Appends a comment to a snippet.
 */
export const saveCommentToDB = async (snippetId: string, content: string): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/snippets/${snippetId}/comments`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ content })
  });

  const resData = await response.json();
  if (!response.ok) {
    const errorMsg = resData.errors && resData.errors.length > 0
      ? resData.errors.map((e: any) => e.message).join(", ")
      : (resData.message || "Failed to save comment.");
    throw new Error(errorMsg);
  }

  const comment = resData.comment || resData.data;
  return normalizeComment(comment);
};

/**
 * Fetches all categories.
 */
export const getCategories = async (): Promise<any[]> => {
  const response = await fetch(`${API_BASE_URL}/categories`, {
    method: "GET",
    headers: getHeaders()
  });

  const resData = await response.json();
  if (!response.ok) {
    throw new Error(resData.message || "Failed to fetch categories.");
  }

  return resData.categories || resData.data || [];
};
