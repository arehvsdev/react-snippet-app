import { useState } from 'react';
import { Layout } from '../../pages/Layout';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';

interface TagItem {
  id: string;
  name: string;
  color: string;
  snippetCount: number;
  isActive: boolean;
}

const mockTags: TagItem[] = [
  { id: '1', name: 'react', color: '#3B82F6', snippetCount: 234, isActive: true },
  { id: '2', name: 'hooks', color: '#10B981', snippetCount: 187, isActive: true },
  { id: '3', name: 'api', color: '#F59E0B', snippetCount: 156, isActive: true },
  { id: '4', name: 'database', color: '#EF4444', snippetCount: 142, isActive: true },
  { id: '5', name: 'authentication', color: '#8B5CF6', snippetCount: 98, isActive: true },
  { id: '6', name: 'performance', color: '#EC4899', snippetCount: 76, isActive: true },
  { id: '7', name: 'utils', color: '#14B8A6', snippetCount: 125, isActive: true },
  { id: '8', name: 'testing', color: '#F97316', snippetCount: 54, isActive: true },
];

export function ManageTags() {
  const [tags, setTags] = useState(mockTags);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTag, setNewTag] = useState({ name: '', color: '#3B82F6' });

  const handleAddTag = () => {
    if (newTag.name) {
      const tag: TagItem = {
        id: Date.now().toString(),
        name: newTag.name.toLowerCase(),
        color: newTag.color,
        snippetCount: 0,
        isActive: true
      };
      setTags([...tags, tag]);
      setNewTag({ name: '', color: '#3B82F6' });
      setShowAddModal(false);
    }
  };

  const handleDelete = (id: string) => {
    setTags(tags.filter(tag => tag.id !== id));
  };

  const toggleActive = (id: string) => {
    setTags(tags.map(tag =>
      tag.id === id ? { ...tag, isActive: !tag.isActive } : tag
    ));
  };

  return (
    <Layout>
      <div className="p-8 bg-gray-900 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Manage Tags</h1>
              <p className="text-gray-400">Create and organize snippet tags</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Tag
            </button>
          </div>

          {/* Tags Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${tag.color}20` }}
                    >
                      <Tag className="w-5 h-5" style={{ color: tag.color }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">#{tag.name}</h3>
                      <p className="text-sm text-gray-400">{tag.snippetCount} snippets</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleActive(tag.id)}
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      tag.isActive
                        ? 'bg-green-600/20 text-green-400'
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {tag.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded-lg transition-colors text-sm">
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(tag.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-700 text-red-400 hover:bg-gray-600 rounded-lg transition-colors text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Tag Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Add New Tag</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tag Name
                </label>
                <input
                  type="text"
                  value={newTag.name}
                  onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-white"
                  placeholder="e.g., authentication"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={newTag.color}
                    onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                    className="w-16 h-10 bg-gray-900 border border-gray-600 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newTag.color}
                    onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                    className="flex-1 px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-white font-mono"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddTag}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Tag
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
