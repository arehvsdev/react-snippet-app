import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  MessageCircle,
  Sparkles,
  CheckCheck,
  Trash2,
  Inbox,
  ArrowLeft,
  Check
} from 'lucide-react';
import { Layout } from './Layout';
import { useAuth } from '../layouts/AuthContext';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotificationInDB,
  type AppNotification
} from '../services/notificationService';
import toast from 'react-hot-toast';

export function Notifications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err: any) {
      console.error("Failed to load notifications:", err);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const handleNotificationClick = async (notif: AppNotification) => {
    try {
      if (!notif.isRead) {
        await markNotificationAsRead(notif.id || notif._id!);
        setNotifications(prev =>
          prev.map(n => ((n.id === notif.id || n._id === notif._id) ? { ...n, isRead: true } : n))
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      if (notif.link) {
        navigate(notif.link);
      }
    } catch (err: any) {
      console.error("Failed to mark read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read!");
    } catch (err: any) {
      toast.error(err.message || "Failed to mark all as read");
    }
  };

  const handleDelete = async (e: React.MouseEvent, notifId: string) => {
    e.stopPropagation();
    try {
      await deleteNotificationInDB(notifId);
      const targetNotif = notifications.find(n => n.id === notifId || n._id === notifId);
      if (targetNotif && !targetNotif.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      setNotifications(prev => prev.filter(n => n.id !== notifId && n._id !== notifId));
      toast.success("Notification deleted");
    } catch (err: any) {
      toast.error("Failed to delete notification");
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'welcome':
        return <Sparkles className="w-5 h-5 text-amber-400" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-blue-400" />;
      default:
        return <Bell className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <Layout>
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/snippet-feed')}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Notifications</h1>
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-extrabold text-xs">
                    {unreadCount} Unread
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Unread alerts are displayed at the top in bold.
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-blue-400 border border-gray-700 hover:border-gray-600 transition-all cursor-pointer shadow-sm shrink-0 min-h-[40px]"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark all as read</span>
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-800/60 animate-pulse rounded-2xl border border-gray-700/50" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-gray-800/60 rounded-2xl border border-gray-700/80 p-10 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-gray-700/50 text-gray-400 flex items-center justify-center mx-auto">
              <Inbox className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white">No Notifications Yet</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              When other developers comment on your code snippets or when system updates arrive, they will show up here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => {
              const id = notif.id || notif._id!;
              const isUnread = !notif.isRead;

              return (
                <div
                  key={id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all duration-150 cursor-pointer flex items-start justify-between gap-4 ${
                    isUnread
                      ? 'bg-blue-950/30 border-blue-500/40 ring-1 ring-blue-500/20 shadow-md'
                      : 'bg-gray-800/60 border-gray-700/80 hover:bg-gray-800/90'
                  }`}
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                      isUnread ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'bg-gray-900 text-gray-400 border border-gray-700'
                    }`}>
                      {getNotificationIcon(notif.type)}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm tracking-tight truncate ${
                          isUnread ? 'font-extrabold text-white' : 'font-medium text-gray-300'
                        }`}>
                          {notif.title}
                        </h4>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" aria-label="Unread notification indicator" />
                        )}
                      </div>

                      <p className={`text-xs leading-relaxed ${
                        isUnread ? 'font-semibold text-gray-200' : 'font-normal text-gray-400'
                      }`}>
                        {notif.message}
                      </p>

                      <div className="flex items-center gap-3 pt-1 text-[11px] text-gray-500 font-mono">
                        <span>{new Date(notif.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isUnread && (
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.stopPropagation();
                          await markNotificationAsRead(id);
                          setNotifications(prev => prev.map(n => ((n.id === id || n._id === id) ? { ...n, isRead: true } : n)));
                          setUnreadCount(prev => Math.max(0, prev - 1));
                        }}
                        className="p-2 rounded-lg text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                        title="Mark as read"
                        aria-label="Mark notification as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, id)}
                      className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete notification"
                      aria-label="Delete notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Notifications;
