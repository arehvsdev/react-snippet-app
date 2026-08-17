import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../../pages/Layout';
import { 
  FileText, 
  Search, 
  X, 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight,
  Activity,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { getAuditLogs, type AuditLogItem } from '../../services/auditLogService';
import toast from 'react-hot-toast';

const TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'Authentication', label: 'Authentication' },
  { value: 'User', label: 'User & Profile' },
  { value: 'Snippet', label: 'Snippet' },
  { value: 'Comment', label: 'Comment' },
  { value: 'Admin', label: 'Admin' },
  { value: 'Payment', label: 'Payment' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'Success', label: 'Success' },
  { value: 'Failed', label: 'Failed' },
];

export function ActivityLogs() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters and Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchLogs = async (overrideParams?: { page?: number; search?: string; type?: string; status?: string }) => {
    try {
      setLoading(true);
      setError(null);
      const currentPage = overrideParams?.page !== undefined ? overrideParams.page : page;
      const currentSearch = overrideParams?.search !== undefined ? overrideParams.search : searchQuery;
      const currentType = overrideParams?.type !== undefined ? overrideParams.type : typeFilter;
      const currentStatus = overrideParams?.status !== undefined ? overrideParams.status : statusFilter;

      const res = await getAuditLogs({
        page: currentPage,
        limit: 15,
        type: currentType,
        status: currentStatus,
        search: currentSearch || undefined
      });

      if (res.success || res.logs || res.data) {
        const fetchedLogs = res.logs || res.data || [];
        setLogs(fetchedLogs);
        if (res.pagination) {
          setTotalPages(res.pagination.pages || res.pagination.totalPages || 1);
          setTotalItems(res.pagination.total || fetchedLogs.length);
        }
      }
    } catch (err: any) {
      console.error('Failed to load audit logs:', err);
      setError(err.message || 'Failed to load system audit logs.');
      toast.error('Failed to load system audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, typeFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs({ page: 1 });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setStatusFilter('all');
    setPage(1);
    fetchLogs({ page: 1, search: '', type: 'all', status: 'all' });
  };

  const getTypeBadgeStyle = (type: string) => {
    switch (type) {
      case 'Authentication': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'User': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'Snippet': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Comment': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Admin': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Payment': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const formatActionName = (action: string) => {
    return action
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, char => char.toUpperCase());
  };



  return (
    <Layout>
      <div className="p-6 md:p-8 bg-gray-900 min-h-screen text-white w-full">
        <div className="w-full mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3.5">
              <Link
                to="/admin/dashboard"
                className="p-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl transition-colors border border-gray-700 flex items-center justify-center cursor-pointer"
                title="Back to Admin Dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <FileText className="w-8 h-8 text-blue-400" />
                  Activity & Audit Logs
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                  Comprehensive audit trail tracking authentication, snippet modifications, user administration, and security events.
                </p>
              </div>
            </div>
            <button
              onClick={() => fetchLogs()}
              className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl border border-gray-700 text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Logs
            </button>
          </div>

          {/* Basic Filter Bar */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 mb-6 shadow-xl">
            <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by user name, email, action, or resource..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Log Type Filter */}
              <div className="w-full md:w-48">
                <select
                  value={typeFilter}
                  onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                  className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                >
                  {TYPE_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="w-full md:w-44">
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* Filter Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-colors cursor-pointer shadow-md shadow-blue-600/20"
                >
                  Search
                </button>
                {(searchQuery || typeFilter !== 'all' || statusFilter !== 'all') && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white font-medium text-sm rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    Reset
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Table / Error / Loading States */}
          {error ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center my-6">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">Error Loading Audit Logs</h3>
              <p className="text-gray-400 text-sm mb-4">{error}</p>
              <button
                onClick={() => fetchLogs()}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-xl">
              {loading ? (
                /* Loading Skeleton Rows */
                <div className="divide-y divide-gray-700/60 p-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="py-4 flex items-center justify-between animate-pulse">
                      <div className="flex items-center gap-4 w-1/3">
                        <div className="w-9 h-9 bg-gray-700 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <div className="h-3.5 bg-gray-700 rounded w-3/4" />
                          <div className="h-3 bg-gray-750 rounded w-1/2" />
                        </div>
                      </div>
                      <div className="h-6 bg-gray-700 rounded-full w-24" />
                      <div className="h-4 bg-gray-700 rounded w-32" />
                      <div className="h-6 bg-gray-700 rounded-full w-16" />
                    </div>
                  ))}
                </div>
              ) : logs.length === 0 ? (
                /* Empty State */
                <div className="py-20 text-center text-gray-500">
                  <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-white">No audit logs found</p>
                  <p className="text-sm mt-1 text-gray-400">Try clearing filters or searching for different keywords.</p>
                  {(searchQuery || typeFilter !== 'all' || statusFilter !== 'all') && (
                    <button
                      onClick={handleResetFilters}
                      className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                /* Data Table */
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-900/90 border-b border-gray-700 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        <th className="px-6 py-4">Timestamp</th>
                        <th className="px-6 py-4">User</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Action</th>
                        <th className="px-6 py-4">Resource</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/60 text-sm">
                      {logs.map((log) => {
                        const userObj = log.user;
                        const displayName = log.userName || userObj?.name || 'System / Guest';
                        const displayEmail = log.userEmail || userObj?.email || '';
                        const avatarUrl = userObj?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=1e3a8a&color=fff`;

                        return (
                          <tr key={log._id} className="hover:bg-gray-750/40 transition-colors">
                            {/* Timestamp */}
                            <td className="px-6 py-4 whitespace-nowrap text-gray-300 text-xs font-mono">
                              <div className="flex items-center gap-1.5 text-gray-400">
                                <Clock className="w-3.5 h-3.5 text-gray-500" />
                                {new Date(log.createdAt).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit'
                                })}
                              </div>
                            </td>

                            {/* User */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <img
                                  src={avatarUrl}
                                  alt={displayName}
                                  className="w-8 h-8 rounded-full border border-gray-700 object-cover"
                                />
                                <div>
                                  <h4 className="font-semibold text-white text-xs leading-tight">
                                    {displayName}
                                  </h4>
                                  {displayEmail && (
                                    <div className="text-[11px] text-gray-400">{displayEmail}</div>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Type Badge */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center text-xs px-2.5 py-0.5 rounded-full font-bold border ${getTypeBadgeStyle(log.type)}`}>
                                {log.type}
                              </span>
                            </td>

                            {/* Action */}
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-white text-xs">
                              {formatActionName(log.action)}
                            </td>

                            {/* Resource Type & Name */}
                            <td className="px-6 py-4 text-xs max-w-xs truncate">
                              <div className="font-semibold text-gray-200">{log.resourceType || 'System'}</div>
                              {log.resourceName && (
                                <div className="text-gray-400 text-[11px] truncate" title={log.resourceName}>
                                  {log.resourceName}
                                </div>
                              )}
                            </td>

                            {/* Status */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              {log.status === 'Success' ? (
                                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Success
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                                  <XCircle className="w-3.5 h-3.5" />
                                  Failed
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Server-Side Pagination Controls */}
              {!loading && totalPages > 1 && (
                <div className="px-6 py-4 bg-gray-900/90 border-t border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs text-gray-400 font-medium">
                    Showing Page <span className="text-white font-bold">{page}</span> of <span className="text-white font-bold">{totalPages}</span> ({totalItems} total logs)
                  </p>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPage(prev => Math.max(1, prev - 1))}
                      disabled={page === 1}
                      className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors border border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                      .map((p, idx, arr) => {
                        const prev = arr[idx - 1];
                        const showEllipsis = prev && p - prev > 1;

                        return (
                          <div key={p} className="flex items-center">
                            {showEllipsis && <span className="px-2 text-gray-500 text-xs">...</span>}
                            <button
                              onClick={() => setPage(p)}
                              className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                page === p
                                  ? 'bg-blue-600 text-white font-bold'
                                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700'
                              }`}
                            >
                              {p}
                            </button>
                          </div>
                        );
                      })}

                    <button
                      onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={page === totalPages}
                      className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors border border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default ActivityLogs;
