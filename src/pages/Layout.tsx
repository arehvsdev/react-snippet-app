import { useState, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, Code2, Home, Plus, BookMarked, Sparkles, CreditCard } from 'lucide-react';
import { useAuth } from '../layouts/AuthContext';
import { PlanBadge } from '../components/subscription/PlanBadge';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  const notificationsList = [
    {
      id: '1',
      title: 'Welcome to CodeSnippets!',
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
              onClick={() => navigate('/')}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-2 rounded-xl shadow-md group-hover:scale-105 transition-transform">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">CodeSnippets</span>
            </div>

            {/* Navigation Menu */}
            <div className="hidden md:flex items-center gap-1">
              <button
                onClick={() => navigate('/snippet-feed')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors ${
                  isActive('/snippet-feed') || isActive('/')
                    ? 'bg-blue-600/20 text-blue-400 font-semibold border border-blue-500/30'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Home className="w-4 h-4" />
                <span className="text-sm font-medium">Home</span>
              </button>
              <button
                onClick={() => navigate('/create')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors ${
                  isActive('/create')
                    ? 'bg-blue-600/20 text-blue-400 font-semibold border border-blue-500/30'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">Create</span>
              </button>
              <button
                onClick={() => navigate('/profile')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors ${
                  isActive('/profile')
                    ? 'bg-blue-600/20 text-blue-400 font-semibold border border-blue-500/30'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <BookMarked className="w-4 h-4" />
                <span className="text-sm font-medium">My Snippets</span>
              </button>
              <button
                onClick={() => navigate('/pricing')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors ${
                  isActive('/pricing')
                    ? 'bg-blue-600/20 text-blue-400 font-semibold border border-blue-500/30'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span className="text-sm font-medium">Pricing</span>
              </button>
              <button
                onClick={() => navigate('/subscription')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors ${
                  isActive('/subscription')
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

              {/* Profile Avatar & Plan Badge */}
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl hover:bg-gray-700/80 transition-colors border border-transparent hover:border-gray-700"
                aria-label="View user profile"
              >
                <img
                  src={user?.avatar ? (user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`) : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=3b82f6&color=fff`}
                  alt={user?.fullName || 'User'}
                  className="w-8 h-8 rounded-lg object-cover border border-gray-600"
                />
                <div className="hidden sm:flex flex-col items-start text-left">
                  <span className="text-xs font-semibold text-white leading-tight max-w-[100px] truncate">{user?.fullName || 'User'}</span>
                  <PlanBadge plan={user?.plan || 'FREE'} size="sm" showIcon={false} className="mt-0.5 scale-90 origin-left" />
                </div>
                <div className="sm:hidden">
                  <PlanBadge plan={user?.plan || 'FREE'} size="sm" showIcon={false} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      {children}
    </div>
  );
}
