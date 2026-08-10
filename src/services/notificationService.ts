import { apiClient } from './apiClient';

export interface AppNotification {
  id: string;
  _id?: string;
  type: 'welcome' | 'comment' | 'like' | 'system';
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
  sender?: {
    name: string;
    username: string;
    avatar: string;
  };
  snippetId?: any;
}

export const getNotifications = async (): Promise<{ notifications: AppNotification[]; unreadCount: number }> => {
  const res = await apiClient.get('/notifications');
  return {
    notifications: res.notifications || [],
    unreadCount: res.unreadCount || 0
  };
};

export const getUnreadNotificationCount = async (): Promise<number> => {
  const res = await apiClient.get('/notifications/unread-count');
  return res.unreadCount || 0;
};

export const markNotificationAsRead = async (id: string): Promise<void> => {
  await apiClient.patch(`/notifications/${id}/read`);
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  await apiClient.patch('/notifications/read-all');
};

export const deleteNotificationInDB = async (id: string): Promise<void> => {
  await apiClient.delete(`/notifications/${id}`);
};
