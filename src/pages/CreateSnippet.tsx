import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Crown,
  ShieldCheck,
  Lock,
  Globe,
  Check,
  Code,
  FileText,
  CheckCircle2,
  Copy,
  Edit3,
  Plus
} from 'lucide-react';
import { Layout } from './Layout';
import { useAuth } from '../layouts/AuthContext';
import { ProBadge } from '../components/subscription/ProBadge';
import { PlanBadge } from '../components/subscription/PlanBadge';
import { UpgradeModal } from '../components/subscription/UpgradeModal';
import {
  createSnippet,
  updateSnippet,
  getSnippetById,
  getSnippets,
  getLanguages,
  getTags,
  getMySnippetStats
} from '../services/snippetService';
import toast from 'react-hot-toast';

/**
 * 3-Step Wizard for Creating and Editing Code Snippets:
 * Step 1: Title, Code & Visibility
 * Step 2: Language, Tags & Description
 * Step 3: Review & Publish
 */
export function CreateSnippet() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  
  // Feature gating flag
  const isPro = user?.plan === 'PRO';
  const isEditMode = !!id;

  // Wizard Step State (1, 2, or 3)
  const [currentStep, setCurrentStep] = useState<number>(1);

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
  const [copiedCode, setCopiedCode] = useState(false);

  // Validation error states
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Load language list & snippet details if in edit mode
  useEffect(() => {
    const loadData = async () => {
      try {
        const langList = await getLanguages({ active: true });
        setLanguagesList(langList);

        // Track snippet count accurately via getMySnippetStats
        if (user) {
          try {
            const stats = await getMySnippetStats();
            setUserSnippetCount(stats.total || (stats.public + stats.private) || 0);
          } catch (err) {
            const userId = user.id || user.uid || (user as any)._id;
            if (userId) {
              const userSnippets = await getSnippets({ userId });
              setUserSnippetCount(userSnippets.length);
            }
          }
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
        console.error('Failed to load snippet data:', err);
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
          (t: any) => !selectedTags.includes(t.name.toLowerCase())
        );
        setSuggestedTags(filteredMatches);
      } catch (err) {
        console.error('Failed to load tag suggestions:', err);
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

  const isLimitReached = !isPro && !isEditMode && userSnippetCount >= 3;

  // Step Validation Helpers
  const validateStep1 = () => {
    const newErrors: { [key: string]: string } = {};
    if (!title || title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }
    if (!code || code.trim().length < 10) {
      newErrors.code = 'Code must be at least 10 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: { [key: string]: string } = {};
    if (!language) {
      newErrors.language = 'Language is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (isLimitReached) {
      toast.error('Free tier snippet limit reached (3/3). Upgrade to PRO to create more.');
      setIsUpgradeModalOpen(true);
      return;
    }
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (currentStep === 2) {
      if (validateStep2()) {
        setCurrentStep(3);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Keyboard navigation (Ctrl/Cmd + ArrowRight / ArrowLeft)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLimitReached) return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextStep();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevStep();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, code, title, language, isLimitReached]);

  const handleStepClick = (targetStep: number) => {
    if (isLimitReached) {
      toast.error('Free tier snippet limit reached (3/3). Upgrade to PRO to create more.');
      setIsUpgradeModalOpen(true);
      return;
    }
    if (targetStep < currentStep) {
      setCurrentStep(targetStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (targetStep === 2 && currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (targetStep === 3) {
      if (validateStep1() && validateStep2()) {
        setCurrentStep(3);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  // Form submission handler
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (isLimitReached) {
      toast.error('Free tier snippet limit reached (3/3). Upgrade to PRO for unlimited snippets.');
      setIsUpgradeModalOpen(true);
      return;
    }

    const isStep1Valid = validateStep1();
    const isStep2Valid = validateStep2();

    if (!isStep1Valid) {
      setCurrentStep(1);
      return;
    }
    if (!isStep2Valid) {
      setCurrentStep(2);
      return;
    }

    setErrors({});
    
    try {
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const steps = [
    { number: 1, title: 'Title & Code', icon: Code, subtitle: 'Title, code & access' },
    { number: 2, title: 'Language & Tags', icon: FileText, subtitle: 'Language, tags & summary' },
    { number: 3, title: 'Review & Publish', icon: CheckCircle2, subtitle: 'Verify & save' }
  ];

  const filteredLanguages = languagesList.filter((lang) =>
    lang.name.toLowerCase().includes(langSearchInput.toLowerCase())
  );
  const hasExactLanguageMatch = languagesList.some(
    (lang) => lang.name.toLowerCase() === langSearchInput.trim().toLowerCase()
  );

  const cleanedTagInput = tagInput.trim().toLowerCase().replace(/^#/, '');
  const hasExactTagMatch = suggestedTags.some(
    (t) => t.name.toLowerCase() === cleanedTagInput
  );

  return (
    <Layout>
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-32">

        {/* ── Top Navigation & Page Title Bar ── */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => navigate('/snippet-feed')}
              className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors cursor-pointer text-sm font-medium shrink-0 min-h-[44px] px-2 rounded-lg hover:bg-gray-800"
              aria-label="Back to snippets"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div className="w-px h-5 bg-gray-700 shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">
                {isEditMode ? 'Edit Snippet' : 'Create New Snippet'}
              </h1>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            {isPro ? <ProBadge size="sm" /> : <PlanBadge plan="FREE" size="sm" />}
          </div>
        </div>

        {/* ── LOCKED SCREEN WHEN FREE LIMIT (3/3) IS REACHED ── */}
        {isLimitReached ? (
          <div className="bg-gray-800/90 border border-amber-500/30 rounded-2xl p-6 sm:p-10 shadow-2xl text-center max-w-2xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-amber-500/20 to-yellow-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400 shadow-inner">
              <Lock className="w-8 h-8 sm:w-10 sm:h-10 stroke-[2.2]" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" /> Limit Reached (3 / 3 Snippets)
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Free Tier Snippet Limit Reached
              </h2>
              <p className="text-gray-300 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
                You have created <strong className="text-white">3 of 3</strong> public snippets on your Free account. Upgrade to <strong className="text-amber-300 font-bold">PRO</strong> to unlock unlimited snippet creation and private cloud storage.
              </p>
            </div>

            {/* Limit Progress Bar Card */}
            <div className="bg-gray-900/80 p-4 rounded-xl border border-gray-700/80 max-w-md mx-auto space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-gray-400">Storage Usage</span>
                <span className="text-amber-400">3 of 3 Snippets Used (100%)</span>
              </div>
              <div className="w-full h-2.5 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-400 rounded-full w-full" />
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsUpgradeModalOpen(true)}
                className="w-full sm:w-auto px-7 py-3 rounded-xl font-bold text-gray-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 hover:from-amber-300 hover:to-yellow-400 shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer text-sm flex items-center justify-center gap-2 min-h-[46px]"
              >
                <Sparkles className="w-4 h-4 fill-current" />
                <span>Upgrade to PRO Now</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-gray-300 hover:text-white border border-gray-700 hover:border-gray-500 bg-gray-900/60 transition-all cursor-pointer text-sm flex items-center justify-center gap-2 min-h-[46px]"
              >
                <span>Manage My Snippets</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* ── Slim Free Plan Banner ── */}
            {!isPro ? (
              <div className="mb-6 py-2.5 px-4 rounded-xl bg-blue-500/[0.07] border border-blue-500/20 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1.5 rounded-lg bg-blue-500/15 text-blue-400 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-semibold text-white text-xs">Free Tier: </span>
                    <span className="text-gray-400 text-xs">
                      {userSnippetCount}/3 snippets used.{' '}
                      <strong className="text-amber-400">Upgrade to PRO for unlimited snippets &amp; private storage</strong>.
                    </span>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-3 shrink-0">
                  <div className="w-24 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((userSnippetCount / 3) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">{userSnippetCount}/3</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsUpgradeModalOpen(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-gray-950 bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-400 text-xs shadow-sm shrink-0 cursor-pointer transition-all active:scale-95 min-h-[32px]"
                >
                  <Sparkles className="w-3 h-3 fill-current" /> Upgrade
                </button>
              </div>
            ) : (
              <div className="mb-6 py-2.5 px-4 rounded-xl bg-amber-500/[0.07] border border-amber-500/20 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400 shrink-0">
                    <Crown className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <span className="font-bold text-amber-300 text-xs">PRO Active: </span>
                    <span className="text-gray-400 text-xs">Unlimited public &amp; private code snippets enabled.</span>
                  </div>
                </div>
                <ProBadge size="xs" />
              </div>
            )}

            {/* ── STEPPER HEADER ── */}
            <div className="bg-gray-800/80 rounded-2xl border border-gray-700/80 p-4 sm:p-5 mb-6 shadow-lg">
              <div className="grid grid-cols-3 gap-2 sm:gap-4 relative">
                {steps.map((step) => {
                  const isCompleted = step.number < currentStep || (step.number === 1 && title.length >= 3 && code.length >= 10 && currentStep > 1) || (step.number === 2 && language.length > 0 && currentStep > 2);
                  const isCurrent = step.number === currentStep;

                  return (
                    <button
                      key={step.number}
                      type="button"
                      onClick={() => handleStepClick(step.number)}
                      className={`flex flex-col sm:flex-row items-center sm:items-center gap-2.5 p-3 rounded-xl transition-all duration-200 text-left text-xs sm:text-sm cursor-pointer select-none ${
                        isCurrent
                          ? 'bg-blue-600/15 border border-blue-500/40 text-white shadow-md ring-1 ring-blue-500/20'
                          : isCompleted
                          ? 'bg-gray-900/40 border border-emerald-500/20 text-gray-300 hover:bg-gray-700/50'
                          : 'bg-gray-900/20 border border-gray-700/40 text-gray-400 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-transform duration-200 ${
                          isCurrent
                            ? 'bg-blue-600 text-white ring-4 ring-blue-500/20 scale-105'
                            : isCompleted
                            ? 'bg-emerald-500 text-gray-950 font-extrabold'
                            : 'bg-gray-700 text-gray-400'
                        }`}
                      >
                        {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.number}
                      </div>
                      <div className="min-w-0 text-center sm:text-left">
                        <div className="font-semibold text-xs sm:text-sm text-white truncate">
                          {step.title}
                        </div>
                        <p className="text-[11px] text-gray-400 truncate hidden sm:block mt-0.5">
                          {step.subtitle}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Progress Bar under Stepper */}
              <div className="w-full bg-gray-700/50 h-1.5 rounded-full mt-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 h-full transition-all duration-300 ease-out rounded-full"
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                />
              </div>
            </div>

            {/* ── STEP CONTENT AREA ── */}
            <div className="bg-gray-800/60 rounded-2xl border border-gray-700/80 shadow-xl overflow-hidden mb-6">

              {/* STEP 1: TITLE, CODE & VISIBILITY */}
              {currentStep === 1 && (
                <div className="p-5 sm:p-7 space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-gray-700/60 pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Code className="w-5 h-5 text-blue-400" />
                        Step 1: Title, Code &amp; Visibility
                      </h2>
                      <p className="text-xs text-gray-400 mt-1">
                        Provide a title, write your source code, and set visibility access.
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      Step 1 of 3
                    </span>
                  </div>

                  {/* Title Field (Moved into Step 1) */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-200 mb-1.5">
                      Snippet Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        if (errors.title) setErrors({ ...errors, title: '' });
                      }}
                      className={`w-full px-4 py-2.5 bg-gray-950 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-white placeholder-gray-600 text-sm ${
                        errors.title ? 'border-red-500' : 'border-gray-700'
                      }`}
                      placeholder="e.g., Express JWT Authentication Middleware"
                    />
                    {errors.title && <p className="mt-1 text-xs text-red-400 font-medium">⚠ {errors.title}</p>}
                  </div>

                  {/* Visibility Selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Snippet Visibility <span className="text-red-400">*</span>
                    </label>
                    {isPro ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setIsPublic(true)}
                          className={`p-4 rounded-xl border flex items-start gap-3 text-left transition-all cursor-pointer ${
                            isPublic
                              ? 'bg-blue-600/15 border-blue-500 text-white ring-1 ring-blue-500/30'
                              : 'bg-gray-900/50 border-gray-700 text-gray-400 hover:bg-gray-700/40'
                          }`}
                        >
                          <Globe className={`w-5 h-5 mt-0.5 shrink-0 ${isPublic ? 'text-emerald-400' : 'text-gray-500'}`} />
                          <div>
                            <div className="font-semibold text-sm text-white">Public Snippet</div>
                            <p className="text-xs text-gray-400 mt-0.5">
                              Anyone on SnipForge can view, search, and bookmark this snippet.
                            </p>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsPublic(false)}
                          className={`p-4 rounded-xl border flex items-start gap-3 text-left transition-all cursor-pointer ${
                            !isPublic
                              ? 'bg-amber-500/15 border-amber-500 text-white ring-1 ring-amber-500/30'
                              : 'bg-gray-900/50 border-gray-700 text-gray-400 hover:bg-gray-700/40'
                          }`}
                        >
                          <Lock className={`w-5 h-5 mt-0.5 shrink-0 ${!isPublic ? 'text-amber-400' : 'text-gray-500'}`} />
                          <div>
                            <div className="font-semibold text-sm text-white flex items-center gap-1.5">
                              Private Snippet <ProBadge size="xs" />
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">
                              Only you can view and access this snippet. Encrypted storage.
                            </p>
                          </div>
                        </button>
                      </div>
                    ) : (
                      <div className="bg-gray-900/60 p-4 border border-gray-700 rounded-xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Globe className="w-5 h-5 text-emerald-400 shrink-0" />
                          <div>
                            <div className="font-semibold text-sm text-white">Public Snippet</div>
                            <p className="text-xs text-gray-400 mt-0.5">
                              FREE tier accounts create Public snippets. Upgrade to PRO to create Private snippets.
                            </p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-gray-800 border border-gray-700 text-gray-400 text-xs font-semibold rounded-full shrink-0">
                          Public Only
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Source Code Editor */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="code" className="block text-sm font-medium text-gray-200">
                        Source Code <span className="text-red-400">*</span>
                      </label>
                      <span className="text-xs text-gray-400 font-mono">
                        {code.length} chars {code.length >= 10 ? '✓' : '(min 10 required)'}
                      </span>
                    </div>
                    <textarea
                      id="code"
                      value={code}
                      onChange={(e) => {
                        setCode(e.target.value);
                        if (errors.code) setErrors({ ...errors, code: '' });
                      }}
                      rows={14}
                      spellCheck={false}
                      className={`w-full px-5 py-4 bg-gray-950 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono text-sm text-gray-100 placeholder-gray-600 resize-y overflow-x-auto whitespace-pre leading-relaxed min-h-[350px] ${
                        errors.code ? 'border-red-500 ring-1 ring-red-500/50' : 'border-gray-700'
                      }`}
                      placeholder="// Paste or write your source code here...\n// Minimum 10 characters required.\n\nfunction example() {\n  console.log('Hello, SnipForge!');\n}"
                    />
                    {errors.code && (
                      <p className="mt-2 text-xs text-red-400 font-medium flex items-center gap-1">
                        ⚠ {errors.code}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 2: LANGUAGE & TAGS */}
              {currentStep === 2 && (
                <div className="p-5 sm:p-7 space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-gray-700/60 pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-400" />
                        Step 2: Language, Tags &amp; Description
                      </h2>
                      <p className="text-xs text-gray-400 mt-1">
                        Select the programming language and add tags for categorization.
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      Step 2 of 3
                    </span>
                  </div>

                  <div className="space-y-5">
                    {/* Title Summary from Step 1 */}
                    <div className="bg-gray-900/60 p-4 border border-gray-700 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-xs text-gray-400 block">Selected Title (Step 1)</span>
                        <span className="text-sm font-semibold text-white">{title || '(No title entered)'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="text-xs text-blue-400 hover:text-blue-300 font-medium underline flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" /> Edit in Step 1
                      </button>
                    </div>

                    {/* Language Combobox */}
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      <label htmlFor="language" className="block text-sm font-medium text-gray-300 mb-1.5">
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
                          if (errors.language) setErrors({ ...errors, language: '' });
                        }}
                        onFocus={() => setShowLangSuggestions(true)}
                        className={`w-full px-4 py-2.5 bg-gray-900 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-white placeholder-gray-600 text-sm ${
                          errors.language ? 'border-red-500' : 'border-gray-700'
                        }`}
                      />
                      {showLangSuggestions && (
                        <div className="absolute left-0 right-0 mt-1.5 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl max-h-56 overflow-y-auto z-50">
                          {filteredLanguages.map((lang) => (
                            <button
                              key={lang._id}
                              type="button"
                              onClick={() => {
                                setLanguage(lang.name);
                                setLangSearchInput(lang.name);
                                setShowLangSuggestions(false);
                                if (errors.language) setErrors({ ...errors, language: '' });
                              }}
                              className="w-full text-left px-4 py-2.5 hover:bg-gray-700/80 transition-colors text-white text-sm border-b border-gray-700/50 last:border-0 cursor-pointer flex items-center justify-between"
                            >
                              <span>{lang.name}</span>
                              {lang.icon && (
                                <span className="text-[10px] font-mono text-gray-400 bg-gray-900 px-1.5 py-0.5 rounded border border-gray-700">
                                  {lang.icon}
                                </span>
                              )}
                            </button>
                          ))}
                          {langSearchInput.trim() && !hasExactLanguageMatch && (
                            <button
                              type="button"
                              onClick={() => {
                                setLanguage(langSearchInput.trim());
                                setLangSearchInput(langSearchInput.trim());
                                setShowLangSuggestions(false);
                                if (errors.language) setErrors({ ...errors, language: '' });
                              }}
                              className="w-full text-left px-4 py-2.5 bg-blue-600/15 hover:bg-blue-600/30 text-blue-400 text-sm font-medium border-t border-gray-700/60 cursor-pointer flex items-center gap-2"
                            >
                              <Plus className="w-4 h-4 text-blue-400 shrink-0" />
                              <span>Add custom language: <strong className="text-white">"{langSearchInput.trim()}"</strong></span>
                            </button>
                          )}
                        </div>
                      )}
                      {errors.language && <p className="mt-1 text-xs text-red-400">{errors.language}</p>}
                    </div>

                    {/* Tags Input */}
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">
                        Tags <span className="text-xs text-gray-500 font-normal">(Press Enter or comma to add)</span>
                      </label>
                      {selectedTags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2.5">
                          {selectedTags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600/15 text-blue-300 text-xs rounded-full border border-blue-500/30 font-medium"
                            >
                              #{tag}
                              <button
                                type="button"
                                onClick={() => setSelectedTags(selectedTags.filter((t) => t !== tag))}
                                className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-blue-400 hover:text-white hover:bg-blue-600/50 transition-colors font-bold"
                                aria-label={`Remove tag ${tag}`}
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      <input
                        type="text"
                        placeholder="Type to search existing tags or add custom tags..."
                        value={tagInput}
                        onChange={(e) => {
                          setTagInput(e.target.value);
                          setShowSuggestions(true);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ',') {
                            e.preventDefault();
                            if (cleanedTagInput && !selectedTags.includes(cleanedTagInput)) {
                              setSelectedTags([...selectedTags, cleanedTagInput]);
                              setTagInput('');
                              setSuggestedTags([]);
                            }
                          }
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-600 text-sm"
                      />
                      {showSuggestions && cleanedTagInput && (
                        <div className="absolute left-0 right-0 mt-1.5 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl max-h-52 overflow-y-auto z-50">
                          {suggestedTags.map((tag) => (
                            <button
                              key={tag._id}
                              type="button"
                              onClick={() => {
                                const tagName = tag.name.toLowerCase();
                                if (!selectedTags.includes(tagName)) {
                                  setSelectedTags([...selectedTags, tagName]);
                                }
                                setTagInput('');
                                setSuggestedTags([]);
                                setShowSuggestions(false);
                              }}
                              className="w-full text-left px-4 py-2.5 hover:bg-gray-700/80 transition-colors border-b border-gray-700/50 last:border-0 cursor-pointer text-sm flex items-center justify-between"
                            >
                              <span className="font-semibold text-white">#{tag.name}</span>
                              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Existing Tag</span>
                            </button>
                          ))}
                          {!hasExactTagMatch && !selectedTags.includes(cleanedTagInput) && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTags([...selectedTags, cleanedTagInput]);
                                setTagInput('');
                                setSuggestedTags([]);
                                setShowSuggestions(false);
                              }}
                              className="w-full text-left px-4 py-2.5 bg-blue-600/15 hover:bg-blue-600/30 text-blue-400 text-sm font-medium border-t border-gray-700/60 cursor-pointer flex items-center gap-2"
                            >
                              <Plus className="w-4 h-4 text-blue-400 shrink-0" />
                              <span>Add new tag: <strong className="text-white">#{cleanedTagInput}</strong></span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Description (Full Width) */}
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1.5">
                        Description <span className="text-xs text-gray-500 font-normal">(Optional)</span>
                      </label>
                      <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-white placeholder-gray-600 text-sm resize-y"
                        placeholder="Brief explanation of what this snippet does and how to use it..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: REVIEW & PUBLISH */}
              {currentStep === 3 && (
                <div className="p-5 sm:p-7 space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-gray-700/60 pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        Step 3: Review &amp; {isEditMode ? 'Save Changes' : 'Publish'}
                      </h2>
                      <p className="text-xs text-gray-400 mt-1">
                        Review all details below before final submission.
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Final Step
                    </span>
                  </div>

                  {/* Review Card 1: Snippet Metadata Summary */}
                  <div className="bg-gray-900/70 border border-gray-700 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Snippet Summary
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" /> Edit Title &amp; Code
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-xs text-gray-500 block">Title</span>
                        <span className="font-semibold text-white truncate block">{title || '(No title)'}</span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 block">Language</span>
                        <span className="font-semibold text-blue-400 uppercase text-xs inline-block mt-0.5 px-2 py-0.5 bg-blue-500/10 rounded-md border border-blue-500/20">
                          {language || '(Not set)'}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 block">Visibility</span>
                        <span className="font-semibold text-white flex items-center gap-1 mt-0.5">
                          {isPublic ? (
                            <>
                              <Globe className="w-3.5 h-3.5 text-emerald-400" /> Public
                            </>
                          ) : (
                            <>
                              <Lock className="w-3.5 h-3.5 text-amber-400" /> Private (PRO)
                            </>
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 block">Tags</span>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {selectedTags.length > 0 ? (
                            selectedTags.map((tag) => (
                              <span key={tag} className="text-[11px] text-blue-300 bg-blue-600/15 px-2 py-0.5 rounded-full border border-blue-500/30">
                                #{tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-600">None</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {description && (
                      <div className="pt-2 border-t border-gray-800/80">
                        <span className="text-xs text-gray-500 block mb-1">Description</span>
                        <p className="text-xs text-gray-300 bg-gray-950/40 p-3 rounded-lg border border-gray-800">
                          {description}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Review Card 2: Readonly Code Preview */}
                  <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden">
                    <div className="bg-gray-900/90 px-4 py-2.5 border-b border-gray-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Code className="w-4 h-4 text-blue-400" />
                        <span className="text-xs font-mono font-medium text-gray-300">Code Preview</span>
                        <span className="text-[10px] text-gray-500 font-mono">({code.split('\n').length} lines)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={copyToClipboard}
                          className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(1)}
                          className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" /> Edit Code
                        </button>
                      </div>
                    </div>
                    <pre className="p-4 text-xs font-mono text-gray-100 overflow-x-auto max-h-80 leading-relaxed whitespace-pre">
                      {code}
                    </pre>
                  </div>
                </div>
              )}

            </div>

            {/* STICKY BOTTOM NAVIGATION BAR */}
            <div className="fixed bottom-0 left-0 right-0 z-30 bg-gray-900/95 backdrop-blur-md border-t border-gray-700/80 shadow-2xl shadow-black/60 pr-16 sm:pr-24">
              <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
                {/* Left: Previous Button or Cancel */}
                <div className="flex items-center gap-2">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="px-4 py-2 text-sm text-gray-300 hover:text-white border border-gray-700 hover:border-gray-500 rounded-xl font-medium cursor-pointer transition-all flex items-center gap-1.5 min-h-[44px] bg-gray-800/80"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => navigate('/snippet-feed')}
                      className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 rounded-xl font-medium cursor-pointer transition-all min-h-[44px]"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {/* Right: Next Step or Publish/Save Button */}
                <div className="flex items-center gap-3">
                  {currentStep < 3 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm transition-all cursor-pointer active:scale-95 shadow-md shadow-blue-600/25 flex items-center gap-2 min-h-[44px]"
                    >
                      <span>Next Step</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSubmit()}
                      className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm transition-all cursor-pointer active:scale-95 shadow-md shadow-emerald-600/30 flex items-center gap-2 min-h-[44px]"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>{isEditMode ? 'Save Changes' : 'Publish Snippet'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />
      </div>
    </Layout>
);
}

export default CreateSnippet;
