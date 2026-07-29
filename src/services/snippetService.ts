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
    isBookmarked: s.isBookmarked || false,
    bookmarksCount: s.bookmarksCount || 0,
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
      avatar: authorAvatar,
      username: c.userId?.username || "unknown"
    },
    content: c.content,
    createdAt: c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'Just now',
    likes: c.likes || 0,
    isLiked: c.isLiked || false,
    parentId: c.parentId ? String(c.parentId) : undefined
  };
};

export const getSnippets = async (filters?: {
  userId?: string;
  visibility?: string;
  search?: string;
  language?: string;
  category?: string;
  tags?: string;
  author?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}): Promise<any[]> => {
  const queryParams = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        queryParams.append(key, String(val));
      }
    });
  }

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
  const normalized = list.map(normalizeSnippet);

  if (resData.pagination) {
    (normalized as any).pagination = resData.pagination;
  }

  return normalized;
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
export const toggleBookmarkInDB = async (snippetId: string): Promise<{ bookmarked: boolean; bookmarksCount: number }> => {
  const response = await fetch(`${API_BASE_URL}/snippets/${snippetId}/bookmarks`, {
    method: "POST",
    headers: getHeaders()
  });

  const resData = await response.json();
  if (!response.ok) {
    throw new Error(resData.message || "Failed to toggle bookmark.");
  }

  return {
    bookmarked: resData.bookmarked,
    bookmarksCount: resData.bookmarksCount || 0
  };
};

/**
 * Fetches user bookmarks from the backend database.
 */
export const getUserBookmarks = async (filters?: { page?: number; limit?: number }): Promise<any[]> => {
  const queryParams = new URLSearchParams();
  if (filters?.page) queryParams.append("page", String(filters.page));
  if (filters?.limit) queryParams.append("limit", String(filters.limit));

  const url = `${API_BASE_URL}/snippets/my/bookmarks${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders()
  });

  const resData = await response.json();
  if (!response.ok) {
    throw new Error(resData.message || "Failed to fetch user bookmarks.");
  }

  const list = resData.bookmarks || resData.data || [];
  const normalized = list.map(normalizeSnippet);
  if (resData.pagination) {
    (normalized as any).pagination = resData.pagination;
  }
  return normalized;
};

/**
 * Fetches comments for a snippet.
 */
export const getComments = async (snippetId: string, filters?: { page?: number; limit?: number }): Promise<any[]> => {
  const queryParams = new URLSearchParams();
  if (filters?.page) queryParams.append("page", String(filters.page));
  if (filters?.limit) queryParams.append("limit", String(filters.limit));

  const url = `${API_BASE_URL}/snippets/${snippetId}/comments${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders()
  });

  const resData = await response.json();
  if (!response.ok) {
    throw new Error(resData.message || "Failed to fetch comments.");
  }

  const list = resData.comments || resData.data || [];
  const normalized = list.map(normalizeComment);
  if (resData.pagination) {
    (normalized as any).pagination = resData.pagination;
  }
  return normalized;
};

/**
 * Appends a comment or reply to a snippet.
 */
export const saveCommentToDB = async (snippetId: string, content: string, parentId?: string): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/snippets/${snippetId}/comments`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ content, parentId })
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
 * Updates an existing comment.
 */
export const updateCommentInDB = async (commentId: string, content: string): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/snippets/comments/${commentId}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({ content })
  });

  const resData = await response.json();
  if (!response.ok) {
    const errorMsg = resData.errors && resData.errors.length > 0
      ? resData.errors.map((e: any) => e.message).join(", ")
      : (resData.message || "Failed to update comment.");
    throw new Error(errorMsg);
  }

  const comment = resData.comment || resData.data;
  return normalizeComment(comment);
};

/**
 * Deletes a comment.
 */
export const deleteCommentInDB = async (commentId: string): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/snippets/comments/${commentId}`, {
    method: "DELETE",
    headers: getHeaders()
  });

  const resData = await response.json();
  if (!response.ok) {
    throw new Error(resData.message || "Failed to delete comment.");
  }

  return resData;
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

/**
 * Creates a new category. (Admin only)
 */
export const createCategory = async (data: { name: string; description?: string }): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/categories`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data)
  });

  const resData = await response.json();
  if (!response.ok) {
    const errorMsg = resData.errors && resData.errors.length > 0
      ? resData.errors.map((e: any) => e.message).join(", ")
      : (resData.message || "Failed to create category.");
    throw new Error(errorMsg);
  }

  return resData.category || resData.data;
};

/**
 * Updates an existing category. (Admin only)
 */
export const updateCategory = async (id: string, data: { name?: string; description?: string }): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data)
  });

  const resData = await response.json();
  if (!response.ok) {
    const errorMsg = resData.errors && resData.errors.length > 0
      ? resData.errors.map((e: any) => e.message).join(", ")
      : (resData.message || "Failed to update category.");
    throw new Error(errorMsg);
  }

  return resData.category || resData.data;
};

/**
 * Deletes a category. (Admin only)
 */
export const deleteCategory = async (id: string): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
    method: "DELETE",
    headers: getHeaders()
  });

  const resData = await response.json();
  if (!response.ok) {
    throw new Error(resData.message || "Failed to delete category.");
  }

  return resData;
};

/**
 * Fetches all languages.
 */
export const getLanguages = async (filters?: { active?: boolean }): Promise<any[]> => {
  const queryParams = new URLSearchParams();
  if (filters?.active !== undefined) {
    queryParams.append("active", String(filters.active));
  }

  const url = `${API_BASE_URL}/languages${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders()
  });

  const resData = await response.json();
  if (!response.ok) {
    throw new Error(resData.message || "Failed to fetch languages.");
  }

  return resData.languages || resData.data || [];
};

