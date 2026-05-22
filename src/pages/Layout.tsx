import { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { Bell, Code2, Home, Plus, BookMarked, User } from 'lucide-react';
import { useAuth } from '../layouts/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Top Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div
              onClick={() => navigate('/')}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="bg-blue-600 p-2 rounded-lg">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">CodeSnippets</span>
            </div>

            {/* Navigation Menu */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
              >
                <Home className="w-5 h-5" />
                <span className="font-medium">Home</span>
              </button>
              <button
                onClick={() => navigate('/create')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Create</span>
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
              >
                <BookMarked className="w-5 h-5" />
                <span className="font-medium">My Snippets</span>
              </button>
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center gap-4">
              {/* Notification Icon */}
              <button className="relative p-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Profile Avatar */}
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-3 pl-3 pr-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=3b82f6&color=fff`}
                  alt={user?.fullName || 'User'}
                  className="w-8 h-8 rounded-full object-cover border-2 border-gray-600"
                />
                <span className="font-medium text-white">{user?.fullName || 'User'}</span>
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
