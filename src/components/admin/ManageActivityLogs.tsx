import React, { useState, useEffect } from 'react';
import { Layout } from '../../pages/Layout';
import {
  Activity,
  Search,
  CreditCard,
  Code2,
  Edit3,
  Trash2,
  UserPlus,
  UserCheck,
  Camera,
  Key,
  MessageSquare,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Info,
  X,
  Filter,
  RefreshCw
} from 'lucide-react';
import {
  getActivityLogs,
  type ActivityLogItem,
} from '../../services/activityLogService';
import toast from 'react-hot-toast';

const actionTypeConfig: Record<
  string,
  { label: string; badgeBg: string; textColor: string; icon: React.ComponentType<{ className?: string }> }
> = {
  payment: {
    label: 'Payment',
    badgeBg: 'bg-emerald-500/10 border-emerald-500/30',
    textColor: 'text-emerald-400',
    icon: CreditCard,
  },
  snippet_create: {
    label: 'Snippet Created',
    badgeBg: 'bg-blue-500/10 border-blue-500/30',
    textColor: 'text-blue-400',
    icon: Code2,
  },
  snippet_edit: {
    label: 'Snippet Edited',
    badgeBg: 'bg-amber-500/10 border-amber-500/30',
    textColor: 'text-amber-400',
    icon: Edit3,
  },
  snippet_delete: {
    label: 'Snippet Deleted',
    badgeBg: 'bg-red-500/10 border-red-500/30',
    textColor: 'text-red-400',
    icon: Trash2,
  },
  user_register: {
    label: 'User Registered',
    badgeBg: 'bg-purple-500/10 border-purple-500/30',
    textColor: 'text-purple-400',
    icon: UserPlus,
  },
  user_update_profile: {
    label: 'Profile Updated',
    badgeBg: 'bg-indigo-500/10 border-indigo-500/30',
    textColor: 'text-indigo-400',
    icon: UserCheck,
  },
  user_update_avatar: {
    label: 'Avatar Updated',
    badgeBg: 'bg-teal-500/10 border-teal-500/30',
    textColor: 'text-teal-400',
    icon: Camera,
  },
  user_change_password: {
    label: 'Password Changed',
    badgeBg: 'bg-rose-500/10 border-rose-500/30',
    textColor: 'text-rose-400',
    icon: Key,
  },
  snippet_comment: {
    label: 'Snippet Comment',
    badgeBg: 'bg-cyan-500/10 border-cyan-500/30',
    textColor: 'text-cyan-400',
    icon: MessageSquare,
  },
};

