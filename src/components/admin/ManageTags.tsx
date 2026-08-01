import { useState, useEffect } from 'react';
import { Layout } from '../../pages/Layout';
import { Plus, Edit, Trash2, Tag as TagIcon, Search, X } from 'lucide-react';
import { getTags, createTag, updateTag, deleteTag } from '../../services/snippetService';
import toast from 'react-hot-toast';

interface TagItem {
  _id: string;
  name: string;
  color: string;
  isActive: boolean;
  count?: number;
}

export function ManageTags() {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTag, setSelectedTag] = useState<TagItem | null>(null);

  // Form Inputs
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [isActive, setIsActive] = useState(true);

  const loadTags = async () => {
    try {
      setLoading(true);
      const list = await getTags();
      setTags(list);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load tags');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTags();
  }, []);

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      if (!/^[a-zA-Z0-9_-]+$/.test(name.trim())) {
        toast.error('Tag name can only contain letters, numbers, hyphens, and underscores');
        return;
      }

      await createTag({ name: name.trim(), color, isActive });
      toast.success('Tag created successfully');
      setName('');
      setColor('#3B82F6');
      setIsActive(true);
      setShowAddModal(false);
      loadTags();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create tag');
    }
  };

  const handleEditTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTag || !name.trim()) return;

    try {
      if (!/^[a-zA-Z0-9_-]+$/.test(name.trim())) {
        toast.error('Tag name can only contain letters, numbers, hyphens, and underscores');
        return;
      }

      await updateTag(selectedTag._id, { name: name.trim(), color, isActive });
      toast.success('Tag updated successfully');
      setName('');
      setColor('#3B82F6');
      setIsActive(true);
      setSelectedTag(null);
      setShowEditModal(false);
      loadTags();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update tag');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this tag? It will be removed from all snippets containing it.')) {
      return;
    }

    try {
      await deleteTag(id);
      toast.success('Tag deleted successfully');
      loadTags();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete tag');
    }
  };

  const toggleActive = async (tag: TagItem) => {
    try {
      await updateTag(tag._id, { isActive: !tag.isActive });
      toast.success(`Tag ${tag.isActive ? 'disabled' : 'enabled'} successfully`);
      loadTags();
    } catch (err: any) {
      toast.error(err.message || 'Failed to toggle status');
    }
  };

  const openEditModal = (tag: TagItem) => {
    setSelectedTag(tag);
    setName(tag.name);
    setColor(tag.color);
    setIsActive(tag.isActive);
    setShowEditModal(true);
  };

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="p-8 bg-gray-900 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Manage Tags</h1>
              <p className="text-gray-400">Add, edit, or remove code snippet tags</p>
            </div>
            <button
              onClick={() => {
                setName('');
                setColor('#3B82F6');
                setIsActive(true);
                setShowAddModal(true);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-lg hover:shadow-blue-500/20 font-medium"
            >
              <Plus className="w-5 h-5" />
              Add Tag
            </button>
          </div>

          {/* Search bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tags by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Tags Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredTags.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTags.map((tag) => (
                <div
                  key={tag._id}
                  className="bg-gray-800 border border-gray-700 rounded-xl p-5 shadow-lg flex flex-col justify-between hover:border-gray-600 transition-all"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center border border-white/5"
                        style={{ backgroundColor: `${tag.color}15` }}
                      >
                        <TagIcon className="w-5 h-5" style={{ color: tag.color }} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">#{tag.name}</h3>
                        <p className="text-sm text-gray-400">{tag.count || 0} snippets</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleActive(tag)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                        tag.isActive
                          ? 'bg-green-600/10 text-green-400 border-green-500/20 hover:bg-green-600/20'
                          : 'bg-gray-700/20 text-gray-400 border-gray-600/20 hover:bg-gray-700/40'
                      }`}
                    >
                      {tag.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-700/50">
                    <button
                      onClick={() => openEditModal(tag)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(tag._id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 text-red-400 hover:text-red-300 hover:bg-red-950/20 border border-gray-700 hover:border-red-900/50 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-12 text-center shadow-xl">
              <TagIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-1">No tags found</h3>
              <p className="text-gray-400 mb-6">Create a tag or search for a different name.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Tag Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
              <h3 className="text-lg font-bold text-white">Add New Tag</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddTag} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tag Name</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500 font-bold">#</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. react-hooks"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400">Only letters, numbers, hyphens, and underscores are allowed.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-14 h-10 bg-gray-900 border border-gray-600 rounded-lg cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    required
                    pattern="^#[0-9A-Fa-f]{6}$"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="tagIsActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-600 bg-gray-900"
                />
                <label htmlFor="tagIsActive" className="text-sm text-gray-300 font-medium select-none cursor-pointer">
                  Enable Tag by Default
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
                  Create Tag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Tag Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
              <h3 className="text-lg font-bold text-white">Edit Tag</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditTag} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tag Name</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500 font-bold">#</span>
                  <input
                    type="text"
                    required
                    placeholder="Tag Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400">Only letters, numbers, hyphens, and underscores are allowed.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-14 h-10 bg-gray-900 border border-gray-600 rounded-lg cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    required
                    pattern="^#[0-9A-Fa-f]{6}$"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="editTagIsActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-600 bg-gray-900"
                />
                <label htmlFor="editTagIsActive" className="text-sm text-gray-300 font-medium select-none cursor-pointer">
                  Active (users can select this tag)
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
    </Layout>
  );
}
