import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Eye, SlidersHorizontal, ChevronLeft, ChevronRight, ArrowUpDown, Search } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { SnippetDetail } from './SnippetDetail';
import { Layout } from './Layout';
import { getSnippets, getCategories, getLanguages } from '../services/snippetService';

export interface Snippet {
  id: string;
  title: string;
  description: string;
  language: string;
  code: string;
  tags: string[];
  visibility: 'public' | 'private';
  author: {
    name: string;
    avatar: string;
    username: string;
  };
  createdAt: string;
  likes: number;
  comments: number;
  views: number;
  isBookmarked: boolean;
  category?: any;
}

export function SnippetFeed() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>();

  // Advanced Search & Sorting State
  const [search, setSearch] = useState('');
  const [language, setLanguage] = useState('');
  const [category, setCategory] = useState('');
  const [tag, setTag] = useState('');
  const [author, setAuthor] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Pagination State
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 1, currentPage: 1 });
  const [loading, setLoading] = useState(false);

  // Filter lists
  const [categories, setCategories] = useState<any[]>([]);
  const [languages, setLanguages] = useState<any[]>([]);

  // Load lists on mount
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const catList = await getCategories();
        setCategories(catList);
        const langList = await getLanguages({ active: true });
        setLanguages(langList);
      } catch (err) {
        console.error("Failed to load metadata in SnippetFeed:", err);
      }
    };
    loadMetadata();
  }, []);

  // Reset page to 1 on filter change (except page change)
  useEffect(() => {
    setPage(1);
  }, [search, language, category, tag, author, sortBy, sortOrder, activeCategory]);

  // Debounced search trigger
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      try {
        setLoading(true);
        const params: any = {
          page,
          limit: 10,
          sortBy,
          sortOrder,
          category: category || activeCategory || undefined,
          language: language || undefined,
          tags: tag || undefined,
          author: author || undefined,
          search: search || undefined
        };

        const data = await getSnippets(params);
        setSnippets(data);

        const pag = (data as any).pagination;
        if (pag) {
          setPagination(pag);
        } else {
          setPagination({ totalItems: data.length, totalPages: 1, currentPage: 1 });
        }

        if (data.length > 0) {
          setSelectedSnippet(prev => {
            if (!prev) return data[0];
            const stillVisible = data.find(s => s.id === prev.id);
            return stillVisible || data[0];
          });
        } else {
          setSelectedSnippet(null);
        }
      } catch (err) {
        console.error("Failed to fetch debounced snippets:", err);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounce);
  }, [search, language, category, tag, author, sortBy, sortOrder, page, activeCategory]);

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] bg-gray-900">
        {/* Sidebar */}
        <Sidebar activeCategory={activeCategory} onCategorySelect={setActiveCategory} />

        {/* Snippet List Container */}
        <div className="w-full lg:w-96 bg-gray-800 border-r border-gray-700 flex-shrink-0">
          <div className="sticky top-16 h-auto lg:h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
            {/* Search Header */}
          <div className="p-4 border-b border-gray-700 bg-gray-800/80 backdrop-blur-sm sticky top-0 z-10 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search snippets by title, description, code..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search snippets"
                  className="w-full pl-9 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`p-2 rounded-lg border transition-all ${
                  showAdvanced
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-gray-900 border-gray-700 text-gray-400 hover:text-white'
                }`}
                title="Advanced Filters"
                aria-label="Advanced filters"
                aria-expanded={showAdvanced}
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Advanced Filters Panel */}
            {showAdvanced && (
              <div className="space-y-2.5 p-3 bg-gray-900/50 border border-gray-700 rounded-lg animate-in fade-in slide-in-from-top-2 duration-155">
                {/* Language Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-gray-900 border border-gray-700 rounded text-xs text-white outline-none focus:border-blue-500"
                  >
                    <option value="">All Languages</option>
                    {languages.map(lang => (
                      <option key={lang._id} value={lang.name}>{lang.name}</option>
                    ))}
                  </select>
                </div>

                {/* Category Dropdown */}
                {!activeCategory && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-gray-900 border border-gray-700 rounded text-xs text-white outline-none focus:border-blue-500"
                    >
                      <option value="">All Categories</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Tag Search */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. react"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-gray-900 border border-gray-700 rounded text-xs text-white outline-none focus:border-blue-500 placeholder-gray-600"
                  />
                </div>

                {/* Author Search */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Author</label>
                  <input
                    type="text"
                    placeholder="e.g. admin"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-gray-900 border border-gray-700 rounded text-xs text-white outline-none focus:border-blue-500 placeholder-gray-600"
                  />
                </div>

                {/* Sort Controls */}
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-gray-900 border border-gray-700 rounded text-xs text-white outline-none focus:border-blue-500"
                    >
                      <option value="createdAt">Date Created</option>
                      <option value="title">Title</option>
                      <option value="views">Views</option>
                      <option value="likes">Likes</option>
                      <option value="bookmarksCount">Bookmarks</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Order</label>
                    <button
                      type="button"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="px-2.5 py-1.5 bg-gray-900 border border-gray-700 rounded text-xs text-white hover:bg-gray-800 flex items-center gap-1.5"
                    >
                      <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                      {sortOrder.toUpperCase()}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Snippet List Scroll Pane */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="flex justify-center items-center py-20" role="status" aria-busy="true">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <span className="sr-only">Loading snippets...</span>
              </div>
            ) : snippets.length > 0 ? (
              snippets.map((snippet) => (
                <button
                  key={snippet.id}
                  onClick={() => setSelectedSnippet(snippet)}
                  className={`w-full text-left p-4 rounded-lg transition-all border ${
                    selectedSnippet?.id === snippet.id
                      ? 'bg-gray-700/60 border-blue-500 shadow-md shadow-blue-500/5'
                      : 'bg-gray-800/50 border-gray-700 hover:bg-gray-700/40 hover:border-gray-600'
                  }`}
                >
                  {/* Author Info */}
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={snippet.author.avatar}
                      alt={snippet.author.name}
                      className="w-6 h-6 rounded-full border border-gray-600"
                    />
                    <span className="text-xs font-medium text-gray-300 truncate max-w-[120px]">
                      {snippet.author.name}
                    </span>
                    <span className="text-xs text-gray-500 ml-auto">{snippet.createdAt}</span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-white mb-1.5 line-clamp-2 text-sm leading-snug">
                    {snippet.title}
                  </h3>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    <span className="inline-block px-2 py-0.5 bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold rounded">
                      {snippet.language}
                    </span>
                    {snippet.category && (
                      <span className="inline-block px-2 py-0.5 bg-purple-600/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold rounded">
                        {typeof snippet.category === 'object' ? snippet.category.name : 'Category'}
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-3 text-xs text-gray-400 pt-1.5 border-t border-gray-700/35">
                    <span className="flex items-center gap-1 font-medium">
                      <Heart className="w-3 h-3 text-red-500/70" />
                      {snippet.likes}
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <MessageCircle className="w-3 h-3 text-blue-500/70" />
                      {snippet.comments}
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <Eye className="w-3 h-3 text-green-500/70" />
                      {snippet.views}
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-20">
                <Search className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-300 text-sm font-semibold">No snippets found</p>
                <p className="text-gray-400 text-xs mt-1 mb-3">Try adjusting your filters or search keywords.</p>
                {(search || language || category || tag || author || activeCategory) && (
                  <button
                    onClick={() => {
                      setSearch('');
                      setLanguage('');
                      setCategory('');
                      setTag('');
                      setAuthor('');
                      setActiveCategory(undefined);
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="p-3 border-t border-gray-700 bg-gray-900/40 flex items-center justify-between">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 bg-gray-800 border border-gray-700 rounded text-gray-400 hover:text-white disabled:opacity-40 transition-opacity"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold text-gray-400">
                Page {page} of {pagination.totalPages}
              </span>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 bg-gray-800 border border-gray-700 rounded text-gray-400 hover:text-white disabled:opacity-40 transition-opacity"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Detail View */}
        <div className="flex-1 bg-gray-900 min-w-0">
          {selectedSnippet ? (
            <SnippetDetail snippet={selectedSnippet} />
          ) : (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <div className="text-center">
                <p className="text-gray-400 text-lg">Select a snippet to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
