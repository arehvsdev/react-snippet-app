import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Sparkles, Crown, ShieldCheck, Lock, Globe } from 'lucide-react';
import { Layout } from './Layout';
import { useAuth } from '../layouts/AuthContext';
import { ProBadge } from '../components/subscription/ProBadge';
import { PlanBadge } from '../components/subscription/PlanBadge';
import { UpgradeModal } from '../components/subscription/UpgradeModal';
import { createSnippet, updateSnippet, getSnippetById, getSnippets, getLanguages, getTags } from '../services/snippetService';
import toast from 'react-hot-toast';

/**
 * Create and Edit Snippet Component with Frontend Feature Gating:
 * - FREE users: Maximum 3 snippets, Public snippets only.
 * - PRO users: Unlimited snippets, Public/Private visibility selector.
 */
export function CreateSnippet() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  
  // Feature gating flag
  const isPro = user?.plan === 'PRO';
  const isEditMode = !!id;

  // Form input states
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('');
  const [langSearchInput, setLangSearchInput] = useState('');
  const [showLangSuggestions, setShowLangSuggestions] = useState(false);
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [suggestedTags, setSuggestedTags] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [code, setCode] = useState('');
  const [languagesList, setLanguagesList] = useState<any[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [userSnippetCount, setUserSnippetCount] = useState<number>(0);

  // Validation error states
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Load language list & snippet details if in edit mode
  useEffect(() => {
    const loadData = async () => {
      try {
        const langList = await getLanguages({ active: true });
        setLanguagesList(langList);

        // Track snippet count for FREE tier limit enforcement
        if (user) {
          const userId = user.id || user.uid;
          const userSnippets = await getSnippets({ userId });
          setUserSnippetCount(userSnippets.length);
        }
        
        if (isEditMode && id) {
          const s = await getSnippetById(id);
          setTitle(s.title || '');
          setLanguage(s.language || '');
          setLangSearchInput(s.language || '');
          setDescription(s.description || '');
          setSelectedTags(s.tags || []);
          setCode(s.code || '');
          setIsPublic(s.visibility === 'public');
        } else if (langList.length > 0) {
          setLanguage(langList[0].name);
          setLangSearchInput(langList[0].name);
        }
      } catch (err) {
        console.error("Failed to load snippet data:", err);
      }
    };
    loadData();
  }, [id, isEditMode, user]);

  // Tag search autocomplete debounce
  useEffect(() => {
    if (!tagInput.trim()) {
      setSuggestedTags([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      try {
        const matches = await getTags({ active: true, search: tagInput.trim() });
        const filteredMatches = matches.filter(
          (t: any) => !selectedTags.includes(t.name)
        );
        setSuggestedTags(filteredMatches);
      } catch (err) {
        console.error("Failed to load tag suggestions:", err);
      }
    }, 200);
    return () => clearTimeout(delayDebounce);
  }, [tagInput, selectedTags]);

  useEffect(() => {
    const handleClose = () => {
      setShowSuggestions(false);
      setShowLangSuggestions(false);
    };
    document.addEventListener('click', handleClose);
    return () => document.removeEventListener('click', handleClose);
  }, []);

  // Form submission handler with frontend feature gating
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. FREE Plan Limit Check: Maximum 10 snippets
    if (!isPro && !isEditMode && userSnippetCount >= 3) {
      toast.error("Upgrade to PRO for unlimited snippets.");
      setIsUpgradeModalOpen(true);
      return;
    }

    // 2. Input validation checks
    const newErrors: { [key: string]: string } = {};
    if (!title || title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }
    if (!language) {
      newErrors.language = 'Language is required';
    }
    if (!code || code.length < 10) {
      newErrors.code = 'Code must be at least 10 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    
    try {
      // 3. FREE users are fixed to 'public' visibility; PRO users can choose 'public' or 'private'
      const targetVisibility = isPro ? (isPublic ? 'public' : 'private') : 'public';

      const snippet = {
        title,
        language,
        description,
        code,
        tags: selectedTags,
        visibility: targetVisibility as 'public' | 'private'
      };

      if (isEditMode && id) {
        await updateSnippet(id, snippet);
        toast.success('Snippet updated successfully!');
      } else {
        await createSnippet(snippet);
        toast.success('Snippet created successfully!');
      }
      
      navigate('/snippet-feed');
    } catch (err: any) {
      console.error('Failed to save snippet:', err);
      toast.error(err.message || 'Failed to save snippet');
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/snippet-feed')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Snippets
        </button>

        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-white">
              {isEditMode ? 'Edit Snippet' : 'Create New Snippet'}
            </h1>
            {isPro ? <ProBadge size="sm" /> : <PlanBadge plan="FREE" size="sm" />}
          </div>
          <p className="text-gray-400 mb-6">
            {isEditMode ? 'Modify your code snippet details' : 'Add a new code snippet to your collection'}
          </p>

          {/* Subscription Notice Banner */}
          {!isPro ? (
            <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-amber-500/10 border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-semibold text-white">Free Tier Limits: </span>
                  <span className="text-gray-300">
                    Max 3 public snippets ({userSnippetCount}/3 used). <strong className="text-amber-400">Upgrade to PRO for unlimited snippets & private storage</strong>.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUpgradeModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-gray-950 bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-400 text-xs shadow-md shrink-0 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 fill-current" /> Upgrade to PRO
              </button>
            </div>
          ) : (
            <div className="mb-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs sm:text-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <Crown className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <span className="font-bold text-amber-300">PRO Membership Active: </span>
                  <span className="text-gray-300">Unlimited public & private code snippets enabled.</span>
                </div>
              </div>
              <ProBadge size="xs" />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title Field */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full px-4 py-2 bg-gray-900 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-white placeholder-gray-500 ${errors.title ? 'border-red-500' : 'border-gray-600'}`}
                placeholder="e.g., React useState Hook"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-400">{errors.title}</p>
              )}
            </div>

            {/* Language Field */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <label htmlFor="language" className="block text-sm font-medium text-gray-300 mb-2">
                Language <span className="text-red-400">*</span>
              </label>
              <input
                id="language"
                type="text"
                placeholder="Type to search or enter custom language..."
                value={langSearchInput}
                onChange={(e) => {
                  setLangSearchInput(e.target.value);
                  setLanguage(e.target.value);
                  setShowLangSuggestions(true);
                }}
                onFocus={() => setShowLangSuggestions(true)}
                className={`w-full px-4 py-2 bg-gray-900 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-white placeholder-gray-500 ${errors.language ? 'border-red-500' : 'border-gray-600'}`}
              />
              {showLangSuggestions && (
                <div className="absolute left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl max-h-60 overflow-y-auto z-50">
                  {languagesList
                    .filter((lang) =>
                      lang.name.toLowerCase().includes(langSearchInput.toLowerCase())
                    )
                    .map((lang) => (
                      <button
                        key={lang._id}
                        type="button"
                        onClick={() => {
                          setLanguage(lang.name);
                          setLangSearchInput(lang.name);
                          setShowLangSuggestions(false);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-700 transition-colors text-white border-b border-gray-800 last:border-0 cursor-pointer"
                      >
                        {lang.name}
                      </button>
                    ))}
                </div>
              )}
              {errors.language && (
                <p className="mt-1 text-sm text-red-400">{errors.language}</p>
              )}
            </div>

            {/* Visibility Field (Gated for PRO Users) */}
            {isPro ? (
              <div className="bg-gray-900/40 p-4 border border-gray-700 rounded-lg flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-white mb-0.5 flex items-center gap-2">
                    {isPublic ? <Globe className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-amber-400" />}
                    Snippet Visibility
                  </label>
                  <p className="text-xs text-gray-400">
                    {isPublic 
                      ? 'Anyone on the platform can view and bookmark this snippet.' 
                      : 'Only you can view and access this snippet.'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ms-3 text-sm font-semibold text-gray-300">
                    {isPublic ? 'Public' : 'Private'}
                  </span>
                </label>
              </div>
            ) : (
              <div className="bg-gray-900/40 p-4 border border-gray-700 rounded-lg flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-white mb-0.5 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-400" /> Visibility (Public Only)
                  </label>
                  <p className="text-xs text-gray-400">
                    FREE plan users can create Public snippets only. Upgrade to PRO to enable Private snippets.
                  </p>
                </div>
                <span className="px-3 py-1 bg-gray-800 border border-gray-700 text-gray-300 text-xs font-semibold rounded-full">
                  Public
                </span>
              </div>
            )}

            {/* Description Field */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <input
                id="description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-white placeholder-gray-500"
                placeholder="Brief description of the snippet"
              />
            </div>

            {/* Tags Field */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags
              </label>
              
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-700 text-white text-sm rounded-full border border-gray-650 font-medium"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => setSelectedTags(selectedTags.filter((t) => t !== tag))}
                        className="w-4 h-4 rounded-full flex items-center justify-center bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-900 transition-colors text-xs font-bold"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <input
                type="text"
                placeholder="Type to search tags, press Enter or comma to add custom tag..."
                value={tagInput}
                onChange={(e) => {
                  setTagInput(e.target.value);
                  setShowSuggestions(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    const cleanedVal = tagInput.trim().toLowerCase().replace(/,/g, '');
                    if (cleanedVal && !selectedTags.includes(cleanedVal)) {
                      setSelectedTags([...selectedTags, cleanedVal]);
                      setTagInput('');
                      setSuggestedTags([]);
                    }
                  }
                }}
                onFocus={() => setShowSuggestions(true)}
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-500"
              />
              
              {showSuggestions && tagInput.trim() && (
                <div className="absolute left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl max-h-60 overflow-y-auto z-50">
                  {suggestedTags.map((tag) => (
                    <button
                      key={tag._id}
                      type="button"
                      onClick={() => {
                        setSelectedTags([...selectedTags, tag.name]);
                        setTagInput('');
                        setSuggestedTags([]);
                        setShowSuggestions(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors flex items-center justify-between border-b border-gray-800 last:border-0 cursor-pointer"
                    >
                      <span className="font-semibold text-white">#{tag.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Code Field */}
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-2">
                Code <span className="text-red-400">*</span>
              </label>
              <textarea
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={12}
                className={`w-full px-4 py-2 bg-gray-950 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition font-mono text-sm text-gray-100 placeholder-gray-500 ${errors.code ? 'border-red-500' : 'border-gray-600'}`}
                placeholder="Paste your code snippet here..."
              />
              {errors.code && (
                <p className="mt-1 text-sm text-red-400">{errors.code}</p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer"
              >
                {isEditMode ? 'Save Changes' : 'Create Snippet'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/snippet-feed')}
                className="px-6 py-3 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors font-medium text-gray-300 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
      <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />
    </Layout>
  );
}

export default CreateSnippet;