export function ManageActivityLogs() {
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActionType, setSelectedActionType] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  // Modal for detailed log inspection
  const [selectedLog, setSelectedLog] = useState<ActivityLogItem | null>(null);

  const fetchLogs = async (overrideParams?: { page?: number; search?: string; actionType?: string }) => {
    try {
      setLoading(true);
      const currentPage = overrideParams?.page !== undefined ? overrideParams.page : page;
      const currentSearch = overrideParams?.search !== undefined ? overrideParams.search : searchQuery;
      const currentActionType = overrideParams?.actionType !== undefined ? overrideParams.actionType : selectedActionType;

      const res = await getActivityLogs({
        page: currentPage,
        limit: 15,
        actionType: currentActionType !== 'all' ? currentActionType : undefined,
        search: currentSearch || undefined,
      });

      if (res.success) {
        setLogs(res.logs || res.data || []);
        if (res.pagination) {
          setTotalPages(res.pagination.pages || 1);
          setTotalLogs(res.pagination.total || 0);
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, selectedActionType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs({ page: 1 });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedActionType('all');
    setPage(1);
    fetchLogs({ page: 1, search: '', actionType: 'all' });
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Layout>
      <div className="p-6 lg:p-8 bg-gray-900 min-h-screen w-full">
        <div className="w-full mx-auto">
          {/* Header section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/20">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white">System Activity Logs</h1>
                  <p className="text-gray-400 text-sm mt-0.5">
                    Audit log of payments, snippet actions, user registrations, and comments.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => fetchLogs()}
              className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white rounded-xl border border-gray-700 transition-colors text-sm font-medium cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Logs
            </button>
          </div>

          {/* Action Type Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 custom-scrollbar">
            <button
              type="button"
              onClick={() => {
                setSelectedActionType('all');
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                selectedActionType === 'all'
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/20'
                  : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700/80 hover:text-white'
              }`}
            >
              All Events ({totalLogs})
            </button>
            {Object.entries(actionTypeConfig).map(([typeKey, config]) => {
              const Icon = config.icon;
              const isSelected = selectedActionType === typeKey;
              return (
                <button
                  key={typeKey}
                  type="button"
                  onClick={() => {
                    setSelectedActionType(typeKey);
                    setPage(1);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                    isSelected
                      ? `${config.badgeBg} ${config.textColor} border-current shadow-sm`
                      : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700/80 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {config.label}
                </button>
              );
            })}
          </div>

          {/* Search bar & filter summary */}
          <div className="bg-gray-800 border border-gray-700/80 rounded-2xl p-4 mb-6">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search log description, user name, email, or details..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 text-white placeholder-gray-500 rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition-colors cursor-pointer"
                >
                  Search
                </button>
                {(searchQuery || selectedActionType !== 'all') && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-xl font-medium text-sm transition-colors cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Logs Table */}
          <div className="bg-gray-800 border border-gray-700/80 rounded-2xl overflow-hidden shadow-xl">
            {loading ? (
              <div className="py-16 text-center">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-3" />
                <p className="text-gray-400 text-sm font-medium">Fetching system activity logs...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="py-16 text-center px-4">
                <div className="w-12 h-12 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                  <Filter className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">No Activity Logs Found</h3>
                <p className="text-gray-400 text-sm max-w-md mx-auto mb-4">
                  No system logs matched your query. Try clearing search filters or perform actions like creating a snippet or registering a user.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-900/60 border-b border-gray-700 text-xs font-bold uppercase tracking-wider text-gray-400">
                      <th className="px-6 py-4">Event Type</th>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Description</th>
                      <th className="px-6 py-4">Timestamp</th>
                      <th className="px-6 py-4 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/60 text-sm">
                    {logs.map((log) => {
                      const cfg = actionTypeConfig[log.actionType] || {
                        label: log.actionType,
                        badgeBg: 'bg-gray-700 border-gray-600',
                        textColor: 'text-gray-300',
                        icon: Activity,
                      };
                      const Icon = cfg.icon;

                      return (
                        <tr key={log._id} className="hover:bg-gray-700/30 transition-colors">
                          {/* Event Type Badge */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.badgeBg} ${cfg.textColor}`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                              {cfg.label}
                            </span>
                          </td>

                          {/* User Column */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            {log.user ? (
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-blue-600/30 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs uppercase overflow-hidden flex-shrink-0">
                                  {log.user.avatar ? (
                                    <img
                                      src={log.user.avatar}
                                      alt={log.user.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    log.user.name?.charAt(0) || 'U'
                                  )}
                                </div>
                                <div>
                                  <p className="font-semibold text-white text-xs">{log.user.name || 'User'}</p>
                                  <p className="text-gray-400 text-xs">@{log.user.username || 'unknown'}</p>
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400 italic text-xs">System / Anonymous</span>
                            )}
                          </td>

                          {/* Description */}
                          <td className="px-6 py-4">
                            <p className="text-gray-200 font-medium text-xs max-w-md line-clamp-2">
                              {log.description}
                            </p>
                          </td>

                          {/* Timestamp */}
                          <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400">
                            {formatDate(log.createdAt)}
                          </td>

                          {/* Actions / View Details */}
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedLog(log)}
                              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                              title="Inspect Details"
                            >
                              <Info className="w-4 h-4 text-blue-400" />
                            </button>
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
              <div className="flex items-center justify-between px-6 py-4 bg-gray-900/60 border-t border-gray-700">
                <span className="text-xs text-gray-400">
                  Page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages}</strong> ({totalLogs} total events)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    className="p-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                    className="p-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-gray-700 bg-gray-900/80">
              <div className="flex items-center gap-2.5">
                <Activity className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white text-base">Activity Log Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="text-gray-400 font-semibold uppercase tracking-wider block mb-1">
                  Event Description
                </label>
                <div className="p-3 bg-gray-900 rounded-xl border border-gray-700 text-gray-200 font-medium">
                  {selectedLog.description}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 font-semibold uppercase tracking-wider block mb-1">
                    Event Type
                  </label>
                  <div className="p-2.5 bg-gray-900 rounded-xl border border-gray-700 text-white font-bold capitalize">
                    {selectedLog.actionType.replace('_', ' ')}
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 font-semibold uppercase tracking-wider block mb-1">
                    Timestamp
                  </label>
                  <div className="p-2.5 bg-gray-900 rounded-xl border border-gray-700 text-gray-300">
                    {formatDate(selectedLog.createdAt)}
                  </div>
                </div>
              </div>

              {selectedLog.user && (
                <div>
                  <label className="text-gray-400 font-semibold uppercase tracking-wider block mb-1">
                    Performed By User
                  </label>
                  <div className="p-3 bg-gray-900 rounded-xl border border-gray-700 flex items-center justify-between text-gray-200">
                    <div>
                      <p className="font-bold text-white">{selectedLog.user.name}</p>
                      <p className="text-gray-400">@{selectedLog.user.username} ({selectedLog.user.email})</p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold uppercase">
                      {selectedLog.user.role || 'user'}
                    </span>
                  </div>
                </div>
              )}

              {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                <div>
                  <label className="text-gray-400 font-semibold uppercase tracking-wider block mb-1">
                    Payload Metadata
                  </label>
                  <pre className="p-3 bg-gray-950 rounded-xl border border-gray-800 text-green-400 font-mono text-[11px] overflow-x-auto">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-700 bg-gray-900/60 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
