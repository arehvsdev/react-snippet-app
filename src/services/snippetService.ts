import { apiClient } from "./apiClient";

export interface SnippetData {
  title: string;
  language: string;
  description: string;
  code: string;
  tags: string[];
  category?: string;
  visibility?: 'public' | 'private';
}

export interface UserSnippetStats {
  total: number;
  public: number;
  private: number;
  bookmarks: number;
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

  const endpoint = `/snippets${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  const resData = await apiClient.get(endpoint);

  const list = resData.snippets || resData.data || [];
  const normalized = list.map(normalizeSnippet);

  if (resData.pagination) {
    (normalized as any).pagination = resData.pagination;
  }

  return normalized;
};

/**
 * Fetches user snippet statistics (total, public, private, bookmarks) from GET /snippets/my/stats.
 */
export const getMySnippetStats = async (): Promise<UserSnippetStats> => {
  const response = await apiClient.get('/snippets/my/stats');
  return response.data || { total: 0, public: 0, private: 0, bookmarks: 0 };
};

/**
 * Fetches a single snippet by ID.
 */
export const getSnippetById = async (id: string): Promise<any> => {
  const resData = await apiClient.get(`/snippets/${id}`);
  const s = resData.snippet || resData.data;
  return normalizeSnippet(s);
};

/**
 * Saves a new snippet to the database.
 */
export const createSnippet = async (data: SnippetData): Promise<any> => {
  const resData = await apiClient.post('/snippets', {
    title: data.title,
    language: data.language,
    description: data.description,
    code: data.code,
    tags: data.tags,
    category: data.category || undefined,
    visibility: data.visibility
  });

  const s = resData.snippet || resData.data;
  return normalizeSnippet(s);
};

/**
 * Updates an existing snippet.
 */
export const updateSnippet = async (id: string, data: Partial<SnippetData>): Promise<any> => {
  const resData = await apiClient.put(`/snippets/${id}`, data);
  const s = resData.snippet || resData.data;
  return normalizeSnippet(s);
};

/**
 * Deletes a snippet.
 */
export const deleteSnippet = async (id: string): Promise<any> => {
  return apiClient.delete(`/snippets/${id}`);
};

/**
 * Toggles a snippet bookmark state in the backend database.
 */
export const toggleBookmarkInDB = async (snippetId: string): Promise<{ bookmarked: boolean; bookmarksCount: number }> => {
  const resData = await apiClient.post(`/snippets/${snippetId}/bookmarks`);
  const result = {
    bookmarked: resData.bookmarked,
    bookmarksCount: resData.bookmarksCount || 0
  };

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('bookmark-changed', { detail: { bookmarked: result.bookmarked, snippetId } }));
  }

  return result;
};

/**
 * Fetches user bookmarks from the backend database.
 */
export const getUserBookmarks = async (filters?: { page?: number; limit?: number }): Promise<any[]> => {
  const queryParams = new URLSearchParams();
  if (filters?.page) queryParams.append("page", String(filters.page));
  if (filters?.limit) queryParams.append("limit", String(filters.limit));

  const endpoint = `/snippets/my/bookmarks${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  const resData = await apiClient.get(endpoint);

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

  const endpoint = `/snippets/${snippetId}/comments${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  const resData = await apiClient.get(endpoint);

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
  const resData = await apiClient.post(`/snippets/${snippetId}/comments`, { content, parentId });
  const comment = resData.comment || resData.data;
  return normalizeComment(comment);
};

/**
 * Updates an existing comment.
 */
export const updateCommentInDB = async (commentId: string, content: string): Promise<any> => {
  const resData = await apiClient.put(`/snippets/comments/${commentId}`, { content });
  const comment = resData.comment || resData.data;
  return normalizeComment(comment);
};

/**
 * Deletes a comment.
 */
export const deleteCommentInDB = async (commentId: string): Promise<any> => {
  return apiClient.delete(`/snippets/comments/${commentId}`);
};

/**
 * Fetches all categories.
 */
export const getCategories = async (): Promise<any[]> => {
  const resData = await apiClient.get('/categories');
  return resData.categories || resData.data || [];
};

/**
 * Creates a new category. (Admin only)
 */
export const createCategory = async (data: { name: string; description?: string }): Promise<any> => {
  const resData = await apiClient.post('/categories', data);
  return resData.category || resData.data;
};

/**
 * Updates an existing category. (Admin only)
 */
export const updateCategory = async (id: string, data: { name?: string; description?: string }): Promise<any> => {
  const resData = await apiClient.put(`/categories/${id}`, data);
  return resData.category || resData.data;
};

/**
 * Deletes a category. (Admin only)
 */
export const deleteCategory = async (id: string): Promise<any> => {
  return apiClient.delete(`/categories/${id}`);
};

/**
 * Fetches all languages.
 */
export const getLanguages = async (filters?: { active?: boolean }): Promise<any[]> => {
  const queryParams = new URLSearchParams();
  if (filters?.active !== undefined) {
    queryParams.append("active", String(filters.active));
  }

  const endpoint = `/languages${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  const resData = await apiClient.get(endpoint);
  return resData.languages || resData.data || [];
};

/**
 * Creates a new language. (Admin only)
 */
export const createLanguage = async (data: { name: string; icon?: string; active?: boolean; isActive?: boolean }): Promise<any> => {
  const payload = {
    ...data,
    active: data.active !== undefined ? data.active : data.isActive
  };
  const resData = await apiClient.post('/languages', payload);
  return resData.language || resData.data;
};

/**
 * Updates an existing language. (Admin only)
 */
export const updateLanguage = async (id: string, data: { name?: string; icon?: string; active?: boolean; isActive?: boolean }): Promise<any> => {
  const payload = {
    ...data,
    active: data.active !== undefined ? data.active : data.isActive
  };
  const resData = await apiClient.put(`/languages/${id}`, payload);
  return resData.language || resData.data;
};

/**
 * Deletes a language. (Admin only)
 */
export const deleteLanguage = async (id: string): Promise<any> => {
  return apiClient.delete(`/languages/${id}`);
};

/**
 * Fetches tags with optional search filter.
 */
export const getTags = async (filters?: { active?: boolean; search?: string }): Promise<any[]> => {
  const queryParams = new URLSearchParams();
  if (filters?.active !== undefined) {
    queryParams.append("active", String(filters.active));
  }
  if (filters?.search) {
    queryParams.append("search", filters.search);
  }

  const endpoint = `/tags${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  const resData = await apiClient.get(endpoint);
  return resData.tags || resData.data || [];
};

/**
 * Creates a new tag. (Admin only)
 */
export const createTag = async (data: { name: string; color?: string; active?: boolean; isActive?: boolean }): Promise<any> => {
  const payload = {
    ...data,
    active: data.active !== undefined ? data.active : data.isActive
  };
  const resData = await apiClient.post('/tags', payload);
  return resData.tag || resData.data;
};

/**
 * Updates an existing tag. (Admin only)
 */
export const updateTag = async (id: string, data: { name?: string; color?: string; active?: boolean; isActive?: boolean }): Promise<any> => {
  const payload = {
    ...data,
    active: data.active !== undefined ? data.active : data.isActive
  };
  const resData = await apiClient.put(`/tags/${id}`, payload);
  return resData.tag || resData.data;
};

/**
 * Deletes a tag. (Admin only)
 */
export const deleteTag = async (id: string): Promise<any> => {
  return apiClient.delete(`/tags/${id}`);
};

/**
 * Toggles a snippet like.
 */
export const toggleSnippetLikeInDB = async (snippetId: string): Promise<{ liked: boolean; likes: number }> => {
  const resData = await apiClient.post(`/snippets/${snippetId}/like`);
  return {
    liked: resData.liked,
    likes: resData.likes || 0
  };
};

/**
 * Toggles a comment like.
 */
export const toggleCommentLikeInDB = async (commentId: string): Promise<{ liked: boolean; likes: number }> => {
  const resData = await apiClient.post(`/snippets/comments/${commentId}/like`);
  return {
    liked: resData.liked,
    likes: resData.likes || 0
  };
};
