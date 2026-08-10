import { useState, useEffect } from 'react';
import { Bookmark, Code2, Home, CreditCard, Settings, X } from 'lucide-react';
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
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ activeCategory, onCategorySelect, isOpenMobile = false, onCloseMobile }: SidebarProps) {
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

  const handleCategoryClick = (categoryId: string) => {
    onCategorySelect?.(categoryId);
    onCloseMobile?.();
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    onCloseMobile?.();
  };

  // Close mobile sidebar on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpenMobile) {
        onCloseMobile?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpenMobile, onCloseMobile]);

  const sidebarContent = (
    <div className="p-4 h-full overflow-y-auto custom-scrollbar flex flex-col justify-between">
      <div>
        {/* Navigation */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => handleNavClick('/')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-gray-700/80 hover:text-white transition-colors mb-2 min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
          >
            <Home className="w-5 h-5 text-blue-400" />
            <span className="font-semibold text-sm">Home</span>
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('/bookmarks')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-gray-700/80 hover:text-white transition-colors mb-2 min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
          >
            <Bookmark className="w-5 h-5 text-purple-400" />
            <span className="font-semibold text-sm">Bookmarks</span>
            {user && (
              <span className="ml-auto bg-blue-600 text-white text-xs px-2.5 py-0.5 rounded-full font-bold">
                {bookmarkCount}
              </span>
            )}
          </button>
          {user?.role?.toLowerCase() !== 'admin' && (
            <button
              type="button"
              onClick={() => handleNavClick('/subscription')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-gray-700/80 hover:text-white transition-colors min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
            >
              <CreditCard className="w-5 h-5 text-amber-400" />
              <span className="font-semibold text-sm">Subscription</span>
            </button>
          )}
        </div>

        {/* Categories */}
        <div>
          <div className="flex items-center justify-between px-4 mb-3">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Categories
              </h3>
            </div>
            {activeCategory && (
              <button
                type="button"
                onClick={() => handleCategoryClick('')}
                className="text-xs text-blue-400 hover:underline font-semibold"
              >
                Clear
              </button>
            )}
          </div>
          <div className="space-y-1">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategoryClick(category.id)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all min-h-[44px] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  activeCategory === category.id
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20'
                    : 'text-gray-300 hover:bg-gray-700/70 hover:text-white'
                }`}
              >
                <span className="text-sm font-medium">{category.name}</span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                  activeCategory === category.id ? 'bg-blue-700 text-white' : 'bg-gray-700 text-gray-300'
                }`}>
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Admin Section (conditional) */}
      {user?.role?.toLowerCase() === 'admin' && (
        <div className="mt-6 pt-6 border-t border-gray-700/80">
          <button
            type="button"
            onClick={() => handleNavClick('/admin/dashboard')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-gray-700/80 hover:text-white transition-colors min-h-[44px] cursor-pointer"
          >
            <Settings className="w-5 h-5 text-purple-400" />
            <span className="font-semibold text-sm">Admin Panel</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar Container */}
      <div className="hidden lg:block lg:w-[220px] xl:w-60 2xl:w-[260px] bg-gray-800 border-r border-gray-700/80 flex-shrink-0 h-full">
        <div className="h-full">
          {sidebarContent}
        </div>
      </div>

      {/* Mobile Sidebar Overlay Drawer */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label="Category Selection Menu">
          {/* Semi-transparent Backdrop */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer Sliding Content Panel */}
          <div className="relative flex-1 max-w-xs w-full bg-gray-800 border-r border-gray-700 shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-900">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-blue-400" />
                <span className="font-bold text-white text-base">Filter by Category</span>
              </div>
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
                aria-label="Close category menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {sidebarContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
