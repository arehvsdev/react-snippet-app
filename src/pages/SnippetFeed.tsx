import { useState, useEffect } from 'react';
import { Heart, MessageCircle, SlidersHorizontal, ChevronLeft, ChevronRight, ArrowUpDown, Search, Sparkles, Code2, Crown, Lock } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { SnippetDetail } from './SnippetDetail';
import { Layout } from './Layout';
import { useAuth } from '../layouts/AuthContext';
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
  recommendationScore?: number;
  ai?: {
    recommendationScore?: number;
    sentimentScore?: number;
    helpfulnessScore?: number;
    toxicityScore?: number;
    positiveComments?: number;
    negativeComments?: number;
    lastAnalyzed?: string | null;
  };
}

export function SnippetFeed() {
  const { user } = useAuth();
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Advanced Search & Sorting State (Default: AI Recommendation Score descending)
  const [search, setSearch] = useState('');
  const [language, setLanguage] = useState('');
  const [category, setCategory] = useState('');
  const [tag, setTag] = useState('');
  const [author, setAuthor] = useState('');
  const [visibility, setVisibility] = useState('');
  const [sortBy, setSortBy] = useState('aiRecommendationScore');
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
  }, [search, language, category, tag, author, visibility, sortBy, sortOrder, activeCategory]);

  // Debounced search / recommendation fetch trigger
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      try {
        setLoading(true);

        const currentUserId = user?.id || (user as any)?._id || (user as any)?.uid;

        const params: any = {
          page,
          limit: 10,
          sortBy,
          sortOrder,
          category: category || activeCategory || undefined,
          language: language || undefined,
          tags: tag || undefined,
          visibility: visibility || undefined,
          excludeUserId: currentUserId || undefined,
          author: author || undefined,
          search: search || undefined
        };

        // Fetch live snippets with active filters & sorting
        const data = await getSnippets(params);
        const rawList = Array.isArray(data) ? data : ((data as any)?.snippets || []);

        // Filter out logged-in user's snippets only when no specific filter is active and user is not PRO
        const hasActiveFilter = Boolean(activeCategory || category || language || search || tag || author || visibility);
        const isPro = user?.plan === 'PRO' || (user?.role && (user.role.toLowerCase() === 'admin' || user.role.toLowerCase() === 'pro'));

        const snippetList = (hasActiveFilter || isPro)
          ? rawList
          : rawList.filter((s: any) => {
              if (!user) return true;
              const authorId = String(s.createdBy?._id || s.createdBy || s.author?.id || '');
              const authorUsername = s.author?.username;
              return authorId !== String(currentUserId) && authorUsername !== user?.username;
            });

        setSnippets(snippetList);

        const pag = (data as any)?.pagination;
        if (pag) {
          setPagination(pag);
        } else {
          setPagination({ totalItems: snippetList.length, totalPages: 1, currentPage: 1 });
        }

        setSelectedSnippet(prev => {
          if (!prev && snippetList.length > 0) return snippetList[0];
          const stillVisible = snippetList.find((s: any) => s.id === prev?.id);
          return stillVisible || (snippetList.length > 0 ? snippetList[0] : null);
        });
      } catch (err) {
        console.error("Failed to fetch debounced snippets:", err);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounce);
  }, [search, language, category, tag, author, visibility, sortBy, sortOrder, page, activeCategory, user]);

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] bg-gray-900 w-full min-w-0 lg:overflow-hidden">
        {/* Sidebar */}
        <Sidebar 
          activeCategory={activeCategory} 
          onCategorySelect={setActiveCategory}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Snippet List Container */}
        <div className="w-full lg:w-[320px] xl:w-[360px] 2xl:w-[400px] bg-gray-800 border-r border-gray-700/80 flex-shrink-0 flex flex-col min-w-0 h-auto lg:h-full overflow-hidden">
          <div className="h-full flex flex-col overflow-hidden">
            {/* Search Header & Advanced Filter Container */}
            <div className="p-4 border-b border-gray-700/80 bg-gray-800 sticky top-0 z-20 flex flex-col gap-3 shadow-sm">
              {/* For You Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                  <span>For You</span>
                </h2>
                <span className="text-[10px] font-extrabold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 uppercase tracking-wider">
                  Recommended First
                </span>
              </div>

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
                      ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/20'
                      : 'bg-gray-900 border-gray-700 text-gray-400 hover:text-white'
                  }`}
                  title="Advanced Filters"
                  aria-label="Advanced filters"
                  aria-expanded={showAdvanced}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* Advanced Filters Panel (Integrated inside sticky header with solid background) */}
              {showAdvanced && (
                <div className="space-y-3 p-3.5 bg-gray-900 border border-gray-700/80 rounded-xl shadow-xl animate-in fade-in slide-in-from-top-2 duration-150 mt-1">
                  {/* Language Dropdown */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Language</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-gray-950 border border-gray-700 rounded-lg text-xs text-white outline-none focus:border-blue-500 transition-colors"
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
                      <label className="block text-xs font-semibold text-gray-300 mb-1">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-gray-950 border border-gray-700 rounded-lg text-xs text-white outline-none focus:border-blue-500 transition-colors"
                      >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                          <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Visibility Dropdown */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 text-purple-400" />
                        <span>Visibility</span>
                      </span>
                      {user?.plan === 'PRO' ? (
                        <span className="text-[10px] text-amber-400 font-extrabold flex items-center gap-0.5 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          <Crown className="w-3 h-3 fill-amber-400 text-amber-400" /> PRO Unlocked
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400">Public & Own Private</span>
                      )}
                    </label>
                    <select
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-gray-950 border border-gray-700 rounded-lg text-xs text-white outline-none focus:border-blue-500 transition-colors"
                    >
                      <option value="">All Visibilities</option>
                      <option value="public">Public Snippets</option>
                      <option value="private">Private Snippets</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">Tag</label>
                      <input
                        type="text"
                        placeholder="e.g. react"
                        value={tag}
                        onChange={(e) => setTag(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-gray-950 border border-gray-700 rounded-lg text-xs text-white outline-none focus:border-blue-500 placeholder-gray-600 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">Author</label>
                      <input
                        type="text"
                        placeholder="e.g. admin"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-gray-950 border border-gray-700 rounded-lg text-xs text-white outline-none focus:border-blue-500 placeholder-gray-600 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Sort Controls */}
                  <div className="flex gap-2 items-end pt-1">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-gray-300 mb-1">Sort By</label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-gray-950 border border-gray-700 rounded-lg text-xs text-white outline-none focus:border-blue-500 transition-colors"
                      >
                        <option value="createdAt">Date Created</option>
                        <option value="aiScore">✨ AI Quality Score</option>
                        <option value="title">Title</option>
                        <option value="views">Views</option>
                        <option value="likes">Likes</option>
                        <option value="bookmarksCount">Bookmarks</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">Order</label>
                      <button
                        type="button"
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="px-3 py-1.5 bg-gray-950 border border-gray-700 rounded-lg text-xs font-semibold text-white hover:bg-gray-900 flex items-center gap-1.5 transition-colors"
                      >
                        <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                        {sortOrder.toUpperCase()}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Snippet Selector Dropdown (< 1024px) */}
            {Array.isArray(snippets) && snippets.length > 0 && (
              <div className="block lg:hidden px-4 pt-3 pb-3 border-b border-gray-700/80 bg-gray-900">
                <label htmlFor="mobile-snippet-select" className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-blue-400" />
                    Select Snippet ({snippets.length})
                  </span>
                  {selectedSnippet && (
                    <span className="text-blue-400 font-mono text-[10px] bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      {selectedSnippet.language}
                    </span>
                  )}
                </label>
                <select
                  id="mobile-snippet-select"
                  value={selectedSnippet?.id || ''}
                  onChange={(e) => {
                    const found = snippets.find((s) => s.id === e.target.value);
                    if (found) {
                      setSelectedSnippet(found);
                    }
                  }}
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-700 rounded-lg text-white text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {snippets.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title} ({s.language}) — {s.author.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

          {/* Snippet List Scroll Pane (Desktop view) */}
          <div className="hidden lg:block flex-1 lg:overflow-y-auto p-4 space-y-3">
            {loading && (!Array.isArray(snippets) || snippets.length === 0) ? (
              /* 1. Initial Load: Centered Loader */
              <div className="flex-1 flex flex-col justify-center items-center py-24 min-h-[300px]" role="status" aria-busy="true">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-3"></div>
                <p className="text-xs font-semibold text-gray-400">Loading snippets...</p>
                <span className="sr-only">Loading snippets...</span>
              </div>
            ) : Array.isArray(snippets) && snippets.length > 0 ? (
              /* 2. Snippet Items List */
              <>
                {snippets.map((snippet) => (
                  <button
                    key={snippet.id}
                    type="button"
                    onClick={() => setSelectedSnippet(snippet)}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-xl transition-all border group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      selectedSnippet?.id === snippet.id
                        ? 'bg-gray-700/70 border-blue-500 shadow-md shadow-blue-500/10'
                        : 'bg-gray-800/60 border-gray-700/80 hover:bg-gray-750 hover:border-gray-600'
                    }`}
                  >
                    {/* Author Info & Date Header */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <img
                          src={snippet.author.avatar}
                          alt={snippet.author.name}
                          className="w-6 h-6 rounded-full border border-gray-600 object-cover flex-shrink-0"
                        />
                        <span className="text-xs font-semibold text-gray-300 truncate">
                          {snippet.author.name}
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-400 font-medium flex-shrink-0">{snippet.createdAt}</span>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-white mb-2 text-sm sm:text-base leading-snug break-words line-clamp-2 group-hover:text-blue-300 transition-colors">
                      {snippet.title}
                    </h3>

                    {/* Badges & AI Score Tag */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-3">
                      <span className="inline-block px-2.5 py-0.5 bg-blue-600/15 border border-blue-500/30 text-blue-400 text-[11px] font-bold rounded-md uppercase tracking-wider">
                        {snippet.language}
                      </span>
                      {snippet.category && (
                        <span className="inline-block px-2.5 py-0.5 bg-purple-600/15 border border-purple-500/30 text-purple-300 text-[11px] font-bold rounded-md">
                          {typeof snippet.category === 'object' ? snippet.category.name : 'Category'}
                        </span>
                      )}
                      {snippet.visibility === 'private' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-purple-600/20 border border-purple-500/40 text-purple-300 text-[11px] font-extrabold rounded-md uppercase tracking-wider">
                          <Lock className="w-3 h-3 text-purple-400" />
                          <span>Private</span>
                        </span>
                      )}
                      {(snippet.recommendationScore || snippet.ai?.recommendationScore) ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold rounded-md ml-auto">
                          <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400/20" />
                          <span>Score: {snippet.recommendationScore ?? snippet.ai?.recommendationScore}</span>
                        </span>
                      ) : null}
                    </div>

                    {/* Stats Footer */}
                    <div className="flex items-center gap-4 text-xs text-gray-400 pt-2 border-t border-gray-700/50">
                      <span className="flex items-center gap-1 font-medium hover:text-red-400 transition-colors">
                        <Heart className={`w-3.5 h-3.5 ${snippet.isLiked ? 'fill-current text-red-500' : 'text-red-500/80'}`} />
                        {snippet.likes}
                      </span>
                      <span className="flex items-center gap-1 font-medium hover:text-blue-400 transition-colors">
                        <MessageCircle className="w-3.5 h-3.5 text-blue-500/80" />
                        {snippet.comments}
                      </span>
                    </div>
                  </button>
                ))}

                {/* 3. Inline Loader for Infinite Scroll / Page Fetching */}
                {loading && (
                  <div className="flex items-center justify-center gap-2.5 py-3.5 min-h-[60px] bg-gray-800/40 border border-gray-700/50 rounded-xl my-2 animate-in fade-in duration-150" role="status" aria-busy="true">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                    <span className="text-xs font-semibold text-gray-300">Fetching additional snippets...</span>
                  </div>
                )}

                {/* Infinite Scroll Sentinel */}
                <div id="infinite-scroll-sentinel" className="h-1 w-full" />
              </>
            ) : (
              /* 4. Empty State */
              <div className="text-center py-20">
                <Search className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-300 text-sm font-semibold">No snippets found</p>
                <p className="text-gray-400 text-xs mt-1 mb-3">Try adjusting your filters or search keywords.</p>
                {(search || language || category || tag || author || activeCategory) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch('');
                      setLanguage('');
                      setCategory('');
                      setTag('');
                      setAuthor('');
                      setActiveCategory(undefined);
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm cursor-pointer"
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
        <div id="snippet-detail-container" className="flex-1 min-w-0 min-h-0 w-full bg-gray-900 h-auto lg:h-full lg:overflow-y-auto custom-scrollbar">
          {selectedSnippet ? (
            <SnippetDetail
              snippet={selectedSnippet}
              onSelectSnippet={(updated) => {
                setSelectedSnippet(updated);
                if (updated && updated.id) {
                  setSnippets(prev => prev.map(s => s.id === updated.id ? { ...s, ...updated } : s));
                }
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <div className="text-center p-6">
                <div className="w-16 h-16 rounded-full bg-gray-800 border border-gray-700/80 flex items-center justify-center mx-auto mb-4 text-gray-500 shadow-inner">
                  <Code2 className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-300 text-lg font-bold">Select a snippet to view details</p>
                <p className="text-gray-500 text-xs mt-1">Choose any snippet from the feed to inspect code, comments, and AI similarity insights.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