/**
 * Creates a new language. (Admin only)
 */
export const createLanguage = async (data: { name: string; icon: string; isActive?: boolean }): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/languages`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data)
  });

  const resData = await response.json();
  if (!response.ok) {
    const errorMsg = resData.errors && resData.errors.length > 0
      ? resData.errors.map((e: any) => e.message).join(", ")
      : (resData.message || "Failed to create language.");
    throw new Error(errorMsg);
  }

  return resData.language || resData.data;
};

/**
 * Updates an existing language. (Admin only)
 */
export const updateLanguage = async (id: string, data: { name?: string; icon?: string; isActive?: boolean }): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/languages/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data)
  });

  const resData = await response.json();
  if (!response.ok) {
    const errorMsg = resData.errors && resData.errors.length > 0
      ? resData.errors.map((e: any) => e.message).join(", ")
      : (resData.message || "Failed to update language.");
    throw new Error(errorMsg);
  }

  return resData.language || resData.data;
};

/**
 * Deletes a language. (Admin only)
 */
export const deleteLanguage = async (id: string): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/languages/${id}`, {
    method: "DELETE",
    headers: getHeaders()
  });

  const resData = await response.json();
  if (!response.ok) {
    throw new Error(resData.message || "Failed to delete language.");
  }

  return resData;
};

/**
 * Fetches all tags.
 */
export const getTags = async (filters?: { active?: boolean; search?: string }): Promise<any[]> => {
  const queryParams = new URLSearchParams();
  if (filters?.active !== undefined) {
    queryParams.append("active", String(filters.active));
  }
  if (filters?.search) {
    queryParams.append("search", filters.search);
  }

  const url = `${API_BASE_URL}/tags${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders()
  });

  const resData = await response.json();
  if (!response.ok) {
    throw new Error(resData.message || "Failed to fetch tags.");
  }

  return resData.tags || resData.data || [];
};

/**
 * Creates a new tag. (Admin only)
 */
export const createTag = async (data: { name: string; color?: string; isActive?: boolean }): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/tags`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data)
  });

  const resData = await response.json();
  if (!response.ok) {
    const errorMsg = resData.errors && resData.errors.length > 0
      ? resData.errors.map((e: any) => e.message).join(", ")
      : (resData.message || "Failed to create tag.");
    throw new Error(errorMsg);
  }

  return resData.tag || resData.data;
};

/**
 * Updates an existing tag. (Admin only)
 */
export const updateTag = async (id: string, data: { name?: string; color?: string; isActive?: boolean }): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/tags/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data)
  });

  const resData = await response.json();
  if (!response.ok) {
    const errorMsg = resData.errors && resData.errors.length > 0
      ? resData.errors.map((e: any) => e.message).join(", ")
      : (resData.message || "Failed to update tag.");
    throw new Error(errorMsg);
  }

  return resData.tag || resData.data;
};

/**
 * Deletes a tag. (Admin only)
 */
export const deleteTag = async (id: string): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/tags/${id}`, {
    method: "DELETE",
    headers: getHeaders()
  });

  const resData = await response.json();
  if (!response.ok) {
    throw new Error(resData.message || "Failed to delete tag.");
  }

  return resData;
};

/**
 * Toggles a snippet like state.
 */
export const toggleSnippetLikeInDB = async (snippetId: string): Promise<{ liked: boolean; likes: number }> => {
  const response = await fetch(`${API_BASE_URL}/snippets/${snippetId}/like`, {
    method: "POST",
    headers: getHeaders()
  });

  const resData = await response.json();
  if (!response.ok) {
    throw new Error(resData.message || "Failed to toggle like on snippet.");
  }

  return {
    liked: resData.liked,
    likes: resData.likes
  };
};

/**
 * Toggles a comment like state.
 */
export const toggleCommentLikeInDB = async (commentId: string): Promise<{ liked: boolean; likes: number }> => {
  const response = await fetch(`${API_BASE_URL}/snippets/comments/${commentId}/like`, {
    method: "POST",
    headers: getHeaders()
  });

  const resData = await response.json();
  if (!response.ok) {
    throw new Error(resData.message || "Failed to toggle like on comment.");
  }

  return {
    liked: resData.liked,
    likes: resData.likes
  };
};



