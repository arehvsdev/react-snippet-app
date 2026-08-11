import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../pages/Layout';
import { Users, Code2, AlertCircle, Loader2, Tag, FileText, Globe } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { 
  getDashboardSummary, 
  getDashboardUserGrowth, 
  getDashboardSnippetLanguages, 
  getDashboardWeeklyActivity 
} from '../../services/adminDashboardService';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280'];

export function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dashboard states
  const [summary, setSummary] = useState<any>({
    totalUsers: { value: 0, change: "+0.0%" },
    totalSnippets: { value: 0, change: "+0.0%" },
    totalLanguages: 0,
    totalTags: 0,
    snippetsCreatedToday: { value: 0, change: "Created today" }
  });
  const [userGrowthData, setUserGrowthData] = useState<any[]>([]);
  const [snippetsByLanguage, setSnippetsByLanguage] = useState<any[]>([]);
  const [activityData, setActivityData] = useState<any[]>([]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Perform concurrent queries for optimal query times
      const [summaryRes, growthRes, langsRes, activityRes] = await Promise.all([
        getDashboardSummary(),
        getDashboardUserGrowth(),
        getDashboardSnippetLanguages(),
        getDashboardWeeklyActivity()
      ]);

      if (summaryRes.success && summaryRes.data) {
        setSummary(summaryRes.data);
      } else if (summaryRes && (summaryRes.totalLanguages !== undefined || summaryRes.totalUsers !== undefined)) {
        setSummary(summaryRes);
      }
      if (growthRes.success && Array.isArray(growthRes.data)) {
        setUserGrowthData(growthRes.data);
      }
      if (langsRes.success && Array.isArray(langsRes.data)) {
        const langMap = new Map<string, { name: string; value: number }>();
        langsRes.data.forEach((item: any) => {
          const name = item.language || 'Unknown';
          const lowerKey = name.toLowerCase();
          if (langMap.has(lowerKey)) {
            langMap.get(lowerKey)!.value += item.count;
          } else {
            langMap.set(lowerKey, { name, value: item.count });
          }
        });
        setSnippetsByLanguage(Array.from(langMap.values()).sort((a, b) => b.value - a.value));
      }
      if (activityRes.success && Array.isArray(activityRes.data)) {
        const mappedActivity = activityRes.data.map((item: any) => ({
          day: item.day,
          snippets: item.newSnippets,
          views: item.views
        }));
        setActivityData(mappedActivity);
      }
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      setError(err.message || "Failed to load dashboard statistics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="p-8 bg-gray-900 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-400 text-sm font-medium">Loading admin dashboard statistics...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-8 bg-gray-900 min-h-screen flex items-center justify-center">
          <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-lg max-w-md w-full text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Error Loading Dashboard</h3>
            <p className="text-gray-400 text-sm mb-6">{error}</p>
            <button
              onClick={fetchStats}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium text-sm cursor-pointer"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const usersCount = typeof summary.totalUsers === 'object' ? (summary.totalUsers?.value ?? 0) : (summary.totalUsers ?? 0);
  const snippetsCount = typeof summary.totalSnippets === 'object' ? (summary.totalSnippets?.value ?? 0) : (summary.totalSnippets ?? 0);
  const languagesCount = typeof summary.totalLanguages === 'object' ? (summary.totalLanguages?.value ?? 0) : (summary.totalLanguages ?? summary.activeLanguages ?? 0);
  const tagsCount = typeof summary.totalTags === 'object' ? (summary.totalTags?.value ?? 0) : (summary.totalTags ?? summary.activeTags ?? 0);

  return (
    <Layout>
      <div className="p-8 bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">Overview of platform metrics, growth analytics, and content counts.</p>
          </div>

          {/* Interactive Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
            {/* Total Users */}
            <div 
              onClick={() => navigate('/admin/users')}
              className="bg-gray-800 border border-gray-700 hover:border-blue-500/50 rounded-xl p-5 shadow-lg transition-all cursor-pointer hover:scale-[1.02] group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs font-medium mb-1">Total Users</p>
                  <p className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
                    {usersCount.toLocaleString()}
                  </p>
                  <p className="text-blue-400 text-xs mt-2 flex items-center gap-1 font-medium">
                    Manage users &rarr;
                  </p>
                </div>
                <div className="bg-blue-600/20 p-3 rounded-xl border border-blue-500/20">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </div>

            {/* Total Snippets */}
            <div 
              onClick={() => navigate('/snippet-feed')}
              className="bg-gray-800 border border-gray-700 hover:border-green-500/50 rounded-xl p-5 shadow-lg transition-all cursor-pointer hover:scale-[1.02] group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs font-medium mb-1">Total Snippets</p>
                  <p className="text-2xl font-bold text-white group-hover:text-green-400 transition-colors">
                    {snippetsCount.toLocaleString()}
                  </p>
                  <p className="text-green-400 text-xs mt-2 flex items-center gap-1 font-medium">
                    View feed &rarr;
                  </p>
                </div>
                <div className="bg-green-600/20 p-3 rounded-xl border border-green-500/20">
                  <Code2 className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </div>

            {/* Languages Count */}
            <div 
              onClick={() => navigate('/admin/languages')}
              className="bg-gray-800 border border-gray-700 hover:border-indigo-500/50 rounded-xl p-5 shadow-lg transition-all cursor-pointer hover:scale-[1.02] group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs font-medium mb-1">Languages</p>
                  <p className="text-2xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                    {languagesCount.toLocaleString()}
                  </p>
                  <p className="text-indigo-400 text-xs mt-2 flex items-center gap-1 font-medium">
                    Manage languages &rarr;
                  </p>
                </div>
                <div className="bg-indigo-600/20 p-3 rounded-xl border border-indigo-500/20">
                  <Globe className="w-6 h-6 text-indigo-400" />
                </div>
              </div>
            </div>

            {/* Tags Count */}
            <div 
              onClick={() => navigate('/admin/tags')}
              className="bg-gray-800 border border-gray-700 hover:border-purple-500/50 rounded-xl p-5 shadow-lg transition-all cursor-pointer hover:scale-[1.02] group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs font-medium mb-1">Tags</p>
                  <p className="text-2xl font-bold text-white group-hover:text-purple-400 transition-colors">
                    {tagsCount.toLocaleString()}
                  </p>
                  <p className="text-purple-400 text-xs mt-2 flex items-center gap-1 font-medium">
                    Manage tags &rarr;
                  </p>
                </div>
                <div className="bg-purple-600/20 p-3 rounded-xl border border-purple-500/20">
                  <Tag className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </div>

            {/* System Audit Logs */}
            <div 
              onClick={() => navigate('/admin/logs')}
              className="bg-gray-800 border border-gray-700 hover:border-amber-500/50 rounded-xl p-5 shadow-lg transition-all cursor-pointer hover:scale-[1.02] group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs font-medium mb-1">System Logs</p>
                  <p className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                    Audit Logs
                  </p>
                  <p className="text-amber-400 text-xs mt-2 flex items-center gap-1 font-medium">
                    View logs &rarr;
                  </p>
                </div>
                <div className="bg-amber-600/20 p-3 rounded-xl border border-amber-500/20">
                  <FileText className="w-6 h-6 text-amber-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* User Growth Chart */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-white mb-4">User Growth</h3>
              {userGrowthData.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-gray-500 text-sm">
                  No Data Available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Snippets by Language */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-white mb-4">Snippets by Language</h3>
              {snippetsByLanguage.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-gray-500 text-sm">
                  No Data Available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={snippetsByLanguage}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {snippetsByLanguage.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Activity Chart */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-4">Weekly Activity</h3>
            {activityData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-gray-500 text-sm">
                No Data Available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="day" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="snippets" fill="#3B82F6" name="New Snippets" />
                  <Bar dataKey="views" fill="#10B981" name="Total Views" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
