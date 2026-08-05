import { useState, useEffect } from 'react';
import { Bookmark, Calendar, Code2, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Layout } from './Layout';
import { Sidebar } from './Sidebar';
import { getUserBookmarks } from '../services/snippetService';
import { SubscriptionEmptyState } from '../components/common/SubscriptionEmptyState';

export function Bookmarks() {
  const navigate = useNavigate();
  const [bookmarkedSnippets, setBookmarkedSnippets] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, totalItems: 0, currentPage: 1 });
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [uniqueLanguagesCount, setUniqueLanguagesCount] = useState(0);

  useEffect(() => {
    const loadBookmarks = async () => {
      try {
        setLoading(true);
        const data = await getUserBookmarks({ page, limit: 5 });
        setBookmarkedSnippets(data);
        const pag = (data as any).pagination;
        if (pag) {
          setPagination(pag);
          setTotalCount(pag.totalItems);
          setUniqueLanguagesCount(pag.uniqueLanguages !== undefined ? pag.uniqueLanguages : new Set(data.map((b: any) => b.language)).size);
        } else {
          setPagination({ totalPages: 1, totalItems: data.length, currentPage: 1 });
          setTotalCount(data.length);
          setUniqueLanguagesCount(new Set(data.map((b: any) => b.language)).size);
        }
      } catch (err) {
        console.error("Failed to load bookmarks:", err);
      } finally {
        setLoading(false);
      }
    };
    loadBookmarks();
  }, [page]);

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
        <Sidebar />

        <div className="flex-1 bg-gray-900 p-8 min-w-0">
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Bookmark className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{totalCount}</p>
                    <p className="text-sm text-gray-400">Total Bookmarks</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Code2 className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{uniqueLanguagesCount}</p>
                    <p className="text-sm text-gray-400">Languages</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{totalCount > 0 ? totalCount : 0}</p>
                    <p className="text-sm text-gray-400">Saved Snippets</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Bookmark Placeholder Banner */}
            <SubscriptionEmptyState type="bookmarks" />

            {/* Content Loading vs Cards */}
            {loading ? (
              <div className="flex justify-center items-center py-20" role="status" aria-busy="true">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <span className="sr-only">Loading bookmarks...</span>
              </div>
            ) : bookmarkedSnippets.length > 0 ? (
              <div className="space-y-4">
                {bookmarkedSnippets.map((snippet) => (
                  <div key={snippet.id} className="relative">
                    <div className="absolute -left-2 -top-2 z-10">
                      <div className="bg-blue-600 text-white p-2 rounded-lg shadow-lg">
                        <Bookmark className="w-4 h-4 fill-current" />
                      </div>
                    </div>
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-2">{snippet.title}</h3>
                          <p className="text-gray-400 mb-3">{snippet.description}</p>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full font-medium">
                              {snippet.language}
                            </span>
                            {snippet.tags?.map((tag: string) => (
                              <span key={tag} className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-full">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {snippet.createdAt}
                        </span>
                      </div>
                      <pre className="bg-gray-950 text-gray-100 p-4 rounded-lg overflow-x-auto border border-gray-700 custom-code-scrollbar font-mono text-sm">
                        <code>{snippet.code}</code>
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-800/40 border border-gray-700/50 rounded-2xl p-8">
                <Bookmark className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No bookmarks yet</h3>
                <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
                  Start bookmarking code snippets from the feed to access your personal collection anytime.
                </p>
                <button
                  onClick={() => navigate('/snippet-feed')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm shadow-lg shadow-blue-500/20"
                >
                  <Compass className="w-4 h-4" />
                  Explore Snippets
                </button>
              </div>
            )}

            {/* Pagination Controls */}
            {!loading && pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between bg-gray-800 border border-gray-700 rounded-lg p-4">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 text-white rounded-lg text-sm font-semibold transition-all"
                >
                  Previous
                </button>
                <span className="text-sm font-semibold text-gray-400">
                  Page {page} of {pagination.totalPages} (Total: {pagination.totalItems})
                </span>
                <button
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 text-white rounded-lg text-sm font-semibold transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
