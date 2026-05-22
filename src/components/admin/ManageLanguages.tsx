import { useState } from 'react';
import { Layout } from '../../pages/Layout';
import { Plus, Edit, Trash2, Code2 } from 'lucide-react';

interface Language {
  id: string;
  name: string;
  icon: string;
  snippetCount: number;
  isActive: boolean;
}

const mockLanguages: Language[] = [
  { id: '1', name: 'JavaScript', icon: 'JS', snippetCount: 450, isActive: true },
  { id: '2', name: 'TypeScript', icon: 'TS', snippetCount: 320, isActive: true },
  { id: '3', name: 'Python', icon: 'PY', snippetCount: 280, isActive: true },
  { id: '4', name: 'Java', icon: 'JAVA', snippetCount: 150, isActive: true },
  { id: '5', name: 'Go', icon: 'GO', snippetCount: 120, isActive: true },
  { id: '6', name: 'Ruby', icon: 'RB', snippetCount: 85, isActive: true },
  { id: '7', name: 'C++', icon: 'C++', snippetCount: 95, isActive: true },
  { id: '8', name: 'Rust', icon: 'RS', snippetCount: 42, isActive: true },
];

export function ManageLanguages() {
  const [languages, setLanguages] = useState(mockLanguages);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLanguage, setNewLanguage] = useState({ name: '', icon: '' });

  const handleAddLanguage = () => {
    if (newLanguage.name && newLanguage.icon) {
      const language: Language = {
        id: Date.now().toString(),
        name: newLanguage.name,
        icon: newLanguage.icon,
        snippetCount: 0,
        isActive: true
      };
      setLanguages([...languages, language]);
      setNewLanguage({ name: '', icon: '' });
      setShowAddModal(false);
    }
  };

  const handleDelete = (id: string) => {
    setLanguages(languages.filter(lang => lang.id !== id));
  };

  const toggleActive = (id: string) => {
    setLanguages(languages.map(lang =>
      lang.id === id ? { ...lang, isActive: !lang.isActive } : lang
    ));
  };

  return (
    <Layout>
      <div className="p-8 bg-gray-900 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Manage Languages</h1>
              <p className="text-gray-400">Add, edit, or remove programming languages</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Language
            </button>
          </div>

          {/* Languages Table */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-900 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Language</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Icon</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Snippets</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {languages.map((language) => (
                  <tr key={language.id} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                          <Code2 className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-medium text-white">{language.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded font-mono">
                        {language.icon}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300">{language.snippetCount}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActive(language.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          language.isActive
                            ? 'bg-green-600/20 text-green-400'
                            : 'bg-gray-700 text-gray-400'
                        }`}
                      >
                        {language.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(language.id)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Language Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Add New Language</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Language Name
                </label>
                <input
                  type="text"
                  value={newLanguage.name}
                  onChange={(e) => setNewLanguage({ ...newLanguage, name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-white"
                  placeholder="e.g., Kotlin"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Icon/Code
                </label>
                <input
                  type="text"
                  value={newLanguage.icon}
                  onChange={(e) => setNewLanguage({ ...newLanguage, icon: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-white"
                  placeholder="e.g., KT"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddLanguage}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Language
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
