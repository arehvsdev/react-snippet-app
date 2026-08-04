import { useState, useEffect } from 'react';
import { Bookmark, Code2, Home, CreditCard, Settings } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../layouts/AuthContext';
import { getCategories, getUserBookmarks } from '../services/snippetService';

interface Category {
  id: string;
  name: string;
  count: number;
}

interface SidebarProps {
  activeCategory?: string;
  onCategorySelect?: (categoryId: string) => void;
}

export function Sidebar({ activeCategory, onCategorySelect }: SidebarProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [bookmarkCount, setBookmarkCount] = useState(0);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const list = await getCategories();
        const formatted = list.map((c: any) => ({
          id: String(c._id),
          name: c.name,
          count: c.count || 0
        }));
        setCategories(formatted);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };

    const loadBookmarkCount = async () => {
      if (!user) return;
      try {
        const list = await getUserBookmarks();
        setBookmarkCount(list.length);
      } catch (err) {
        console.error("Failed to load bookmarks count:", err);
      }
    };

    loadCategories();
    loadBookmarkCount();

    const handleBookmarkEvent = (e: any) => {
      const isBookmarked = e.detail?.bookmarked;
      if (typeof isBookmarked === 'boolean') {
        setBookmarkCount(prev => Math.max(0, prev + (isBookmarked ? 1 : -1)));
      } else {
        loadBookmarkCount();
      }
    };

    window.addEventListener('bookmark-changed', handleBookmarkEvent);
    return () => {
      window.removeEventListener('bookmark-changed', handleBookmarkEvent);
    };
  }, [user]);

  return (
    <div className="hidden lg:block w-64 bg-gray-800 border-r border-gray-700 flex-shrink-0">
      <div className="p-4 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar">
        {/* Navigation */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors mb-2"
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">Home</span>
          </button>
          <button
            onClick={() => navigate('/bookmarks')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors mb-2"
          >
            <Bookmark className="w-5 h-5" />
            <span className="font-medium">Bookmarks</span>
            {user && (
              <span className="ml-auto bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                {bookmarkCount}
              </span>
            )}
          </button>
          {user?.role?.toLowerCase() !== 'admin' && (
            <button
              onClick={() => navigate('/subscription')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              <CreditCard className="w-5 h-5" />
              <span className="font-medium">Subscription</span>
            </button>
          )}
        </div>

        {/* Categories */}
        <div>
          <div className="flex items-center gap-2 px-4 mb-3">
            <Code2 className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Categories
            </h3>
          </div>
          <div className="space-y-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onCategorySelect?.(category.id)}
                className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors ${
                  activeCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span className="text-sm font-medium">{category.name}</span>
                <span className="text-xs bg-gray-700 px-2 py-0.5 rounded-full">
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Admin Section (conditional) */}
        {user?.role?.toLowerCase() === 'admin' && (
          <div className="mt-6 pt-6 border-t border-gray-700">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Admin Panel</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
