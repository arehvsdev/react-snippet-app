import { apiClient } from './apiClient';

export interface AuditLogItem {
  _id: string;
  user?: {
    _id?: string;
    name?: string;
    username?: string;
    email?: string;
    avatar?: string;
    role?: string;
  };
  userName: string;
  userEmail: string;
  type: 'Authentication' | 'Snippet' | 'Comment' | 'Admin' | 'Payment';
  action: string;
  resourceType: string;
  resourceId: string;
  resourceName: string;
  status: 'Success' | 'Failed';
  ipAddress: string;
  userAgent: string;
  details?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogsQueryParams {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  search?: string;
}

/**
 * Fetches paginated system audit logs with filters.
 */
export const getAuditLogs = async (params: AuditLogsQueryParams): Promise<any> => {
  const query = new URLSearchParams();
  if (params.page) query.append('page', String(params.page));
  if (params.limit) query.append('limit', String(params.limit));
  if (params.type && params.type !== 'all') query.append('type', params.type);
  if (params.status && params.status !== 'all') query.append('status', params.status);
  if (params.search) query.append('search', params.search);

  return apiClient.get(`/admin/audit-logs?${query.toString()}`);
};

/**
 * Fetches single audit log entry details.
 */
export const getAuditLogById = async (id: string): Promise<any> => {
  return apiClient.get(`/admin/audit-logs/${id}`);
};
