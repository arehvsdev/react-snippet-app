import { useState, useEffect, useRef, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, Code2, Home, Plus, BookMarked, Sparkles, CreditCard, LogOut, Settings, Key, User, HelpCircle, Menu, X, ChevronRight, Folder } from 'lucide-react';
import { useAuth } from '../layouts/AuthContext';
import { PlanBadge } from '../components/subscription/PlanBadge';
import { FaqComponent } from '../components/FAQ/FaqComponent';
import { getUnreadNotificationCount, getNotifications, type AppNotification } from '../services/notificationService';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState<AppNotification[]>([]);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      getUnreadNotificationCount()
        .then(count => setUnreadCount(count))
        .catch(err => console.error("Failed to load unread notifications count:", err));
    }
  }, [user, location.pathname]);

  useEffect(() => {
    if (user && showNotifications) {
      getNotifications()
        .then(res => {
          setRecentNotifications(res.notifications.slice(0, 4));
          setUnreadCount(res.unreadCount);
        })
        .catch(err => console.error("Failed to load notifications for dropdown:", err));
    }
  }, [user, showNotifications]);

  // Close profile dropdown, notification dropdown & mobile drawer on outside click / escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowProfileMenu(false);
        setShowNotifications(false);
        setIsMobileDrawerOpen(false);
      }
    };

    if (showProfileMenu || showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showProfileMenu, showNotifications]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileDrawerOpen]);

  /** Navigate and close menus */
  const handleMobileNavigate = (path: string) => {
    setIsMobileDrawerOpen(false);
    setShowProfileMenu(false);
    navigate(path);
  };

  const profileNavigate = (path: string) => {
    setShowProfileMenu(false);
    navigate(path);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 overflow-x-hidden flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="bg-gray-800/95 backdrop-blur-md border-b border-gray-700/80 sticky top-0 z-40 shadow-md">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-3">
            {/* Left: Mobile Hamburger Trigger & Logo */}
            <div className="flex items-center gap-3">
              {/* Mobile Hamburger Toggle (<1024px) */}
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(true)}
                className="lg:hidden p-2 rounded-lg text-gray-300 hover:bg-gray-700/80 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
                aria-label="Open mobile navigation menu"
                aria-expanded={isMobileDrawerOpen}
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Logo */}
              <div
                onClick={() => navigate(user ? '/snippet-feed' : '/')}
                className="flex items-center gap-2.5 cursor-pointer group py-1"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate(user ? '/snippet-feed' : '/')}
              >
                <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-2 rounded-xl shadow-md group-hover:scale-105 transition-transform flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg sm:text-xl font-bold text-white tracking-tight">SnipForge</span>
              </div>
            </div>

            {/* Desktop Navigation Links (>=1024px) */}
            <div className="hidden lg:flex items-center gap-1.5">
              <button
                onClick={() => navigate('/snippet-feed')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors cursor-pointer min-h-[44px] ${
                  isActive('/snippet-feed') || isActive('/')
                    ? 'bg-blue-600/20 text-blue-400 font-semibold border border-blue-500/30'
                    : 'text-gray-300 hover:bg-gray-700/80 hover:text-white'
                }`}
              >
                <Home className="w-4 h-4" />
                <span className="text-sm font-medium">Home</span>
              </button>
              <button
                onClick={() => navigate('/create')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors cursor-pointer min-h-[44px] ${
                  isActive('/create')
                    ? 'bg-blue-600/20 text-blue-400 font-semibold border border-blue-500/30'
                    : 'text-gray-300 hover:bg-gray-700/80 hover:text-white'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">Create</span>
              </button>
              <button
                onClick={() => navigate('/profile')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors cursor-pointer min-h-[44px] ${
                  isActive('/profile')
                    ? 'bg-blue-600/20 text-blue-400 font-semibold border border-blue-500/30'
                    : 'text-gray-300 hover:bg-gray-700/80 hover:text-white'
                }`}
              >
                <BookMarked className="w-4 h-4" />
                <span className="text-sm font-medium">My Snippets</span>
              </button>
              <button
                onClick={() => navigate('/pricing')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors cursor-pointer min-h-[44px] ${
                  isActive('/pricing')
                    ? 'bg-blue-600/20 text-blue-400 font-semibold border border-blue-500/30'
                    : 'text-gray-300 hover:bg-gray-700/80 hover:text-white'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span className="text-sm font-medium">Pricing</span>
              </button>
              <button
                onClick={() => navigate('/subscription')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors cursor-pointer min-h-[44px] ${
                  isActive('/subscription')
                    ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                    : 'text-gray-300 hover:bg-gray-700/80 hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium">Subscription</span>
              </button>
            </div>

            {/* Right Side Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Notification Bell & Dropdown Menu */}
              <div className="relative" ref={notificationMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2.5 rounded-lg text-gray-300 hover:bg-gray-700/80 hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  aria-label="Toggle Notifications Menu"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 px-1.5 py-0.2 rounded-full bg-blue-600 text-white font-extrabold text-[10px] ring-2 ring-gray-800 animate-pulse">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700/80 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-700">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-blue-400" />
                        <span className="font-bold text-sm text-white">Notifications</span>
                      </div>
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-full">
                          {unreadCount} Unread
                        </span>
                      )}
                    </div>

                    <div className="divide-y divide-gray-700/60 max-h-72 overflow-y-auto">
                      {recentNotifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-gray-400">
                          No notifications found.
                        </div>
                      ) : (
                        recentNotifications.map(notif => (
                          <div
                            key={notif.id || notif._id}
                            onClick={() => {
                              setShowNotifications(false);
                              navigate('/notifications');
                            }}
                            className={`p-3.5 hover:bg-gray-700/50 transition-colors cursor-pointer ${
                              !notif.isRead ? 'bg-blue-950/20' : ''
                            }`}
                          >
                            <p className={`text-xs mb-0.5 ${!notif.isRead ? 'font-extrabold text-white' : 'font-semibold text-gray-300'}`}>
                              {notif.title}
                            </p>
                            <p className={`text-xs leading-relaxed truncate ${!notif.isRead ? 'font-semibold text-gray-200' : 'text-gray-400'}`}>
                              {notif.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="p-2.5 bg-gray-900 border-t border-gray-700 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setShowNotifications(false);
                          navigate('/notifications');
                        }}
                        className="text-xs text-blue-400 hover:text-blue-300 font-bold transition-colors cursor-pointer w-full py-1"
                      >
                        View All Notifications →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Avatar & Dropdown */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="p-1 rounded-full hover:ring-2 hover:ring-blue-500/50 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  aria-label="Open user profile menu"
                  aria-expanded={showProfileMenu}
                >
                  <img
                    src={
                      (() => {
                        const av = (user as any)?.avatar;
                        const str = typeof av === 'string' ? av : (av && typeof av === 'object' ? (av.avatar || av.url || '') : '');
                        if (str && typeof str === 'string' && str.trim()) {
                          return str.startsWith('http') ? str : `${import.meta.env.VITE_API_BASE_URL || ''}${str}`;
                        }
                        return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=3b82f6&color=fff`;
                      })()
                    }
                    alt={user?.fullName || 'User'}
                    className="w-9 h-9 rounded-full object-cover border-2 border-gray-600 hover:border-blue-500 transition-colors"
                  />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700/80 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-3.5 bg-gray-900 border-b border-gray-700">
                      <p className="text-sm font-bold text-white truncate">{user?.fullName || 'User'}</p>
                      <p className="text-xs text-gray-400 truncate mb-1.5">{user?.email}</p>
                      {user?.role?.toLowerCase() === 'admin' ? (
                        <span className="inline-flex items-center rounded-full bg-blue-900/40 text-blue-400 border border-blue-500/30 px-2 py-0.5 text-[10px] font-semibold">ADMIN</span>
                      ) : (
                        <PlanBadge plan={user?.plan || 'FREE'} size="sm" />
                      )}
                    </div>

                    <div className="py-1.5">
                      <button onClick={() => profileNavigate('/profile')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700/60 hover:text-white transition-colors cursor-pointer min-h-[44px]">
                        <User className="w-4 h-4 text-gray-400" /> Profile
                      </button>
                      <button onClick={() => profileNavigate('/subscription')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700/60 hover:text-white transition-colors cursor-pointer min-h-[44px]">
                        <Sparkles className="w-4 h-4 text-amber-400" /> Subscription
                      </button>
                      <button onClick={() => profileNavigate('/pricing')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700/60 hover:text-white transition-colors cursor-pointer min-h-[44px]">
                        <CreditCard className="w-4 h-4 text-gray-400" /> Pricing
                      </button>
                      <button onClick={() => { setShowProfileMenu(false); setIsFaqOpen(true); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700/60 hover:text-white transition-colors cursor-pointer min-h-[44px]">
                        <HelpCircle className="w-4 h-4 text-blue-400" /> FAQs
                      </button>
                    </div>

                    <div className="border-t border-gray-700/60 py-1.5">
                      <button onClick={() => profileNavigate('/profile?action=edit')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700/60 hover:text-white transition-colors cursor-pointer min-h-[44px]">
                        <Settings className="w-4 h-4 text-gray-400" /> Settings
                      </button>
                      <button onClick={() => profileNavigate('/profile?action=password')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700/60 hover:text-white transition-colors cursor-pointer min-h-[44px]">
                        <Key className="w-4 h-4 text-gray-400" /> Change Password
                      </button>
                    </div>

                    <div className="border-t border-gray-700/60 py-1.5">
                      <button
                        onClick={() => { setShowProfileMenu(false); logout(); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer min-h-[44px]"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Slide-in Drawer Overlay (<1024px) */}
      {isMobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label="Mobile Navigation Menu">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setIsMobileDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Content Panel */}
          <div className="relative w-80 max-w-[85vw] bg-gray-800 border-r border-gray-700 h-full flex flex-col z-50 shadow-2xl animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-900">
              <div className="flex items-center gap-2.5">
                <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-1.5 rounded-lg shadow-md">
                  <Code2 className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-white text-lg tracking-tight">SnipForge</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Info Header in Mobile Drawer */}
            {user && (
              <div className="p-4 bg-gray-900/60 border-b border-gray-700 flex items-center gap-3">
                <img
                  src={
                    (() => {
                      const av = (user as any)?.avatar;
                      const str = typeof av === 'string' ? av : (av && typeof av === 'object' ? (av.avatar || av.url || '') : '');
                      if (str && typeof str === 'string' && str.trim()) {
                        return str.startsWith('http') ? str : `${import.meta.env.VITE_API_BASE_URL || ''}${str}`;
                      }
                      return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=3b82f6&color=fff`;
                    })()
                  }
                  alt={user.fullName || 'User'}
                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-600"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{user.fullName || 'User'}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider px-3 mb-2">Navigation</p>
              
              <button
                onClick={() => handleMobileNavigate('/snippet-feed')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all cursor-pointer min-h-[44px] ${
                  isActive('/snippet-feed') || isActive('/')
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20'
                    : 'text-gray-300 hover:bg-gray-700/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Home className="w-5 h-5" />
                  <span className="text-sm font-medium">Home Feed</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              <button
                onClick={() => handleMobileNavigate('/create')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all cursor-pointer min-h-[44px] ${
                  isActive('/create')
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20'
                    : 'text-gray-300 hover:bg-gray-700/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Plus className="w-5 h-5" />
                  <span className="text-sm font-medium">Create Snippet</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              <button
                onClick={() => handleMobileNavigate('/profile')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all cursor-pointer min-h-[44px] ${
                  isActive('/profile')
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20'
                    : 'text-gray-300 hover:bg-gray-700/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <BookMarked className="w-5 h-5" />
                  <span className="text-sm font-medium">My Snippets</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              <button
                onClick={() => handleMobileNavigate('/bookmarks')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all cursor-pointer min-h-[44px] ${
                  isActive('/bookmarks')
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20'
                    : 'text-gray-300 hover:bg-gray-700/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <BookMarked className="w-5 h-5 text-blue-400" />
                  <span className="text-sm font-medium">Bookmarks</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              <button
                onClick={() => handleMobileNavigate('/pricing')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all cursor-pointer min-h-[44px] ${
                  isActive('/pricing')
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20'
                    : 'text-gray-300 hover:bg-gray-700/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5" />
                  <span className="text-sm font-medium">Pricing Plans</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              <button
                onClick={() => handleMobileNavigate('/subscription')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all cursor-pointer min-h-[44px] ${
                  isActive('/subscription')
                    ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                    : 'text-gray-300 hover:bg-gray-700/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span className="text-sm font-medium">Subscription</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              <button
                onClick={() => handleMobileNavigate('/snippet-feed')}
                className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all cursor-pointer min-h-[44px] text-gray-300 hover:bg-gray-700/80 hover:text-white"
              >
                <div className="flex items-center gap-3">
                  <Folder className="w-5 h-5 text-indigo-400" />
                  <span className="text-sm font-medium">Categories</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              {user?.role?.toLowerCase() === 'admin' && (
                <button
                  onClick={() => handleMobileNavigate('/admin/dashboard')}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all cursor-pointer min-h-[44px] ${
                    isActive('/admin/dashboard')
                      ? 'bg-purple-600 text-white font-bold shadow-md'
                      : 'text-gray-300 hover:bg-gray-700/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-purple-400" />
                    <span className="text-sm font-medium">Admin Panel</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>
              )}

              <div className="pt-4 border-t border-gray-700/60 mt-4 space-y-1">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider px-3 mb-2">Account</p>

                <button
                  onClick={() => { setIsMobileDrawerOpen(false); setIsFaqOpen(true); }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-gray-300 hover:bg-gray-700/80 hover:text-white transition-colors cursor-pointer min-h-[44px]"
                >
                  <HelpCircle className="w-4 h-4 text-blue-400" />
                  <span>FAQs & Help</span>
                </button>

                <button
                  onClick={() => handleMobileNavigate('/profile?action=edit')}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-gray-300 hover:bg-gray-700/80 hover:text-white transition-colors cursor-pointer min-h-[44px]"
                >
                  <Settings className="w-4 h-4 text-gray-400" />
                  <span>Settings</span>
                </button>

                <button
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer min-h-[44px]"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full min-w-0 flex flex-col">
        {children}
      </main>

      {/* Standalone FAQ Modal Component */}
      <FaqComponent isOpen={isFaqOpen} onClose={() => setIsFaqOpen(false)} />
    </div>
  );
}

