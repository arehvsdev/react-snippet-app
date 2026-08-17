import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../../pages/Layout';
import { 
  Crown, 
  CreditCard, 
  Users, 
  CheckCircle2, 
  XCircle, 
  IndianRupee,
  Search, 
  ArrowLeft, 
  RefreshCw, 
  Edit3, 
  Receipt, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Loader2,
  AlertCircle,
  Calendar,
  UserCheck
} from 'lucide-react';
import { 
  getAdminSubscriptionStats, 
  getAdminSubscriptions, 
  getAdminPayments, 
  updateUserSubscription,
  type SubscriptionStats,
  type UserSubscriptionItem,
  type PaymentTransactionItem
} from '../../services/adminSubscriptionService';
import toast from 'react-hot-toast';
import { getAvatarUrl } from '../../utils/avatar';

export function ManageSubscriptions() {
  const [activeTab, setActiveTab] = useState<'users' | 'payments'>('users');
  
  // Dashboard statistics state
  const [stats, setStats] = useState<SubscriptionStats>({
    totalProUsers: 0,
    totalFreeUsers: 0,
    activeProUsers: 0,
    totalRevenue: 0,
    totalTransactions: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Tab 1: User Subscriptions state
  const [users, setUsers] = useState<UserSubscriptionItem[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [userTotalCount, setUserTotalCount] = useState(0);

  // Tab 2: Payment Transactions state
  const [payments, setPayments] = useState<PaymentTransactionItem[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL');
  const [paymentPage, setPaymentPage] = useState(1);
  const [paymentTotalPages, setPaymentTotalPages] = useState(1);
  const [paymentTotalCount, setPaymentTotalCount] = useState(0);

  // Subscription Edit Modal state
  const [selectedUser, setSelectedUser] = useState<UserSubscriptionItem | null>(null);
  const [modalPlan, setModalPlan] = useState<'FREE' | 'PRO'>('PRO');
  const [modalStatus, setModalStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [updatingSub, setUpdatingSub] = useState(false);

  // Load summary statistics
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const res = await getAdminSubscriptionStats();
      setStats(res);
    } catch (err: any) {
      console.error("Failed to load subscription stats:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Load User Subscriptions list
  const fetchUsers = async (overrideParams?: { page?: number; search?: string; plan?: string; status?: string }) => {
    try {
      setUsersLoading(true);
      const currentPage = overrideParams?.page !== undefined ? overrideParams.page : userPage;
      const currentSearch = overrideParams?.search !== undefined ? overrideParams.search : userSearch;
      const currentPlan = overrideParams?.plan !== undefined ? overrideParams.plan : planFilter;
      const currentStatus = overrideParams?.status !== undefined ? overrideParams.status : statusFilter;

      const res = await getAdminSubscriptions({
        page: currentPage,
        limit: 10,
        search: currentSearch || undefined,
        plan: currentPlan,
        status: currentStatus
      });

      if (res.success || res.data) {
        const rawList = res.data || res.subscriptions || [];
        const formatted = rawList.map((u: any) => ({
          ...u,
          _id: u._id || u.id
        }));
        setUsers(formatted);
        if (res.pagination) {
          setUserTotalPages(res.pagination.pages || res.pagination.totalPages || 1);
          setUserTotalCount(res.pagination.total || rawList.length);
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load user subscriptions');
    } finally {
      setUsersLoading(false);
    }
  };

  // Load Payments list
  const fetchPayments = async (overrideParams?: { page?: number; search?: string; status?: string }) => {
    try {
      setPaymentsLoading(true);
      const currentPage = overrideParams?.page !== undefined ? overrideParams.page : paymentPage;
      const currentSearch = overrideParams?.search !== undefined ? overrideParams.search : paymentSearch;
      const currentStatus = overrideParams?.status !== undefined ? overrideParams.status : paymentStatusFilter;

      const res = await getAdminPayments({
        page: currentPage,
        limit: 10,
        search: currentSearch || undefined,
        status: currentStatus
      });

      if (res.success || res.data) {
        const rawList = res.data || res.payments || [];
        setPayments(rawList);
        if (res.pagination) {
          setPaymentTotalPages(res.pagination.pages || res.pagination.totalPages || 1);
          setPaymentTotalCount(res.pagination.total || rawList.length);
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load payment transactions');
    } finally {
      setPaymentsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else {
      fetchPayments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, userPage, planFilter, statusFilter, paymentPage, paymentStatusFilter]);

  const handleUserSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUserPage(1);
    fetchUsers({ page: 1 });
  };

  const handlePaymentSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentPage(1);
    fetchPayments({ page: 1 });
  };

  const openSubscriptionModal = (userItem: UserSubscriptionItem) => {
    setSelectedUser(userItem);
    setModalPlan(userItem.subscription?.plan || 'PRO');
    setModalStatus((userItem.subscription?.status as 'ACTIVE' | 'INACTIVE') || 'ACTIVE');
  };

  const handleUpdateSubscriptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      setUpdatingSub(true);
      toast.loading("Updating subscription settings...", { id: 'update-sub' });
      await updateUserSubscription(selectedUser._id, {
        plan: modalPlan,
        status: modalStatus
      });
      toast.success("Subscription updated successfully!", { id: 'update-sub' });
      setSelectedUser(null);
      fetchUsers();
      fetchStats();
    } catch (err: any) {
      toast.error(err.message || "Failed to update subscription", { id: 'update-sub' });
    } finally {
      setUpdatingSub(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Layout>
      <div className="p-6 md:p-8 bg-gray-900 min-h-screen text-white w-full">
        <div className="w-full mx-auto">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
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
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Subscriptions & Pro Users</h1>
                  <span className="bg-amber-500/20 text-amber-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                    <Crown className="w-3 h-3" /> PRO Tier
                  </span>
                </div>
                <p className="text-gray-400 text-sm mt-1">
                  Monitor Pro tier users, subscription plan details, and full transaction history
                </p>
              </div>
            </div>
            <button
              onClick={() => { fetchStats(); if (activeTab === 'users') fetchUsers(); else fetchPayments(); }}
              className="p-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl border border-gray-700 transition-colors flex items-center gap-2 text-sm font-medium self-start md:self-auto cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>

          {/* Overview Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
            {/* Total Pro Users */}
            <div className="bg-gray-800 border border-gray-700/80 rounded-xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs font-medium mb-1">Total Pro Users</p>
                  <p className="text-2xl font-bold text-amber-400">
                    {statsLoading ? '...' : stats.totalProUsers.toLocaleString()}
                  </p>
                </div>
                <div className="bg-amber-500/20 p-3 rounded-xl border border-amber-500/20">
                  <Crown className="w-6 h-6 text-amber-400" />
                </div>
              </div>
            </div>

            {/* Active Pro Users */}
            <div className="bg-gray-800 border border-gray-700/80 rounded-xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs font-medium mb-1">Active Subscriptions</p>
                  <p className="text-2xl font-bold text-green-400">
                    {statsLoading ? '...' : stats.activeProUsers.toLocaleString()}
                  </p>
                </div>
                <div className="bg-green-500/20 p-3 rounded-xl border border-green-500/20">
                  <UserCheck className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </div>

            {/* Free Plan Users */}
            <div className="bg-gray-800 border border-gray-700/80 rounded-xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs font-medium mb-1">Free Tier Users</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {statsLoading ? '...' : stats.totalFreeUsers.toLocaleString()}
                  </p>
                </div>
                <div className="bg-blue-500/20 p-3 rounded-xl border border-blue-500/20">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </div>

            {/* Total Revenue */}
            <div className="bg-gray-800 border border-gray-700/80 rounded-xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs font-medium mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {statsLoading ? '...' : `₹${stats.totalRevenue.toLocaleString('en-IN')}`}
                  </p>
                </div>
                <div className="bg-emerald-500/20 p-3 rounded-xl border border-emerald-500/20">
                  <IndianRupee className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
            </div>

            {/* Total Transactions */}
            <div className="bg-gray-800 border border-gray-700/80 rounded-xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs font-medium mb-1">Total Payments</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {statsLoading ? '...' : stats.totalTransactions.toLocaleString()}
                  </p>
                </div>
                <div className="bg-purple-500/20 p-3 rounded-xl border border-purple-500/20">
                  <Receipt className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-700 mb-6 space-x-4">
            <button
              onClick={() => setActiveTab('users')}
              className={`pb-3 px-2 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <Crown className="w-4 h-4 text-amber-400" />
              <span>Pro & User Subscriptions</span>
              <span className="ml-1 bg-gray-800 text-gray-300 text-xs px-2 py-0.5 rounded-full font-bold">
                {userTotalCount}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`pb-3 px-2 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
                activeTab === 'payments'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <CreditCard className="w-4 h-4 text-purple-400" />
              <span>Payment Transactions History</span>
              <span className="ml-1 bg-gray-800 text-gray-300 text-xs px-2 py-0.5 rounded-full font-bold">
                {paymentTotalCount}
              </span>
            </button>
          </div>

          {/* TAB 1: User Subscriptions */}
          {activeTab === 'users' && (
            <div>
              {/* Filters */}
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 mb-6">
                <form onSubmit={handleUserSearchSubmit} className="flex flex-col lg:flex-row gap-4 items-end lg:items-center">
                  <div className="w-full lg:flex-1 relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <input 
                      type="text"
                      placeholder="Search users by name, email, or username..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-950 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm placeholder-gray-500"
                    />
                  </div>

                  <div className="flex flex-wrap gap-4 w-full lg:w-auto">
                    <div className="flex-1 sm:flex-initial">
                      <select
                        value={planFilter}
                        onChange={(e) => { setPlanFilter(e.target.value); setUserPage(1); }}
                        className="w-full px-4 py-2 bg-gray-950 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="ALL">All Plans</option>
                        <option value="PRO">PRO Plan Only</option>
                        <option value="FREE">FREE Plan Only</option>
                      </select>
                    </div>

                    <div className="flex-1 sm:flex-initial">
                      <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setUserPage(1); }}
                        className="w-full px-4 py-2 bg-gray-950 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="ALL">All Statuses</option>
                        <option value="ACTIVE">Active Status</option>
                        <option value="INACTIVE">Inactive / Expired</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
                    >
                      Search
                    </button>

                    {(userSearch || planFilter !== 'ALL' || statusFilter !== 'ALL') && (
                      <button
                        type="button"
                        onClick={() => {
                          setUserSearch('');
                          setPlanFilter('ALL');
                          setStatusFilter('ALL');
                          setUserPage(1);
                          fetchUsers({ page: 1, search: '', plan: 'ALL', status: 'ALL' });
                        }}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors cursor-pointer"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Table */}
              <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-xl">
                {usersLoading ? (
                  <div className="p-12 text-center text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
                    <p className="text-sm">Loading user subscriptions...</p>
                  </div>
                ) : users.length === 0 ? (
                  <div className="p-12 text-center text-gray-400">
                    <AlertCircle className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                    <p className="text-base font-semibold text-white">No subscription records found</p>
                    <p className="text-xs text-gray-500 mt-1">Try resetting your search query or filters.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-300">
                      <thead className="bg-gray-950/80 text-gray-400 uppercase text-xs tracking-wider border-b border-gray-700">
                        <tr>
                          <th className="px-6 py-4 font-semibold">User Profile</th>
                          <th className="px-6 py-4 font-semibold">Role</th>
                          <th className="px-6 py-4 font-semibold">Subscription Plan</th>
                          <th className="px-6 py-4 font-semibold">Status</th>
                          <th className="px-6 py-4 font-semibold">Payment Info</th>
                          <th className="px-6 py-4 font-semibold">Joined Date</th>
                          <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700/60">
                        {users.map((item) => {
                          const isPro = item.subscription?.plan === 'PRO';
                          const isActive = item.subscription?.status === 'ACTIVE';
                          const displayName = item.name || item.username;
                          
                          return (
                            <tr key={item._id} className="hover:bg-gray-750 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                  <img 
                                    src={getAvatarUrl(item.avatar, displayName)}
                                    alt={displayName}
                                    className="w-10 h-10 rounded-full bg-gray-700 object-cover border border-gray-600"
                                  />
                                  <div>
                                    <p className="font-semibold text-white">{displayName}</p>
                                    <p className="text-xs text-gray-400">@{item.username} • {item.email}</p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="capitalize text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-700 text-gray-300">
                                  {item.role || 'developer'}
                                </span>
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap">
                                {isPro ? (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                    <Crown className="w-3.5 h-3.5" /> PRO
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-400 border border-gray-600">
                                    FREE
                                  </span>
                                )}
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap">
                                {isActive ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
                                    <XCircle className="w-3.5 h-3.5" /> {item.subscription?.status || 'INACTIVE'}
                                  </span>
                                )}
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400">
                                {item.subscription?.paymentId ? (
                                  <div>
                                    <p className="font-mono text-gray-300">{item.subscription.paymentId}</p>
                                    <p className="text-[11px] text-gray-500">{formatDate(item.subscription.paymentDate)}</p>
                                  </div>
                                ) : (
                                  <span className="text-gray-500 italic">No payment record</span>
                                )}
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400">
                                {formatDate(item.createdAt)}
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <button
                                  onClick={() => openSubscriptionModal(item)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 hover:text-blue-300 rounded-lg border border-blue-500/30 text-xs font-medium transition-colors cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" /> Manage Plan
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                {userTotalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-700 bg-gray-950/60 flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                      Showing page <span className="font-bold text-white">{userPage}</span> of <span className="font-bold text-white">{userTotalPages}</span>
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={userPage <= 1}
                        onClick={() => setUserPage(prev => Math.max(1, prev - 1))}
                        className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-gray-300"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        disabled={userPage >= userTotalPages}
                        onClick={() => setUserPage(prev => Math.min(userTotalPages, prev + 1))}
                        className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-gray-300"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Payment Transactions */}
          {activeTab === 'payments' && (
            <div>
              {/* Filters */}
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 mb-6">
                <form onSubmit={handlePaymentSearchSubmit} className="flex flex-col sm:flex-row gap-4 items-end sm:items-center">
                  <div className="w-full sm:flex-1 relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <input 
                      type="text"
                      placeholder="Search by Order ID or Payment ID..."
                      value={paymentSearch}
                      onChange={(e) => setPaymentSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-950 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm placeholder-gray-500"
                    />
                  </div>

                  <div className="flex gap-4 w-full sm:w-auto">
                    <select
                      value={paymentStatusFilter}
                      onChange={(e) => { setPaymentStatusFilter(e.target.value); setPaymentPage(1); }}
                      className="px-4 py-2 bg-gray-950 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ALL">All Payment Statuses</option>
                      <option value="SUCCESS">SUCCESS</option>
                      <option value="FAILED">FAILED</option>
                      <option value="CREATED">CREATED / PENDING</option>
                    </select>

                    <button
                      type="submit"
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
                    >
                      Search
                    </button>
                  </div>
                </form>
              </div>

              {/* Table */}
              <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-xl">
                {paymentsLoading ? (
                  <div className="p-12 text-center text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
                    <p className="text-sm">Loading payment transactions...</p>
                  </div>
                ) : payments.length === 0 ? (
                  <div className="p-12 text-center text-gray-400">
                    <Receipt className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                    <p className="text-base font-semibold text-white">No payment transactions found</p>
                    <p className="text-xs text-gray-500 mt-1">Payment activity will show up here once users complete checkout.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-300">
                      <thead className="bg-gray-950/80 text-gray-400 uppercase text-xs tracking-wider border-b border-gray-700">
                        <tr>
                          <th className="px-6 py-4 font-semibold">Transaction Details</th>
                          <th className="px-6 py-4 font-semibold">Customer</th>
                          <th className="px-6 py-4 font-semibold">Plan</th>
                          <th className="px-6 py-4 font-semibold">Amount</th>
                          <th className="px-6 py-4 font-semibold">Gateway</th>
                          <th className="px-6 py-4 font-semibold">Status</th>
                          <th className="px-6 py-4 font-semibold">Date & Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700/60">
                        {payments.map((p) => {
                          const customerName = p.user?.name || p.user?.username || 'Unknown Customer';
                          const isSuccess = p.status === 'SUCCESS' || p.status === 'PAID' || p.status === 'COMPLETED';
                          const isFailed = p.status === 'FAILED';

                          return (
                            <tr key={p._id} className="hover:bg-gray-750 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-mono text-xs">
                                  <p className="text-white font-semibold">{p.orderId}</p>
                                  {p.paymentId ? (
                                    <p className="text-gray-400 text-[11px] mt-0.5">Pay ID: {p.paymentId}</p>
                                  ) : (
                                    <p className="text-gray-500 text-[11px] italic">No payment ID yet</p>
                                  )}
                                </div>
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2.5">
                                  <img
                                    src={getAvatarUrl(p.user?.avatar, customerName)}
                                    alt={customerName}
                                    className="w-8 h-8 rounded-full bg-gray-700 object-cover"
                                  />
                                  <div>
                                    <p className="font-semibold text-white text-xs">{customerName}</p>
                                    {p.user?.email && (
                                      <p className="text-[11px] text-gray-400">{p.user.email}</p>
                                    )}
                                  </div>
                                </div>
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  <Crown className="w-3 h-3" /> {p.plan || 'PRO'}
                                </span>
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap font-semibold text-white">
                                ₹{(p.amount >= 100 ? p.amount / 100 : p.amount).toLocaleString('en-IN')} <span className="text-xs font-normal text-gray-400">{p.currency || 'INR'}</span>
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400 font-mono">
                                {p.gateway || 'RAZORPAY'}
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap">
                                {isSuccess ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> SUCCESS
                                  </span>
                                ) : isFailed ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
                                    <XCircle className="w-3.5 h-3.5" /> FAILED
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                    <Calendar className="w-3.5 h-3.5" /> {p.status}
                                  </span>
                                )}
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400">
                                {formatDateTime(p.createdAt)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                {paymentTotalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-700 bg-gray-950/60 flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                      Showing page <span className="font-bold text-white">{paymentPage}</span> of <span className="font-bold text-white">{paymentTotalPages}</span>
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={paymentPage <= 1}
                        onClick={() => setPaymentPage(prev => Math.max(1, prev - 1))}
                        className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-gray-300"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        disabled={paymentPage >= paymentTotalPages}
                        onClick={() => setPaymentPage(prev => Math.min(paymentTotalPages, prev + 1))}
                        className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-gray-300"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Edit Subscription Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
          <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-amber-500/20 rounded-xl border border-amber-500/30">
                <Crown className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Manage User Subscription</h3>
                <p className="text-xs text-gray-400">Update plan tier and status for {selectedUser.name || selectedUser.username}</p>
              </div>
            </div>

            <form onSubmit={handleUpdateSubscriptionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Subscription Plan
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setModalPlan('PRO')}
                    className={`py-3 px-4 rounded-xl font-bold text-sm border flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      modalPlan === 'PRO'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                        : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    <Crown className="w-4 h-4" /> PRO Plan
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalPlan('FREE')}
                    className={`py-3 px-4 rounded-xl font-bold text-sm border flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      modalPlan === 'FREE'
                        ? 'bg-blue-500/20 border-blue-500 text-blue-300 shadow-md'
                        : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    <Users className="w-4 h-4" /> FREE Plan
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Account Status
                </label>
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-gray-950 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ACTIVE">ACTIVE (Full access)</option>
                  <option value="INACTIVE">INACTIVE / EXPIRED (Restricted access)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-gray-700 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingSub}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {updatingSub && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
