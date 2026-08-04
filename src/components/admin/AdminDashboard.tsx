import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../../pages/Layout';
import { Users, Code2, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { 
  getDashboardSummary, 
  getDashboardUserGrowth, 
  getDashboardSnippetLanguages, 
  getDashboardWeeklyActivity 
} from '../../services/adminDashboardService';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280'];

export function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dashboard states
  const [summary, setSummary] = useState<any>({
    totalUsers: { value: 0, change: "+0.0%" },
    totalSnippets: { value: 0, change: "+0.0%" },
    totalViews: { value: 0, change: "+0.0%" },
    snippetsCreatedToday: { value: 0, change: "Created today" }
  });
  const [userGrowthData, setUserGrowthData] = useState<any[]>([]);
  const [growthRange, setGrowthRange] = useState<number>(6);
  const [snippetsByLanguage, setSnippetsByLanguage] = useState<any[]>([]);
  const [activityData, setActivityData] = useState<any[]>([]);

  const fetchGrowthData = async (range: number) => {
    try {
      const res = await getDashboardUserGrowth(range);
      if (res.success && Array.isArray(res.data)) {
        setUserGrowthData(res.data);
      }
    } catch (err: any) {
      console.error("Growth data fetch error:", err);
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Perform concurrent queries for optimal query times
      const [summaryRes, growthRes, langsRes, activityRes] = await Promise.all([
        getDashboardSummary(),
        getDashboardUserGrowth(growthRange),
        getDashboardSnippetLanguages(),
        getDashboardWeeklyActivity()
      ]);

      if (summaryRes.success && summaryRes.data) {
        setSummary(summaryRes.data);
      }
      if (growthRes.success && Array.isArray(growthRes.data)) {
        setUserGrowthData(growthRes.data);
      }
      if (langsRes.success && Array.isArray(langsRes.data)) {
        // Map backend keys { language: string, count: number } to Recharts { name, value }
        const mappedLangs = langsRes.data.map((item: any) => ({
          name: item.language,
          value: item.count
        }));
        setSnippetsByLanguage(mappedLangs);
      }
      if (activityRes.success && Array.isArray(activityRes.data)) {
        // Map backend keys { day: string, newSnippets: number, views: number } to Recharts { day, snippets, views }
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
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8 bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Users</p>
                  <p className="text-3xl font-bold text-white">
                    {(summary.totalUsers?.value ?? 0).toLocaleString()}
                  </p>
                  <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    {summary.totalUsers?.change ?? "+0.0%"} from last month
                  </p>
                </div>
                <div className="bg-blue-600/20 p-3 rounded-lg">
                  <Users className="w-8 h-8 text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Snippets</p>
                  <p className="text-3xl font-bold text-white">
                    {(summary.totalSnippets?.value ?? 0).toLocaleString()}
                  </p>
                  <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    {summary.totalSnippets?.change ?? "+0.0%"} from last month
                  </p>
                </div>
                <div className="bg-green-600/20 p-3 rounded-lg">
                  <Code2 className="w-8 h-8 text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Snippets Created Today</p>
                  <p className="text-3xl font-bold text-white">
                    {(summary.snippetsCreatedToday?.value ?? 0).toLocaleString()}
                  </p>
                  <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    {summary.snippetsCreatedToday?.change ?? "Created today"}
                  </p>
                </div>
                <div className="bg-orange-600/20 p-3 rounded-lg">
                  <Code2 className="w-8 h-8 text-orange-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* User Growth Chart */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
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
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
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
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
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

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            <Link
              to="/admin/languages"
              className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:bg-gray-700 transition-colors"
            >
              <h3 className="text-lg font-semibold text-white mb-2">Manage Languages</h3>
              <p className="text-gray-400 text-sm">Add or edit programming languages</p>
            </Link>
            <Link
              to="/admin/tags"
              className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:bg-gray-700 transition-colors"
            >
              <h3 className="text-lg font-semibold text-white mb-2">Manage Tags</h3>
              <p className="text-gray-400 text-sm">Create and organize tags</p>
            </Link>
            <Link
              to="/admin/categories"
              className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:bg-gray-700 transition-colors"
            >
              <h3 className="text-lg font-semibold text-white mb-2">Manage Categories</h3>
              <p className="text-gray-400 text-sm">Create and organize categories</p>
            </Link>
            <Link
              to="/admin/users"
              className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:bg-gray-700 transition-colors"
            >
              <h3 className="text-lg font-semibold text-white mb-2">Manage Users</h3>
              <p className="text-gray-400 text-sm">View and manage user accounts</p>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
