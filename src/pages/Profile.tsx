import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { User as UserIcon, Settings, LogOut, Lock, Globe, Bookmark, ArrowLeft, Plus, Key } from 'lucide-react';
import { CodeSnippet } from '../components/CodeSnippet';
import { Layout } from './Layout';
import { useAuth } from '../layouts/AuthContext';
import { getUserProfile, updateUserProfile, updateUserAvatar, changeUserPassword } from '../services/userService';
import { getSnippets, getUserBookmarks, updateSnippet } from '../services/snippetService';
import toast from 'react-hot-toast';

export function Profile() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'my-snippets' | 'bookmarks'>('my-snippets');
  const [currentUserData, setCurrentUserData] = useState<any>(null);
  const [userSnippets, setUserSnippets] = useState<any[]>([]);
  const [bookmarkedSnippets, setBookmarkedSnippets] = useState<any[]>([]);

  // Avatar upload ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit Profile States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editPhoneNumber, setEditPhoneNumber] = useState('');

  // Change Password States
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Current password is required');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      await changeUserPassword({ currentPassword, newPassword });
      toast.success('Password changed successfully!');
      setIsPasswordModalOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to change password');
    }
  };

  const fetchProfile = async () => {
    try {
      const profile = await getUserProfile();
      const nameStr = profile?.fullName || user?.fullName || 'User';
      const safeUsername = profile?.username || (typeof nameStr === 'string' ? nameStr.toLowerCase().replace(/\s+/g, '') : 'user');
      const activeUser = {
        name: nameStr,
        email: profile?.email || user?.email || '',
        username: safeUsername,
        bio: profile?.bio || 'Full-stack developer passionate about clean code and open source',
        avatar: profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(nameStr)}&background=3b82f6&color=fff`,
        joinedDate: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'January 2024',
        phoneNumber: profile?.phoneNumber || user?.phoneNumber
      };
      setCurrentUserData(activeUser);
      
      // Keep auth context updated
      if (profile) {
        updateUser({
          ...user,
          ...profile
        } as any);
      }
    } catch (err: any) {
      console.error("Failed to load profile:", err);
      if (user) {
        const fallbackName = user.fullName || 'User';
        const fallbackUsername = user.username || (typeof fallbackName === 'string' ? fallbackName.toLowerCase().replace(/\s+/g, '') : 'user');
        setCurrentUserData({
          name: fallbackName,
          email: user.email || '',
          username: fallbackUsername,
          bio: user.bio || 'Full-stack developer passionate about clean code and open source',
          avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=3b82f6&color=fff`,
          joinedDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'January 2024',
          phoneNumber: user.phoneNumber
        });
      }
    }
  };

  const handleOpenEditModal = () => {
    setEditFullName(currentUserData?.name || user?.fullName || '');
    setEditUsername(currentUserData?.username || '');
    setEditBio(currentUserData?.bio || '');
    setEditPhoneNumber(currentUserData?.phoneNumber || user?.phoneNumber || '');
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFullName.trim()) {
      toast.error('Full name is required');
      return;
    }

    try {
      const updatedProfile = await updateUserProfile({
        fullName: editFullName,
        username: editUsername,
        phoneNumber: editPhoneNumber,
        bio: editBio
      });

      updateUser({
        ...user,
        ...updatedProfile
      });

      setCurrentUserData({
        name: updatedProfile.fullName,
        email: updatedProfile.email,
        username: updatedProfile.username,
        bio: updatedProfile.bio,
        avatar: updatedProfile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(updatedProfile.fullName)}&background=3b82f6&color=fff`,
        joinedDate: updatedProfile.createdAt ? new Date(updatedProfile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'January 2024',
        phoneNumber: updatedProfile.phoneNumber
      });

      setIsEditModalOpen(false);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image file size should be less than 2MB.");
      return;
    }

    try {
      toast.loading("Uploading avatar...", { id: "avatar-upload" });
      const avatarUrl = await updateUserAvatar(file);
      
      const updatedUser = {
        ...user,
        avatar: avatarUrl
      };
      updateUser(updatedUser as any);
      
      setCurrentUserData((prev: any) => ({
        ...prev,
        avatar: avatarUrl
      }));
      
      toast.success("Avatar updated successfully!", { id: "avatar-upload" });
    } catch (err: any) {
      toast.error(err.message || "Failed to upload avatar", { id: "avatar-upload" });
    }
  };

  const userId = user?.id || user?.uid;

  useEffect(() => {
    if (!userId) {
      navigate('/');
      return;
    }

    fetchProfile();

    const loadUserSnippetsAndBookmarks = async () => {
      try {
        const snippetsData = await getSnippets({ userId });
        setUserSnippets(snippetsData);
        
        const bookmarksData = await getUserBookmarks();
        setBookmarkedSnippets(bookmarksData);
      } catch (err) {
        console.error("Failed to load user snippets or bookmarks:", err);
      }
    };
    loadUserSnippetsAndBookmarks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, navigate]);

  if (!user || !currentUserData) {
    return null;
  }

  const publicSnippets = userSnippets.filter(s => s.visibility === 'public');
  const privateSnippets = userSnippets.filter(s => s.visibility === 'private');

  const handleLogout = () => {
    logout();
  };

  const handleVisibilityToggle = async (snippetId: string, newVisibility: 'public' | 'private') => {
    try {
      await updateSnippet(snippetId, { visibility: newVisibility });
      setUserSnippets(prev =>
        prev.map(s => (s.id === snippetId ? { ...s, visibility: newVisibility } : s))
      );
      toast.success(`Snippet visibility updated to ${newVisibility}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update snippet visibility');
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/edit/${id}`);
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
                  <button 
                    onClick={handleAvatarClick}
                    className="absolute bottom-0 right-0 bg-gray-700 rounded-full p-2 shadow-lg border border-gray-600 hover:bg-gray-600 transition-colors"
                    aria-label="Upload avatar"
                  >
                    <UserIcon className="w-4 h-4 text-gray-300" />
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleAvatarChange} 
                    className="hidden" 
                    accept="image/*"
                  />
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
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={handleOpenEditModal}
                      className="w-full flex items-center justify-center gap-2 bg-[#2563eb] text-white px-3 py-2 rounded-lg hover:bg-[#1d4ed8] transition-colors font-medium text-sm"
                    >
                      <Settings className="w-4 h-4 shrink-0" />
                      <span>Edit Profile</span>
                    </button>
                    <button
                      onClick={() => setIsPasswordModalOpen(true)}
                      className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-2 rounded-lg transition-colors font-medium border border-gray-600 text-sm"
                    >
                      <Key className="w-4 h-4 shrink-0" />
                      <span>Change Password</span>
                    </button>
                  </div>
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
            {bookmarkedSnippets.length > 0 && (
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
            )}

            {/* My Snippets Tab */}
            {activeTab === 'my-snippets' && (
              <div className="space-y-8">
                {/* Public Snippets */}
                {publicSnippets.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Globe className="w-5 h-5 text-green-400" />
                      <h3 className="text-xl font-bold text-white">
                        Public Snippets ({publicSnippets.length})
                      </h3>
                    </div>
                    <div className="space-y-4">
                      {publicSnippets.map((snippet) => (
                        <CodeSnippet
                          key={snippet.id}
                          id={snippet.id}
                          title={snippet.title}
                          language={snippet.language}
                          code={snippet.code}
                          description={snippet.description}
                          tags={snippet.tags}
                          visibility={snippet.visibility}
                          onVisibilityToggle={handleVisibilityToggle}
                          onEdit={handleEdit}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Private Snippets */}
                {privateSnippets.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Lock className="w-5 h-5 text-gray-400" />
                      <h3 className="text-xl font-bold text-white">
                        Private Snippets ({privateSnippets.length})
                      </h3>
                    </div>
                    <div className="space-y-4">
                      {privateSnippets.map((snippet) => (
                        <CodeSnippet
                          key={snippet.id}
                          id={snippet.id}
                          title={snippet.title}
                          language={snippet.language}
                          code={snippet.code}
                          description={snippet.description}
                          tags={snippet.tags}
                          visibility={snippet.visibility}
                          onVisibilityToggle={handleVisibilityToggle}
                          onEdit={handleEdit}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {userSnippets.length === 0 && (
                  <div className="text-center py-16 bg-gray-800/40 rounded-xl border border-gray-700/60 p-8 flex flex-col items-center justify-center backdrop-blur-sm max-w-md mx-auto animate-fade-in">
                    <div className="bg-blue-600/10 p-4 rounded-full mb-4 border border-blue-500/20">
                      <Globe className="w-8 h-8 text-blue-400" />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-2">No snippets yet</h4>
                    <p className="text-gray-400 text-sm mb-6 text-center leading-relaxed">
                      Get started by creating your first snippet. Share it with the world or keep it private.
                    </p>
                    <button
                      onClick={() => navigate('/create')}
                      className="flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-6 py-2.5 rounded-lg transition-colors font-medium shadow-lg hover:shadow-blue-500/15"
                    >
                      <Plus className="w-4 h-4" />
                      Create First Snippet
                    </button>
                  </div>
                )}
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
                  {bookmarkedSnippets.map((snippet) => {
                    const isOwner = user && snippet.author?.username === user.username;
                    return (
                      <CodeSnippet
                        key={snippet.id}
                        id={snippet.id}
                        title={snippet.title}
                        language={snippet.language}
                        code={snippet.code}
                        description={snippet.description}
                        tags={snippet.tags}
                        onEdit={isOwner ? handleEdit : undefined}
                      />
                    );
                  })}
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
                aria-label="Close modal"
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
                  Username (Handle) <span className="text-xs text-gray-500">(Cannot be changed)</span>
                </label>
                <input
                  type="text"
                  disabled
                  value={editUsername}
                  className="w-full px-4 py-2 bg-gray-950 border border-gray-700 rounded-lg text-gray-500 cursor-not-allowed outline-none transition"
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
      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-400" />
                Change Password
              </h3>
              <button 
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors text-lg"
                aria-label="Close password modal"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSavePassword} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Current Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  New Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="••••••••"
                />
                <p className="text-xs text-gray-400 mt-1">At least 8 chars with uppercase, lowercase, number & special char.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
