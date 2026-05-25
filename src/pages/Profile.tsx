import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { User as UserIcon, Settings, LogOut, Lock, Globe, Bookmark, ArrowLeft } from 'lucide-react';
import { CodeSnippet } from './CodeSnippet';
import { Layout } from './Layout';
import { useAuth } from '../layouts/AuthContext';
import { getDB, saveDB } from '../services/dbService';
import toast from 'react-hot-toast';

export function Profile() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'my-snippets' | 'bookmarks'>('my-snippets');
  const [currentUserData, setCurrentUserData] = useState<any>(null);
  const [userSnippets, setUserSnippets] = useState<any[]>([]);
  const [bookmarkedSnippets, setBookmarkedSnippets] = useState<any[]>([]);

  // Edit Profile States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editPhoneNumber, setEditPhoneNumber] = useState('');

  const handleOpenEditModal = () => {
    const db = getDB();
    const currentUserId = Number(user?.id || user?.uid || 1);
    const foundUser = db.users.find(u => Number(u.id) === currentUserId);
    
    setEditFullName(foundUser?.fullName || user?.fullName || '');
    setEditUsername(foundUser?.username || foundUser?.fullName.toLowerCase().replace(/\s+/g, '') || '');
    setEditBio(foundUser?.bio || 'Full-stack developer passionate about clean code and open source');
    setEditAvatar(foundUser?.avatar || '');
    setEditPhoneNumber(foundUser?.phoneNumber || user?.phoneNumber || '');
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFullName.trim()) {
      toast.error('Full name is required');
      return;
    }

    const db = getDB();
    const currentUserId = Number(user?.id || user?.uid || 1);
    
    const userIndex = db.users.findIndex(u => Number(u.id) === currentUserId);
    if (userIndex !== -1) {
      db.users[userIndex] = {
        ...db.users[userIndex],
        fullName: editFullName,
        username: editUsername,
        bio: editBio,
        avatar: editAvatar,
        phoneNumber: editPhoneNumber
      };
      saveDB(db);
      
      const updatedUser = {
        ...user,
        fullName: editFullName,
        username: editUsername,
        bio: editBio,
        avatar: editAvatar,
        phoneNumber: editPhoneNumber
      };
      updateUser(updatedUser as any);
      
      setCurrentUserData({
        name: editFullName,
        email: db.users[userIndex].email,
        username: editUsername,
        bio: editBio,
        avatar: editAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(editFullName)}&background=3b82f6&color=fff`,
        joinedDate: db.users[userIndex].createdAt ? new Date(db.users[userIndex].createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'January 2024',
      });
      
      setIsEditModalOpen(false);
      toast.success('Profile updated successfully!');
    } else {
      toast.error('User not found in database');
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const db = getDB();
    const currentUserId = Number(user.id || user.uid || 1);
    const foundUser = db.users.find(u => Number(u.id) === currentUserId);
    
    const activeUser = foundUser ? {
      name: foundUser.fullName,
      email: foundUser.email,
      username: foundUser.username || foundUser.fullName.toLowerCase().replace(/\s+/g, ''),
      bio: foundUser.bio || 'Full-stack developer passionate about clean code and open source',
      avatar: foundUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(foundUser.fullName)}&background=3b82f6&color=fff`,
      joinedDate: foundUser.createdAt ? new Date(foundUser.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'January 2024',
    } : {
      name: user.fullName,
      email: user.email,
      username: user.fullName.toLowerCase().replace(/\s+/g, ''),
      bio: 'Full-stack developer passionate about clean code and open source',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=3b82f6&color=fff`,
      joinedDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'January 2024',
    };
    
    setCurrentUserData(activeUser);

    // Load user's snippets
    const snippets = db.snippets.filter((s: any) => Number(s.userId) === currentUserId);
    setUserSnippets(snippets);

    // Load bookmarked snippets
    const bookmarks = db.bookmarks.filter((b: any) => Number(b.userId) === currentUserId);
    setBookmarkedSnippets(bookmarks);
  }, [user, navigate]);

  if (!user || !currentUserData) {
    return null;
  }

  const publicSnippets = userSnippets.filter(s => s.visibility === 'public');
  const privateSnippets = userSnippets.filter(s => s.visibility === 'private');

  const handleLogout = () => {
    logout();
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Snippets
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6 sticky top-6">
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <img
                    src={currentUserData.avatar}
                    alt={currentUserData.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-700"
                  />
                  <button className="absolute bottom-0 right-0 bg-gray-700 rounded-full p-2 shadow-lg border border-gray-600 hover:bg-gray-600 transition-colors">
                    <UserIcon className="w-4 h-4 text-gray-300" />
                  </button>
                </div>

                <h2 className="text-2xl font-bold text-white">{currentUserData.name}</h2>
                <p className="text-gray-400 mb-1">@{currentUserData.username}</p>
                <p className="text-sm text-gray-500 mb-4">Joined {currentUserData.joinedDate}</p>

                <p className="text-center text-gray-300 mb-6">{currentUserData.bio}</p>

                <div className="w-full space-y-2 mb-6">
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">Email</span>
                    <span className="font-medium text-white">{currentUserData.email}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">Snippets</span>
                    <span className="font-medium text-white">{userSnippets.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-400">Bookmarks</span>
                    <span className="font-medium text-white">{bookmarkedSnippets.length}</span>
                  </div>
                </div>

                <div className="w-full space-y-3">
                  <button 
                    onClick={handleOpenEditModal}
                    className="w-full flex items-center justify-center gap-2 bg-[#2563eb] text-white px-4 py-2 rounded-lg hover:bg-[#1d4ed8] transition-colors font-medium"
                  >
                    <Settings className="w-4 h-4" />
                    Edit Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 mb-6">
              <div className="flex border-b border-gray-700">
                <button
                  onClick={() => setActiveTab('my-snippets')}
                  className={`flex-1 px-6 py-4 font-medium transition-colors ${activeTab === 'my-snippets'
                      ? 'text-blue-400 border-b-2 border-blue-500'
                      : 'text-gray-400 hover:text-white'
                    }`}
                >
                  My Snippets ({userSnippets.length})
                </button>
                <button
                  onClick={() => setActiveTab('bookmarks')}
                  className={`flex-1 px-6 py-4 font-medium transition-colors ${activeTab === 'bookmarks'
                      ? 'text-blue-400 border-b-2 border-blue-500'
                      : 'text-gray-400 hover:text-white'
                    }`}
                >
                  Bookmarks ({bookmarkedSnippets.length})
                </button>
              </div>
            </div>

            {/* My Snippets Tab */}
            {activeTab === 'my-snippets' && (
              <div className="space-y-8">
                {/* Public Snippets */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Globe className="w-5 h-5 text-green-400" />
                    <h3 className="text-xl font-bold text-white">
                      Public Snippets ({publicSnippets.length})
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {publicSnippets.map((snippet) => (
                      <div key={snippet.id} className="relative">
                        <div className="absolute top-4 right-4 z-10">
                          <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full">
                            <Globe className="w-3 h-3" />
                            Public
                          </span>
                        </div>
                        <CodeSnippet
                          title={snippet.title}
                          language={snippet.language}
                          code={snippet.code}
                          description={snippet.description}
                          tags={snippet.tags}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Private Snippets */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Lock className="w-5 h-5 text-gray-400" />
                    <h3 className="text-xl font-bold text-white">
                      Private Snippets ({privateSnippets.length})
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {privateSnippets.map((snippet) => (
                      <div key={snippet.id} className="relative">
                        <div className="absolute top-4 right-4 z-10">
                          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-1 rounded-full">
                            <Lock className="w-3 h-3" />
                            Private
                          </span>
                        </div>
                        <CodeSnippet
                          title={snippet.title}
                          language={snippet.language}
                          code={snippet.code}
                          description={snippet.description}
                          tags={snippet.tags}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Bookmarks Tab */}
            {activeTab === 'bookmarks' && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Bookmark className="w-5 h-5 text-blue-400" />
                  <h3 className="text-xl font-bold text-white">
                    Bookmarked Snippets ({bookmarkedSnippets.length})
                  </h3>
                </div>
                <div className="space-y-4">
                  {bookmarkedSnippets.map((snippet) => (
                    <CodeSnippet
                      key={snippet.id}
                      title={snippet.title}
                      language={snippet.language}
                      code={snippet.code}
                      description={snippet.description}
                      tags={snippet.tags}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-zoom-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">Edit Profile</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors text-lg"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Username (Handle)
                </label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="e.g. johndoe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={editPhoneNumber}
                  onChange={(e) => setEditPhoneNumber(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="e.g. (123) 456-7890"
                />
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Short Bio
                </label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
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
