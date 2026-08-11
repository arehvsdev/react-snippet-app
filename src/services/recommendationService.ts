import { apiClient } from "./apiClient";

export interface RecommendedSnippet {
  id: string;
  title: string;
  description: string;
  language: string;
  code: string;
  tags: string[];
  visibility: "public" | "private";
  author: {
    name: string;
    avatar: string;
    username: string;
  };
  createdAt: string;
  likes: number;
  comments: number;
  views: number;
  isBookmarked: boolean;
  recommendationScore?: number;
  similarityScore?: number;
  category?: any;
  ai?: {
    recommendationScore?: number;
    sentimentScore?: number;
    helpfulnessScore?: number;
    toxicityScore?: number;
    positiveComments?: number;
    negativeComments?: number;
    lastAnalyzed?: string | null;
  };
}

const normalizeSnippet = (s: any): RecommendedSnippet => {
  const authorName = s.createdBy?.name || "Unknown User";
  const authorAvatar =
    s.createdBy?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=3b82f6&color=fff`;

  return {
    ...s,
    id: String(s._id || s.id),
    author: {
      name: authorName,
      avatar: authorAvatar,
      username: s.createdBy?.username || "unknown",
    },
    comments: s.commentsCount || s.comments || 0,
    isBookmarked: s.isBookmarked || false,
    isLiked: s.isLiked || false,
    createdAt: s.createdAt
      ? new Date(s.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" })
      : "Just now",
  };
};

/**
 * Fetches personalized AI snippet recommendations for the logged-in user.
 */
export const getRecommendedSnippets = async (filters?: {
  page?: number;
  limit?: number;
}): Promise<{ snippets: RecommendedSnippet[]; pagination?: any }> => {
  const queryParams = new URLSearchParams();
  if (filters?.page) queryParams.append("page", String(filters.page));
  if (filters?.limit) queryParams.append("limit", String(filters.limit));

  const endpoint = `/recommendations/user${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
  const resData = await apiClient.get(endpoint);

  const list = resData.snippets || resData.data || [];
  const normalized = list.map(normalizeSnippet);

  return {
    snippets: normalized,
    pagination: resData.pagination,
  };
};

/**
 * Fetches similar public snippets for a target snippet ID.
 */
export const getSimilarSnippets = async (
  snippetId: string,
  limit: number = 5
): Promise<RecommendedSnippet[]> => {
  const endpoint = `/recommendations/similar/${snippetId}?limit=${limit}`;
  const resData = await apiClient.get(endpoint);

  const list = resData.snippets || resData.data || [];
  return list.map(normalizeSnippet);
};
