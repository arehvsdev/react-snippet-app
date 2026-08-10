import { apiClient } from './apiClient';

export interface ActivityLogUser {
  _id: string;
  name?: string;
  username?: string;
  email?: string;
  avatar?: string;
  role?: string;
}

export interface ActivityLogItem {
  _id: string;
  user?: ActivityLogUser | null;
  actionType: 'payment' | 'snippet_create' | 'snippet_edit' | 'snippet_delete' | 'user_register' | 'snippet_comment';
  description: string;
  details?: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
}

export interface GetActivityLogsParams {
  page?: number;
  limit?: number;
  actionType?: string;
  search?: string;
}

export interface GetActivityLogsResponse {
  success: boolean;
  data: ActivityLogItem[];
  logs: ActivityLogItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const getActivityLogs = async (params: GetActivityLogsParams = {}): Promise<GetActivityLogsResponse> => {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append('page', String(params.page));
  if (params.limit) queryParams.append('limit', String(params.limit));
  if (params.actionType && params.actionType !== 'all') queryParams.append('actionType', params.actionType);
  if (params.search) queryParams.append('search', params.search);

  const queryStr = queryParams.toString();
  const url = `/admin/logs${queryStr ? `?${queryStr}` : ''}`;

  return apiClient.get(url);
};
