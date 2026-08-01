import { useState, useEffect } from 'react';
import { Layout } from '../../pages/Layout';
import { 
  Search, 
  Trash2, 
  Edit, 
  X, 
  Loader2, 
  UserCheck, 
  UserX, 
  Shield, 
  ShieldAlert
} from 'lucide-react';
import { 
  getAllUsers, 
  updateUserRole, 
  toggleUserStatus, 
  deleteUser 
} from '../../services/userService';
import toast from 'react-hot-toast';

interface UserItem {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
  snippetCount?: number;
  bookmarkCount?: number;
  avatar?: string;
}

export function ManageUsers() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal / Editing states
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [editRole, setEditRole] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [updating, setUpdating] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await getAllUsers({
        page,
        limit: 10,
        search: searchQuery || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined
      });
      if (res.success) {
        setUsers(res.users || res.data || []);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages || 1);
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, roleFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadUsers();
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setRoleFilter('');
    setStatusFilter('');
    setPage(1);
    // Directly fetch clean state
    setTimeout(() => loadUsers(), 0);
  };

  const handleToggleStatus = async (user: UserItem) => {
    const nextActive = !user.active;
    try {
      toast.loading(`${nextActive ? 'Enabling' : 'Disabling'} user account...`, { id: 'status-toggle' });
      await toggleUserStatus(user.id, nextActive);
      toast.success(`Account ${nextActive ? 'enabled' : 'disabled'} successfully`, { id: 'status-toggle' });
      loadUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to toggle account status', { id: 'status-toggle' });
    }
  };

  const handleDeleteUser = async (user: UserItem) => {
    if (!window.confirm(`Are you sure you want to delete the user "${user.name}"? This will soft-delete their account and disable their login.`)) {
      return;
    }

    try {
      toast.loading('Deleting user account...', { id: 'delete-user' });
      await deleteUser(user.id);
      toast.success('User account soft deleted successfully', { id: 'delete-user' });
      loadUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete user', { id: 'delete-user' });
    }
  };

  const openEditModal = (user: UserItem) => {
    setSelectedUser(user);
    setEditRole(user.role);
    setEditActive(user.active);
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      setUpdating(true);
      // Update role if changed
      if (editRole !== selectedUser.role) {
        await updateUserRole(selectedUser.id, editRole);
      }
      // Update active status if changed
      if (editActive !== selectedUser.active) {
        await toggleUserStatus(selectedUser.id, editActive);
      }

      toast.success('User configuration updated successfully');
      setShowEditModal(false);
      setSelectedUser(null);
      loadUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user configuration');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Layout>
      <div className="p-8 bg-gray-900 min-h-screen text-white">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
              <p className="text-gray-400 text-sm mt-1">Review registrations, roles, statuses, and profiles.</p>
            </div>
          </div>

          {/* Filters Area */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-8 shadow-sm">
            <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row gap-4 items-end lg:items-center">
              
              {/* Search */}
              <div className="w-full lg:flex-1 relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <input 
                  type="text"
                  placeholder="Search by name, email, or username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-950 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder-gray-500"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-4 w-full lg:w-auto">
                <div className="flex-1 sm:flex-initial">
                  <select
                    value={roleFilter}
                    onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                    className="w-full px-4 py-2 bg-gray-950 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="developer">Developer</option>
                    <option value="student">Student</option>
                    <option value="mentor">Mentor</option>
                    <option value="recruiter">Recruiter</option>
                  </select>
                </div>

                <div className="flex-1 sm:flex-initial">
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="w-full px-4 py-2 bg-gray-950 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    type="submit"
                    className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors shadow-md shadow-blue-500/10"
                  >
                    Apply
                  </button>
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-300 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>

            </form>
          </div>

          {/* User Table Grid */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-sm">
            {loading ? (
              <div className="py-20 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mr-3" />
                <span className="text-gray-400 font-medium">Fetching users registry...</span>
              </div>
            ) : users.length === 0 ? (
              <div className="py-20 text-center text-gray-500">
                <p className="text-lg font-semibold">No users matching search filters</p>
                <p className="text-sm mt-1">Try resetting filters to show all accounts.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-900/60 border-b border-gray-700 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-center">Snippets</th>
                      <th className="px-6 py-4 text-center">Bookmarks</th>
                      <th className="px-6 py-4">Joined Date</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/60 text-sm">
                    {users.map((u) => {
                      const avatarUrl = u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=1e3a8a&color=fff`;
                      const isSelf = u.id === localStorage.getItem("userId") || u.email === localStorage.getItem("userEmail");
                      
                      return (
                        <tr key={u.id} className="hover:bg-gray-750/30 transition-colors">
                          
                          {/* User info */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <img 
                                src={avatarUrl}
                                alt={u.name}
                                className="w-10 h-10 rounded-full border border-gray-700 object-cover"
                              />
                              <div>
                                <h4 className="font-semibold text-white leading-tight flex items-center gap-1.5">
                                  {u.name}
                                  {isSelf && (
                                    <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20 font-bold">You</span>
                                  )}
                                </h4>
                                <span className="text-xs text-gray-500">@{u.username}</span>
                                <div className="text-xs text-gray-400 font-medium">{u.email}</div>
                              </div>
                            </div>
                          </td>

                          {/* Role Badge */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                              u.role === 'admin' 
                                ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            }`}>
                              {u.role === 'admin' ? <Shield className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                              {u.role.toUpperCase()}
                            </span>
                          </td>

                          {/* Status Badge */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                              u.active 
                                ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                                : 'bg-gray-700 text-gray-400 border-gray-600'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${u.active ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                              {u.active ? 'Active' : 'Disabled'}
                            </span>
                          </td>

                          {/* Snippet Count */}
                          <td className="px-6 py-4 whitespace-nowrap text-center text-gray-300 font-semibold font-mono">
                            {u.snippetCount ?? 0}
                          </td>

                          {/* Bookmark Count */}
                          <td className="px-6 py-4 whitespace-nowrap text-center text-gray-300 font-semibold font-mono">
                            {u.bookmarkCount ?? 0}
                          </td>

                          {/* Registered Date */}
                          <td className="px-6 py-4 whitespace-nowrap text-gray-400 text-xs">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown'}
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditModal(u)}
                                className="p-2 bg-gray-750 hover:bg-blue-600/20 hover:text-blue-400 border border-transparent rounded-lg transition-all text-gray-400"
                                title="Edit Role & Configuration"
                              >
                                <Edit className="w-4.5 h-4.5" />
                              </button>
                              
                              <button
                                onClick={() => handleToggleStatus(u)}
                                className={`p-2 border border-transparent rounded-lg transition-all ${
                                  u.active 
                                    ? 'bg-gray-750 hover:bg-amber-600/20 hover:text-amber-400 text-gray-400' 
                                    : 'bg-green-600/10 hover:bg-green-600/20 text-green-400'
                                }`}
                                title={u.active ? 'Disable Account' : 'Enable Account'}
                              >
                                {u.active ? <UserX className="w-4.5 h-4.5" /> : <UserCheck className="w-4.5 h-4.5" />}
                              </button>

                              <button
                                onClick={() => handleDeleteUser(u)}
                                disabled={isSelf}
                                className={`p-2 border border-transparent rounded-lg transition-all ${
                                  isSelf 
                                    ? 'opacity-40 cursor-not-allowed text-gray-600 bg-transparent' 
                                    : 'bg-gray-750 hover:bg-red-600/20 hover:text-red-400 text-gray-400'
                                }`}
                                title="Soft Delete Account"
                              >
                                <Trash2 className="w-4.5 h-4.5" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-700/60 bg-gray-900/40 flex items-center justify-between">
                <span className="text-xs text-gray-400">Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    className="px-3.5 py-1.5 bg-gray-750 hover:bg-gray-700 text-xs font-semibold rounded-lg text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                    className="px-3.5 py-1.5 bg-gray-750 hover:bg-gray-700 text-xs font-semibold rounded-lg text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-zoom-in text-white">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
              <h3 className="text-xl font-bold">Configure User</h3>
              <button 
                onClick={() => { setShowEditModal(false); setSelectedUser(null); }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">User Details</label>
                <div className="flex items-center gap-3 bg-gray-900/60 p-3 rounded-lg border border-gray-750">
                  <img 
                    src={selectedUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.name)}&background=1e3a8a&color=fff`} 
                    alt={selectedUser.name} 
                    className="w-11 h-11 rounded-full object-cover border border-gray-700"
                  />
                  <div>
                    <h4 className="font-bold text-sm leading-tight text-white">{selectedUser.name}</h4>
                    <span className="text-xs text-gray-500">@{selectedUser.username}</span>
                  </div>
                </div>
              </div>

              {/* Role select */}
              <div>
                <label htmlFor="role" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Role</label>
                <select
                  id="role"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-950 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="admin">Admin</option>
                  <option value="developer">Developer</option>
                  <option value="student">Student</option>
                  <option value="mentor">Mentor</option>
                  <option value="recruiter">Recruiter</option>
                </select>
              </div>

              {/* Active Toggle Switch */}
              <div className="flex items-center justify-between bg-gray-900/30 p-4 border border-gray-750 rounded-lg">
                <div>
                  <label className="block text-sm font-semibold text-white">Account Status</label>
                  <p className="text-xs text-gray-400">
                    {editActive ? 'User can log in and manage content.' : 'User login is blocked.'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={editActive}
                    onChange={(e) => setEditActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setSelectedUser(null); }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  {updating && <Loader2 className="w-4 h-4 animate-spin" />}
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
export default ManageUsers;
