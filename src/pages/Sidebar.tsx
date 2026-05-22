import { useState, useEffect } from 'react';
import { Bookmark, Code2, Home, CreditCard, Settings } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../layouts/AuthContext';
import { getDB } from '../services/dbService';

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

  useEffect(() => {
    const db = getDB();
    setCategories(db.categories || []);
  }, []);

  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 h-[calc(100vh-4rem)] overflow-y-auto sticky top-16">
      <div className="p-4">
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
            <span className="ml-auto bg-blue-600 text-white text-xs px-2 py-1 rounded-full">8</span>
          </button>
          <button
            onClick={() => navigate('/subscription')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
          >
            <CreditCard className="w-5 h-5" />
            <span className="font-medium">Subscription</span>
          </button>
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
