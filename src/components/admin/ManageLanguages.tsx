import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../../pages/Layout';
import { Plus, Edit, Trash2, Code2, Search, X, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { getLanguages, createLanguage, updateLanguage, deleteLanguage } from '../../services/snippetService';
import toast from 'react-hot-toast';
import { ConfirmModal } from '../common/ConfirmModal';

interface LanguageItem {
  _id: string;
  name: string;
  icon: string;
  isActive: boolean;
  count?: number;
}

export function ManageLanguages() {
  const [languages, setLanguages] = useState<LanguageItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageItem | null>(null);
  const [languageToDelete, setLanguageToDelete] = useState<LanguageItem | null>(null);

  // Form inputs
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [isActive, setIsActive] = useState(true);

  const loadLanguages = async () => {
    try {
      setLoading(true);
      const list = await getLanguages();
      setLanguages(list);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load languages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLanguages();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleAddLanguage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !icon.trim()) return;

    try {
      await createLanguage({ name, icon, active: isActive });
      toast.success('Language created successfully');
      setName('');
      setIcon('');
      setIsActive(true);
      setShowAddModal(false);
      loadLanguages();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create language');
    }
  };

  const handleEditLanguage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLanguage || !name.trim() || !icon.trim()) return;

    try {
      await updateLanguage(selectedLanguage._id, { name, icon, active: isActive });
      toast.success('Language updated successfully');
      setName('');
      setIcon('');
      setIsActive(true);
      setSelectedLanguage(null);
      setShowEditModal(false);
      loadLanguages();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update language');
    }
  };

  const confirmDeleteLanguage = async () => {
    if (!languageToDelete) return;

    try {
      await deleteLanguage(languageToDelete._id);
      toast.success('Language deleted successfully');
      setLanguageToDelete(null);
      loadLanguages();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete language');
    }
  };

  const toggleActive = async (lang: LanguageItem) => {
    try {
      await updateLanguage(lang._id, { active: !lang.isActive });
      toast.success(`Language ${lang.isActive ? 'disabled' : 'enabled'} successfully`);
      loadLanguages();
    } catch (err: any) {
      toast.error(err.message || 'Failed to toggle status');
    }
  };

  const openEditModal = (lang: LanguageItem) => {
    setSelectedLanguage(lang);
    setName(lang.name);
    setIcon(lang.icon);
    setIsActive(lang.isActive);
    setShowEditModal(true);
  };

  const filteredLanguages = languages.filter(lang =>
    lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.icon.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredLanguages.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLanguages = filteredLanguages.slice(startIndex, startIndex + itemsPerPage);

  return (
    <Layout>
      <div className="p-6 md:p-8 bg-gray-900 min-h-screen w-full">
        <div className="w-full mx-auto">
          {/* Header with Back to Admin Dashboard Navigation Button */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <Link
                to="/admin/dashboard"
                className="p-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl border border-gray-700 transition-all flex items-center gap-2 text-sm font-medium shrink-0 cursor-pointer"
                title="Back to Admin Dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Manage Languages</h1>
                <p className="text-gray-400 text-sm">Add, edit, or remove programming languages</p>
              </div>
            </div>
            <button
              onClick={() => {
                setName('');
                setIcon('');
                setIsActive(true);
                setShowAddModal(true);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-lg hover:shadow-blue-500/20 font-medium cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              Add Language
            </button>
          </div>

          {/* Search bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search languages by name or icon code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Table Layout */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredLanguages.length > 0 ? (
            <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-xl">
              <table className="w-full">
                <thead className="bg-gray-900 border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Language</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Icon / Code</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Snippets</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLanguages.map((language) => (
                    <tr key={language._id} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600/10 rounded-lg flex items-center justify-center border border-blue-500/20">
                            <Code2 className="w-5 h-5 text-blue-400" />
                          </div>
                          <span className="font-semibold text-white">{language.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-md font-mono font-bold">
                          {language.icon}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-300 font-semibold">
                        {language.count ?? 0}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleActive(language)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                            language.isActive
                              ? 'bg-green-600/10 text-green-400 border-green-500/20 hover:bg-green-600/20'
                              : 'bg-gray-700/20 text-gray-400 border-gray-600/20 hover:bg-gray-700/40'
                          }`}
                        >
                          {language.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(language)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors border border-gray-700 hover:border-gray-600 cursor-pointer"
                            title="Edit Language"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setLanguageToDelete(language)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-colors border border-gray-700 hover:border-red-900/50 cursor-pointer"
                            title="Delete Language"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination Controls */}
              {filteredLanguages.length > 0 && (
                <div className="px-6 py-4 bg-gray-900 border-t border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs text-gray-400">
                    Showing <span className="font-semibold text-white">{startIndex + 1}</span> to{' '}
                    <span className="font-semibold text-white">
                      {Math.min(startIndex + itemsPerPage, filteredLanguages.length)}
                    </span>{' '}
                    of <span className="font-semibold text-white">{filteredLanguages.length}</span> languages
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                      title="Previous Page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-1 px-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                        <button
                          key={p}
                          onClick={() => setCurrentPage(p)}
                          className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            currentPage === p
                              ? 'bg-blue-600 text-white font-bold'
                              : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                      title="Next Page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-12 text-center shadow-xl">
              <Code2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-1">No languages found</h3>
              <p className="text-gray-400 mb-6">Create a language or search for a different name.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Language Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
              <h3 className="text-lg font-bold text-white">Add New Language</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddLanguage} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Language Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. JavaScript"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Icon / Abbreviation</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. JS"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-600 bg-gray-900"
                />
                <label htmlFor="isActive" className="text-sm text-gray-300 font-medium select-none cursor-pointer">
                  Enable Language by Default
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-650 text-white rounded-lg transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm"
                >
                  Create Language
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Language Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
              <h3 className="text-lg font-bold text-white">Edit Language</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditLanguage} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Language Name</label>
                <input
                  type="text"
                  required
                  placeholder="Language Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Icon / Abbreviation</label>
                <input
                  type="text"
                  required
                  placeholder="Icon/Code"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-600 bg-gray-900"
                />
                <label htmlFor="editIsActive" className="text-sm text-gray-300 font-medium select-none cursor-pointer">
                  Active (users can select this language)
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-650 text-white rounded-lg transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(languageToDelete)}
        title="Delete Language"
        message={`Are you sure you want to delete "${languageToDelete?.name}"? This will remove language classification from all snippets using it.`}
        confirmText="Delete Language"
        onConfirm={confirmDeleteLanguage}
        onCancel={() => setLanguageToDelete(null)}
      />
    </Layout>
  );
}
