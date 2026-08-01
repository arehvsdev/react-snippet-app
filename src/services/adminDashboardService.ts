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
