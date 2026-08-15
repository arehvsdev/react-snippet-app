import { apiClient } from './apiClient';

export interface SubscriptionStats {
  totalProUsers: number;
  totalFreeUsers: number;
  activeProUsers: number;
  totalRevenue: number;
  totalTransactions: number;
}

export interface UserSubscriptionItem {
  _id: string;
  id?: string;
  name: string;
  username: string;
  email: string;
  role: string;
  avatar?: string;
  subscription?: {
    plan: 'FREE' | 'PRO';
    status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'CANCELLED';
    paymentId?: string;
    paymentDate?: string;
  };
  createdAt: string;
}

export interface PaymentTransactionItem {
  _id: string;
  id?: string;
  user?: {
    _id: string;
    name: string;
    email: string;
    username: string;
    avatar?: string;
    role?: string;
  };
  plan: 'FREE' | 'PRO';
  amount: number;
  currency: string;
  gateway: string;
  orderId: string;
  paymentId?: string;
  status: 'CREATED' | 'SUCCESS' | 'FAILED' | 'PENDING' | 'PAID' | 'COMPLETED' | string;

  createdAt: string;
}

export interface SubscriptionQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  plan?: string;
  status?: string;
}

export interface PaymentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

/**
 * Fetches overview statistics for admin subscriptions dashboard
 */
export const getAdminSubscriptionStats = async (): Promise<SubscriptionStats> => {
  const res = await apiClient.get('/admin/subscriptions/stats');
  return res.data || res;
};

/**
 * Fetches user subscriptions list with optional filtering and search
 */
export const getAdminSubscriptions = async (params: SubscriptionQueryParams = {}): Promise<any> => {
  const query = new URLSearchParams();
  if (params.page) query.append('page', String(params.page));
  if (params.limit) query.append('limit', String(params.limit));
  if (params.search) query.append('search', params.search);
  if (params.plan && params.plan !== 'ALL') query.append('plan', params.plan);
  if (params.status && params.status !== 'ALL') query.append('status', params.status);

  return apiClient.get(`/admin/subscriptions?${query.toString()}`);
};

/**
 * Fetches all payment transactions table data for admin
 */
export const getAdminPayments = async (params: PaymentQueryParams = {}): Promise<any> => {
  const query = new URLSearchParams();
  if (params.page) query.append('page', String(params.page));
  if (params.limit) query.append('limit', String(params.limit));
  if (params.search) query.append('search', params.search);
  if (params.status && params.status !== 'ALL') query.append('status', params.status);

  return apiClient.get(`/admin/payments?${query.toString()}`);
};

/**
 * Updates a user's subscription plan and status (Admin Action)
 */
export const updateUserSubscription = async (
  userId: string,
  data: { plan?: 'FREE' | 'PRO'; status?: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'CANCELLED' }
): Promise<any> => {
  return apiClient.put(`/admin/users/${userId}/subscription`, data);
};
