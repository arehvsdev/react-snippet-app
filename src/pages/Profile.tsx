import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Globe, Bookmark, ArrowLeft, Code } from 'lucide-react';
import { CodeSnippet } from '../components/CodeSnippet';
import { Layout } from './Layout';
import { useAuth } from '../layouts/AuthContext';
import { getUserProfile, updateUserProfile, updateUserAvatar, changeUserPassword } from '../services/userService';
import { getSnippets, getUserBookmarks, updateSnippet, getMySnippetStats, type UserSnippetStats } from '../services/snippetService';
import toast from 'react-hot-toast';

/**
 * User Profile & Statistics Component.
 * Displays user details, avatar upload, password changes, compact 2×2 snippet statistics, and user's snippet collection.
 */
export function Profile() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'my-snippets' | 'bookmarks'>('my-snippets');
  const [currentUserData, setCurrentUserData] = useState<any>(null);
  const [userSnippets, setUserSnippets] = useState<any[]>([]);
  const [bookmarkedSnippets, setBookmarkedSnippets] = useState<any[]>([]);
  
  // Real User Statistics State
  const [stats, setStats] = useState<UserSnippetStats | null>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);

  // Bookmarks Pagination States
  const [bookmarkPage, setBookmarkPage] = useState(1);
  const [bookmarkPagination, setBookmarkPagination] = useState({ totalPages: 1, totalItems: 0, currentPage: 1 });
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);

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
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const validatePasswordRequirements = (password: string) => {
    if (!password) return 'New password is required.';
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#\._-]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return 'Password must be at least 8 characters, and include at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&#.).';
    }
    return '';
  };

  const validateConfirmPassword = (confirmPass: string, pass: string) => {
    if (!confirmPass) return 'Please confirm your new password.';
    if (confirmPass !== pass) return 'Passwords do not match.';
    return '';
  };

  const handleNewPasswordChange = (val: string) => {
    setNewPassword(val);
    const passErr = validatePasswordRequirements(val);
    const confirmErr = confirmNewPassword ? validateConfirmPassword(confirmNewPassword, val) : '';
    setPasswordErrors((prev) => ({
      ...prev,
      newPassword: passErr,
      confirmNewPassword: confirmErr,
    }));
  };

  const handleConfirmPasswordChange = (val: string) => {
    setConfirmNewPassword(val);
    const confirmErr = validateConfirmPassword(val, newPassword);
    setPasswordErrors((prev) => ({
      ...prev,
      confirmNewPassword: confirmErr,
    }));
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!currentPassword) {
      newErrors.currentPassword = 'Current password is required.';
    }

    const newPassErr = validatePasswordRequirements(newPassword);
    if (newPassErr) {
      newErrors.newPassword = newPassErr;
    }

    const confirmErr = validateConfirmPassword(confirmNewPassword, newPassword);
    if (confirmErr) {
      newErrors.confirmNewPassword = confirmErr;
    }

    if (Object.keys(newErrors).length > 0) {
      setPasswordErrors(newErrors);
      return;
    }

    setPasswordErrors({});

    try {
      await changeUserPassword({ currentPassword, newPassword });
      toast.success('Password changed successfully!');
      setIsPasswordModalOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setPasswordErrors({});
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmNewPassword(false);
    } catch (err: any) {
      const msg = err.message || 'Failed to change password';
      toast.error(msg);
      setPasswordErrors({ general: msg });
    }
  };

  const fetchProfile = async () => {
    try {
      const rawProfile = await getUserProfile();
      const profile = rawProfile?.data || rawProfile?.user || rawProfile;
      const nameStr = profile?.name || profile?.fullName || user?.fullName || 'User';
      const safeUsername = profile?.username || (typeof nameStr === 'string' ? nameStr.toLowerCase().replace(/\s+/g, '') : 'user');
      
      // Extract and format actual user createdAt date string (e.g. "August 2026")
      const rawCreatedAt = profile?.createdAt || profile?.data?.createdAt || user?.createdAt;
      const formattedJoinedDate = rawCreatedAt && !isNaN(new Date(rawCreatedAt).getTime())
        ? new Date(rawCreatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
        : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

      const activeUser = {
        name: nameStr,
        email: profile?.email || user?.email || '',
        username: safeUsername,
        bio: profile?.bio || 'Full-stack developer passionate about clean code and open source',
        avatar: profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(nameStr)}&background=3b82f6&color=fff`,
        joinedDate: formattedJoinedDate,
        phoneNumber: profile?.phonenumber || profile?.phoneNumber || user?.phoneNumber
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
        const rawCreatedAt = user.createdAt;
        const formattedJoinedDate = rawCreatedAt && !isNaN(new Date(rawCreatedAt).getTime())
          ? new Date(rawCreatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
          : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

        setCurrentUserData({
          name: fallbackName,
          email: user.email || '',
          username: fallbackUsername,
          bio: user.bio || 'Full-stack developer passionate about clean code and open source',
          avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=3b82f6&color=fff`,
          joinedDate: formattedJoinedDate,
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
        joinedDate: updatedProfile.createdAt ? new Date(updatedProfile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'August 2026',
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
      const resAvatar = await updateUserAvatar(file);
      const avatarUrl = typeof resAvatar === 'string' ? resAvatar : ((resAvatar as any)?.avatar || (resAvatar as any)?.url || '');
      
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

  // Open edit/password modals when navigated from the header dropdown via query params
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'edit' && currentUserData) {
      handleOpenEditModal();
      setSearchParams({}, { replace: true });
    } else if (action === 'password') {
      setIsPasswordModalOpen(true);
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, currentUserData]);

  // Load user profile & snippet list
  useEffect(() => {
    if (!userId) {
      navigate('/');
      return;
    }

    fetchProfile();

    const loadUserSnippets = async () => {
      try {
        const snippetsData = await getSnippets({ userId });
        setUserSnippets(snippetsData);
      } catch (err) {
        console.error("Failed to load user snippets:", err);
      }
    };
    loadUserSnippets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, navigate]);

  // Load real user statistics cards from backend GET /api/snippets/my/stats
  useEffect(() => {
    if (!userId) return;
    const loadStats = async () => {
      try {
        setLoadingStats(true);
        const data = await getMySnippetStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to load user stats:", err);
        setStats({ total: 0, public: 0, private: 0, bookmarks: 0 });
      } finally {
        setLoadingStats(false);
      }
    };
    loadStats();
  }, [userId]);

  // Load bookmarks with pagination
  useEffect(() => {
    if (!userId) return;
    const loadBookmarks = async () => {
      try {
        setLoadingBookmarks(true);
        const bookmarksData = await getUserBookmarks({ page: bookmarkPage, limit: 5 });
        setBookmarkedSnippets(bookmarksData);
        const pag = (bookmarksData as any).pagination;
        if (pag) {
          setBookmarkPagination({
            totalPages: pag.totalPages || pag.pages || 1,
            totalItems: pag.totalItems || pag.total || bookmarksData.length,
            currentPage: pag.currentPage || pag.page || bookmarkPage
          });
        } else {
          setBookmarkPagination({
            totalPages: 1,
            totalItems: bookmarksData.length,
            currentPage: 1
          });
        }
      } catch (err) {
        console.error("Failed to load bookmarks:", err);
      } finally {
        setLoadingBookmarks(false);
      }
    };
    loadBookmarks();
  }, [userId, bookmarkPage]);

  if (!user || !currentUserData) {
    return null;
  }

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
                <div className="relative mb-4 group cursor-pointer" onClick={handleAvatarClick}>
                  <img
                    src={currentUserData.avatar}
                    alt={currentUserData.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-700 shadow-md group-hover:opacity-80 transition-opacity"
                  />
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-white font-medium">Change Avatar</span>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                <h2 className="text-2xl font-bold text-white mb-1">{currentUserData.name}</h2>
                <p className="text-gray-400 mb-1">@{currentUserData.username}</p>
                <p className="text-sm text-gray-500 mb-4">Joined {currentUserData.joinedDate}</p>

                <p className="text-center text-gray-300 mb-6">{currentUserData.bio}</p>

                {/* Email detail row */}
                <div className="w-full mb-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-700 text-xs sm:text-sm">
                    <span className="text-gray-400 font-medium">Email</span>
                    <span className="font-semibold text-white">{currentUserData.email}</span>
                  </div>
                </div>

                {/* Compact 2×2 Statistics Grid */}
                <div className="w-full text-left">
                  {loadingStats ? (
                    <div className="grid grid-cols-2 gap-2.5">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-16 bg-gray-700/40 border border-gray-700/60 rounded-xl animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-700/80 shadow-xs space-y-1">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                          <Code className="w-3 h-3 text-blue-400" /> Snippets Created
                        </span>
                        <p className="text-base font-bold text-white pt-0.5">{stats?.total ?? 0}</p>
                      </div>

                      <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-700/80 shadow-xs space-y-1">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                          <Bookmark className="w-3 h-3 text-purple-400" /> Bookmarks
                        </span>
                        <p className="text-base font-bold text-white pt-0.5">{stats?.bookmarks ?? 0}</p>
                      </div>

                      <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-700/80 shadow-xs space-y-1">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                          <Globe className="w-3 h-3 text-emerald-400" /> Public Snippets
                        </span>
                        <p className="text-base font-bold text-white pt-0.5">{stats?.public ?? 0}</p>
                      </div>

                      <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-700/80 shadow-xs space-y-1">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                          <Lock className="w-3 h-3 text-amber-400" /> Private Snippets
                        </span>
                        <p className="text-xs font-bold text-amber-300 pt-0.5">
                          {user?.role?.toLowerCase() === 'admin' || user?.plan === 'PRO' ? (stats?.private ?? 0) : 'PRO Only'}
                        </p>
                      </div>
                    </div>
                  )}
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
                    Bookmarks ({bookmarkPagination.totalItems || bookmarkedSnippets.length})
                  </button>
                </div>
              </div>
            )}

            {/* My Snippets Tab */}
            {(activeTab === 'my-snippets' || bookmarkedSnippets.length === 0) && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">My Snippets</h3>
                  <button
                    onClick={() => navigate('/create-snippet')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm flex items-center gap-2 cursor-pointer"
                  >
                    Create Snippet
                  </button>
                </div>

                {userSnippets.length === 0 ? (
                  <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
                    <p className="text-gray-400 mb-4">You haven't created any snippets yet.</p>
                    <button
                      onClick={() => navigate('/create-snippet')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors font-medium inline-block cursor-pointer"
                    >
                      Create Your First Snippet
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userSnippets.map((snippet) => (
                      <CodeSnippet
                        key={snippet.id || snippet._id}
                        id={snippet.id || snippet._id}
                        title={snippet.title}
                        language={snippet.language}
                        code={snippet.code}
                        description={snippet.description}
                        tags={snippet.tags}
                        visibility={snippet.visibility}
                        onEdit={handleEdit}
                        onVisibilityToggle={handleVisibilityToggle}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Bookmarks Tab */}
            {activeTab === 'bookmarks' && bookmarkedSnippets.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Bookmarked Snippets</h3>
                  <span className="text-sm text-gray-400">
                    Showing page {bookmarkPagination.currentPage} of {bookmarkPagination.totalPages}
                  </span>
                </div>

                {loadingBookmarks ? (
                  <div className="space-y-4">
                    {[1, 2].map((n) => (
                      <div key={n} className="bg-gray-800 rounded-lg p-6 animate-pulse border border-gray-700">
                        <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
                        <div className="h-20 bg-gray-700 rounded mb-4"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookmarkedSnippets.map((snippet) => (
                      <CodeSnippet
                        key={snippet.id || snippet._id}
                        id={snippet.id || snippet._id}
                        title={snippet.title}
                        language={snippet.language}
                        code={snippet.code}
                        description={snippet.description}
                        tags={snippet.tags}
                        visibility={snippet.visibility}
                      />
                    ))}
                  </div>
                )}

                {bookmarkPagination.totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                    <button
                      disabled={bookmarkPage <= 1}
                      onClick={() => setBookmarkPage(prev => Math.max(prev - 1, 1))}
                      className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                    >
                      Previous
                    </button>
                    <span className="text-xs text-gray-400">
                      Page {bookmarkPage} of {bookmarkPagination.totalPages}
                    </span>
                    <button
                      disabled={bookmarkPage >= bookmarkPagination.totalPages}
                      onClick={() => setBookmarkPage(prev => Math.min(prev + 1, bookmarkPagination.totalPages))}
                      className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
              <h3 className="text-lg font-bold text-white">Edit Profile</h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors text-lg"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={editUsername}
                    disabled
                    readOnly
                    className="w-full pl-9 pr-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-400 outline-none cursor-not-allowed opacity-60"
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-1">Username cannot be changed after account creation.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editPhoneNumber}
                  onChange={(e) => setEditPhoneNumber(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Bio</label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
              <h3 className="text-lg font-bold text-white">Change Password</h3>
              <button
                type="button"
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  setPasswordErrors({});
                }}
                className="text-gray-400 hover:text-white transition-colors text-lg"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSavePassword} className="p-6 space-y-4">
              {passwordErrors.general && (
                <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-400 text-sm">
                  {passwordErrors.general}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-white cursor-pointer"
                  >
                    {showCurrentPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className="text-xs text-red-400 mt-1">{passwordErrors.currentPassword}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => handleNewPasswordChange(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-white cursor-pointer"
                  >
                    {showNewPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="text-xs text-red-400 mt-1">{passwordErrors.newPassword}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmNewPassword ? 'text' : 'password'}
                    required
                    value={confirmNewPassword}
                    onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                    className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-white cursor-pointer"
                  >
                    {showConfirmNewPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {passwordErrors.confirmNewPassword && (
                  <p className="text-xs text-red-400 mt-1">{passwordErrors.confirmNewPassword}</p>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setIsPasswordModalOpen(false);
                    setPasswordErrors({});
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm cursor-pointer"
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Profile;
