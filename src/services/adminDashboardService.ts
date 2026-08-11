import { apiClient } from './apiClient';

/**
 * Fetches dashboard summary KPIs
 */
export const getDashboardSummary = async (): Promise<any> => {
  const tzOffset = new Date().getTimezoneOffset();
  return apiClient.get(`/admin/dashboard/summary?tzOffset=${tzOffset}`);
};

export const getDashboardUserGrowth = async (months: number = 6): Promise<any> => {
  return apiClient.get(`/admin/dashboard/user-growth?months=${months}`);
};

/**
 * Fetches dashboard language statistics
 */
export const getDashboardSnippetLanguages = async (): Promise<any> => {
  return apiClient.get('/admin/dashboard/snippet-languages');
};

/**
 * Fetches dashboard weekly activity data
 */
export const getDashboardWeeklyActivity = async (): Promise<any> => {
  const tzOffset = new Date().getTimezoneOffset();
  return apiClient.get(`/admin/dashboard/weekly-activity?tzOffset=${tzOffset}`);
};

/**
 * Fetches dashboard recent activity details
 */
export const getDashboardRecentActivity = async (): Promise<any> => {
  return apiClient.get('/admin/dashboard/recent-activity');
};

/**
 * Fetches system activity logs for admin inspection
 */
export const getActivityLogs = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  actionType?: string;
}): Promise<any> => {
  const query = new URLSearchParams();
  if (params.page) query.append("page", String(params.page));
  if (params.limit) query.append("limit", String(params.limit));
  if (params.search) query.append("search", params.search);
  if (params.actionType && params.actionType !== "all") query.append("actionType", params.actionType);

  return apiClient.get(`/admin/logs?${query.toString()}`);
};
