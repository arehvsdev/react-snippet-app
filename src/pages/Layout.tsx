import { useState, useEffect, useRef, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, Code2, Home, Plus, BookMarked, Sparkles, CreditCard, LogOut, Settings, Key, User, HelpCircle } from 'lucide-react';
import { useAuth } from '../layouts/AuthContext';
import { PlanBadge } from '../components/subscription/PlanBadge';
import { FaqComponent } from '../components/FAQ/FaqComponent';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  /** Navigate and close the profile dropdown */
  const profileNavigate = (path: string) => {
    setShowProfileMenu(false);
    navigate(path);
  };

  const notificationsList = [
    {
      id: '1',
      title: 'Welcome to SnipForge!',
      message: 'Explore public code snippets, create your own library, and connect with developers.',
      time: 'Just now'
    },
    {
      id: '2',
      title: 'System Operational',
      message: 'All API services and MongoDB database connections are running smoothly.',
      time: '5m ago'
    }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Top Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div
              onClick={() => navigate(user ? '/snippet-feed' : '/')}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-2 rounded-xl shadow-md group-hover:scale-105 transition-transform">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">SnipForge</span>
            </div>

            {/* Navigation Menu */}
            <div className="hidden md:flex items-center gap-1">
              <button
                onClick={() => navigate('/snippet-feed')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors ${isActive('/snippet-feed') || isActive('/')
                    ? 'bg-blue-600/20 text-blue-400 font-semibold border border-blue-500/30'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
              >
                <Home className="w-4 h-4" />
                <span className="text-sm font-medium">Home</span>
              </button>
              <button
                onClick={() => navigate('/create')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors ${isActive('/create')
                    ? 'bg-blue-600/20 text-blue-400 font-semibold border border-blue-500/30'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">Create</span>
              </button>
              <button
                onClick={() => navigate('/profile')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors ${isActive('/profile')
                    ? 'bg-blue-600/20 text-blue-400 font-semibold border border-blue-500/30'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
              >
                <BookMarked className="w-4 h-4" />
                <span className="text-sm font-medium">My Snippets</span>
              </button>
              <button
                onClick={() => navigate('/pricing')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors ${isActive('/pricing')
                    ? 'bg-blue-600/20 text-blue-400 font-semibold border border-blue-500/30'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
              >
                <CreditCard className="w-4 h-4" />
                <span className="text-sm font-medium">Pricing</span>
              </button>
              <button
                onClick={() => navigate('/subscription')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors ${isActive('/subscription')
                    ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium">Subscription</span>
              </button>
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center gap-3">
              {/* Notification Popover Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setHasUnread(false);
                  }}
                  className="relative p-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  aria-label="Notifications"
                  aria-expanded={showNotifications}
                >
                  <Bell className="w-5 h-5" />
                  {hasUnread && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-700">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-blue-400" />
                        <span className="font-bold text-sm text-white">Notifications</span>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-full">
                        {notificationsList.length} New
                      </span>
                    </div>

                    <div className="divide-y divide-gray-700/60 max-h-64 overflow-y-auto">
                      {notificationsList.map(item => (
                        <div key={item.id} className="p-3 hover:bg-gray-700/40 transition-colors">
                          <p className="text-xs font-semibold text-white mb-0.5">{item.title}</p>
                          <p className="text-xs text-gray-400 leading-relaxed mb-1">{item.message}</p>
                          <span className="text-[9px] text-gray-500">{item.time}</span>
                        </div>
                      ))}
                    </div>

                    <div className="p-2 bg-gray-900/60 border-t border-gray-700 text-center">
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Avatar & Dropdown */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="p-1 rounded-full hover:ring-2 hover:ring-blue-500/50 transition-all"
                  aria-label="Open profile menu"
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
                  <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* User Info Header */}
                    <div className="px-4 py-3.5 bg-gray-900 border-b border-gray-700">
                      <p className="text-sm font-bold text-white truncate">{user?.fullName || 'User'}</p>
                      <p className="text-xs text-gray-400 truncate mb-1.5">{user?.email}</p>
                      {user?.role?.toLowerCase() === 'admin' ? (
                        <span className="inline-flex items-center rounded-full bg-blue-900/40 text-blue-400 border border-blue-500/30 px-2 py-0.5 text-[10px] font-semibold">ADMIN</span>
                      ) : (
                        <PlanBadge plan={user?.plan || 'FREE'} size="sm" />
                      )}
                    </div>

                    {/* Menu Items */}
                    <div className="py-1.5">
                      <button onClick={() => profileNavigate('/profile')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700/60 hover:text-white transition-colors cursor-pointer">
                        <User className="w-4 h-4 text-gray-400" /> Profile
                      </button>
                      <button onClick={() => profileNavigate('/subscription')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700/60 hover:text-white transition-colors cursor-pointer">
                        <Sparkles className="w-4 h-4 text-amber-400" /> Subscription
                      </button>
                      <button onClick={() => profileNavigate('/pricing')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700/60 hover:text-white transition-colors cursor-pointer">
                        <CreditCard className="w-4 h-4 text-gray-400" /> Pricing
                      </button>
                      <button onClick={() => { setShowProfileMenu(false); setIsFaqOpen(true); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700/60 hover:text-white transition-colors cursor-pointer">
                        <HelpCircle className="w-4 h-4 text-blue-400" /> FAQs
                      </button>
                    </div>

                    <div className="border-t border-gray-700/60 py-1.5">
                      <button onClick={() => profileNavigate('/profile?action=edit')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700/60 hover:text-white transition-colors cursor-pointer">
                        <Settings className="w-4 h-4 text-gray-400" /> Settings
                      </button>
                      <button onClick={() => profileNavigate('/profile?action=password')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700/60 hover:text-white transition-colors cursor-pointer">
                        <Key className="w-4 h-4 text-gray-400" /> Change Password
                      </button>
                    </div>

                    <div className="border-t border-gray-700/60 py-1.5">
                      <button
                        onClick={() => { setShowProfileMenu(false); logout(); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer"
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

      {/* Main Content */}
      {children}

      {/* Standalone FAQ Modal Component */}
      <FaqComponent isOpen={isFaqOpen} onClose={() => setIsFaqOpen(false)} />
    </div>
  );
}
