import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { Layout } from './Layout';
import { useAuth } from '../layouts/AuthContext';
import { createSnippet, updateSnippet, getSnippetById, getCategories, getLanguages, getTags } from '../services/snippetService';
import toast from 'react-hot-toast';

export function CreateSnippet() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  
  const isEditMode = !!id;

  // 2. React State (useState): Managing form inputs individually
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState(''); // Keep for compatibility if any, but we use selectedTags
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [suggestedTags, setSuggestedTags] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [code, setCode] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [languagesList, setLanguagesList] = useState<any[]>([]);

  // 3. State to track validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const catList = await getCategories();
        setCategories(catList);

        const langList = await getLanguages({ active: true });
        setLanguagesList(langList);
        
        if (isEditMode && id) {
          const s = await getSnippetById(id);
          setTitle(s.title || '');
          setLanguage(s.language || '');
          setDescription(s.description || '');
          setSelectedTags(s.tags || []);
          setCode(s.code || '');
          const catId = s.category && typeof s.category === 'object' ? s.category._id : s.category;
          setSelectedCategory(catId || '');
        } else if (langList.length > 0) {
          setLanguage(langList[0].name);
        }
      } catch (err) {
        console.error("Failed to load snippet creation/edit data:", err);
      }
    };
    loadData();
  }, [id, isEditMode]);

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
    const handleClose = () => setShowSuggestions(false);
    document.addEventListener('click', handleClose);
    return () => document.removeEventListener('click', handleClose);
  }, []);

  // 4. Form Submission Handler
  const handleSubmit = async (e: React.FormEvent) => {
    // Prevent the default browser form submission (which would refresh the page)
    e.preventDefault();

    // 5. Basic Validation checks
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

    // If there are errors, update the state and stop the submission
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // 6. Data is valid! Format the snippet data
    setErrors({});
    
    try {
      const activeUserId = Number(user?.id || user?.uid || 1);
      
      const snippet = {
        title,
        language,
        description,
        code,
        tags: selectedTags,
        category: selectedCategory || undefined
      };

      if (isEditMode && id) {
        await updateSnippet(id, snippet);
        toast.success('Snippet updated successfully!');
      } else {
        await createSnippet(snippet);
        toast.success('Snippet created successfully!');
      }
      
      // 7. Navigate back to the home feed
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
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Snippets
        </button>

        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {isEditMode ? 'Edit Snippet' : 'Create New Snippet'}
          </h1>
          <p className="text-gray-400 mb-8">
            {isEditMode ? 'Modify your code snippet details' : 'Add a new code snippet to your collection'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title Field */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                Title <span className="text-red-400">*</span>
              </label>
              {/* Controlled Input: value is tied to state, onChange updates the state */}
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full px-4 py-2 bg-gray-900 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-white placeholder-gray-500 ${errors.title ? 'border-red-500' : 'border-gray-600'
                  }`}
                placeholder="e.g., React useState Hook"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-400">{errors.title}</p>
              )}
            </div>

            {/* Language Field */}
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-300 mb-2">
                Language <span className="text-red-400">*</span>
              </label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className={`w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-white ${errors.language ? 'border-red-500' : 'border-gray-600'
                  }`}
              >
                <option value="" disabled>Select a programming language</option>
                {languagesList.map((lang) => (
                  <option key={lang._id} value={lang.name}>
                    {lang.name}
                  </option>
                ))}
              </select>
              {errors.language && (
                <p className="mt-1 text-sm text-red-400">{errors.language}</p>
              )}
            </div>

            {/* Category Field */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-white"
              >
                <option value="">Select a category (Optional)</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

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

            {/* Tags Field with Autocomplete */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags
              </label>
              
              {/* Selected Tag Badges */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedTags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-700 hover:bg-gray-650 text-white text-sm rounded-full transition-colors border border-gray-650 font-medium"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))}
                        className="w-4 h-4 rounded-full flex items-center justify-center bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-900 transition-colors text-xs font-bold"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Tag Search Input */}
              <div className="relative">
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
                        if (/^[a-zA-Z0-9_-]+$/.test(cleanedVal)) {
                          setSelectedTags([...selectedTags, cleanedVal]);
                          setTagInput('');
                          setSuggestedTags([]);
                        } else {
                          toast.error("Tag can only contain alphanumeric characters, hyphens, and underscores.");
                        }
                      }
                    }
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full px-4 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-500"
                />
                
                {/* Suggestions Dropdown */}
                {showSuggestions && tagInput.trim() && (
                  <div className="absolute left-0 right-0 mt-2 bg-gray-850 border border-gray-750 rounded-lg shadow-2xl max-h-60 overflow-y-auto z-50">
                    {suggestedTags.length > 0 ? (
                      suggestedTags.map((tag) => (
                        <button
                          key={tag._id}
                          type="button"
                          onClick={() => {
                            setSelectedTags([...selectedTags, tag.name]);
                            setTagInput('');
                            setSuggestedTags([]);
                            setShowSuggestions(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-gray-750 transition-colors flex items-center justify-between border-b border-gray-800 last:border-0"
                        >
                          <span className="font-semibold text-white flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tag.color }}></span>
                            #{tag.name}
                          </span>
                          <span className="text-xs text-gray-400 font-mono">({tag.count || 0} snippets)</span>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-400 flex flex-col gap-1">
                        <span>No existing active tag matching "{tagInput}"</span>
                        <span className="text-xs text-blue-400">Press Enter/comma to create and add custom tag "{tagInput.trim().toLowerCase()}"</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-400">Press Enter/comma to add custom tags. Search dropdown retrieves matches dynamically from MongoDB tags.</p>
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
                className={`w-full px-4 py-2 bg-gray-950 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition font-mono text-sm text-gray-100 placeholder-gray-500 ${errors.code ? 'border-red-500' : 'border-gray-600'
                  }`}
                placeholder="Paste your code here..."
              />
              {errors.code && (
                <p className="mt-1 text-sm text-red-400">{errors.code}</p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {isEditMode ? 'Save Changes' : 'Create Snippet'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-6 py-3 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors font-medium text-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
