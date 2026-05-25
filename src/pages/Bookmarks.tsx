<<<<<<< HEAD

import { Bookmark, Calendar, Code2 } from 'lucide-react';
import { Layout } from './Layout';
import { Sidebar } from './Sidebar';

const bookmarkedSnippets = [
  {
    id: '1',
    title: 'Debounce Function',
    language: 'JavaScript',
    description: 'Classic debounce implementation for optimizing search inputs',
    tags: ['javascript', 'performance'],
    code: `function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}`,
    bookmarkedAt: '2 days ago'
  },
  {
    id: '2',
    title: 'Local Storage Hook',
    language: 'TypeScript',
    description: 'React hook for localStorage with TypeScript',
    tags: ['react', 'hooks', 'typescript'],
    code: `function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}`,
    bookmarkedAt: '1 week ago'
  }
];

export function Bookmarks() {
=======
import { useState, useEffect } from 'react';
import { Bookmark, Calendar, Code2 } from 'lucide-react';
import { Layout } from './Layout';
import { Sidebar } from './Sidebar';
import { getDB } from '../services/dbService';
export function Bookmarks() {
  const [bookmarkedSnippets, setBookmarkedSnippets] = useState<any[]>([]);

  useEffect(() => {
    const db = getDB();
    setBookmarkedSnippets(db.bookmarks || []);
  }, []);

  const uniqueLanguages = new Set(bookmarkedSnippets.map(b => b.language)).size;

>>>>>>> 7fb3d4f (feat: add SnippetFeed and SnippetList components for displaying code snippets)
  return (
    <Layout>
      <div className="flex min-h-[calc(100vh-4rem)]">
        <Sidebar />

        <div className="flex-1 bg-gray-900 p-8">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-blue-600 p-3 rounded-lg">
                  <Bookmark className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white">My Bookmarks</h1>
              </div>
              <p className="text-gray-400">
                Snippets you've saved for quick access
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Bookmark className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{bookmarkedSnippets.length}</p>
                    <p className="text-sm text-gray-400">Total Bookmarks</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Code2 className="w-5 h-5 text-green-400" />
                  <div>
<<<<<<< HEAD
                    <p className="text-2xl font-bold text-white">5</p>
=======
                    <p className="text-2xl font-bold text-white">{uniqueLanguages}</p>
>>>>>>> 7fb3d4f (feat: add SnippetFeed and SnippetList components for displaying code snippets)
                    <p className="text-sm text-gray-400">Languages</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">3</p>
                    <p className="text-sm text-gray-400">This Week</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bookmarked Snippets */}
            <div className="space-y-4">
              {bookmarkedSnippets.map((snippet) => (
                <div key={snippet.id} className="relative">
                  <div className="absolute -left-2 -top-2 z-10">
                    <div className="bg-blue-600 text-white p-2 rounded-lg shadow-lg">
                      <Bookmark className="w-4 h-4 fill-current" />
                    </div>
                  </div>
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">{snippet.title}</h3>
                        <p className="text-gray-400 mb-3">{snippet.description}</p>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                            {snippet.language}
                          </span>
                          {snippet.tags.map((tag) => (
                            <span key={tag} className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-full">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        Saved {snippet.bookmarkedAt}
                      </span>
                    </div>
                    <pre className="bg-gray-950 text-gray-100 p-4 rounded-lg overflow-x-auto border border-gray-700">
                      <code className="text-sm">{snippet.code}</code>
                    </pre>
                  </div>
                </div>
              ))}
            </div>

            {bookmarkedSnippets.length === 0 && (
              <div className="text-center py-16">
                <Bookmark className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No bookmarks yet</h3>
                <p className="text-gray-500">
                  Start bookmarking snippets to access them quickly later
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
