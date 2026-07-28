import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { Layout } from './Layout';
import { useAuth } from '../layouts/AuthContext';
import { createSnippet } from '../services/snippetService';

export function CreateSnippet() {
  // 1. Navigation hook from react-router to change pages
  const navigate = useNavigate();
  const { user } = useAuth();

  // 2. React State (useState): Managing form inputs individually
  // This is simpler for beginners than using advanced libraries like react-hook-form
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [code, setCode] = useState('');

  // 3. State to track validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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
        // Convert comma-separated string into an array of strings, trimming spaces
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        userId: activeUserId
      };

      await createSnippet(snippet);
      
      // 7. Navigate back to the home feed
      navigate('/snippet-feed');
    } catch (err) {
      console.error('Failed to create snippet:', err);
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
          <h1 className="text-3xl font-bold text-white mb-2">Create New Snippet</h1>
          <p className="text-gray-400 mb-8">Add a new code snippet to your collection</p>

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
              <input
                id="language"
                type="text"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className={`w-full px-4 py-2 bg-gray-900 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-white placeholder-gray-500 ${errors.language ? 'border-red-500' : 'border-gray-600'
                  }`}
                placeholder="e.g., JavaScript, TypeScript, Python"
              />
              {errors.language && (
                <p className="mt-1 text-sm text-red-400">{errors.language}</p>
              )}
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

            {/* Tags Field */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-2">
                Tags
              </label>
              <input
                id="tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-white placeholder-gray-500"
                placeholder="Comma-separated tags (e.g., react, hooks, state)"
              />
              <p className="mt-1 text-sm text-gray-400">Separate multiple tags with commas</p>
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
                Create Snippet
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
