import { Layout } from '../../pages/Layout';
import { Users, Code2, Eye, TrendingUp, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const userGrowthData = [
  { month: 'Jan', users: 1200 },
  { month: 'Feb', users: 1800 },
  { month: 'Mar', users: 2400 },
  { month: 'Apr', users: 3200 },
  { month: 'May', users: 4100 },
  { month: 'Jun', users: 5300 },
];

const snippetsByLanguage = [
  { name: 'JavaScript', value: 450 },
  { name: 'TypeScript', value: 320 },
  { name: 'Python', value: 280 },
  { name: 'Java', value: 150 },
  { name: 'Go', value: 120 },
  { name: 'Others', value: 180 },
];

const activityData = [
  { day: 'Mon', snippets: 45, views: 1200 },
  { day: 'Tue', snippets: 52, views: 1400 },
  { day: 'Wed', snippets: 38, views: 980 },
  { day: 'Thu', snippets: 61, views: 1650 },
  { day: 'Fri', snippets: 55, views: 1520 },
  { day: 'Sat', snippets: 42, views: 1100 },
  { day: 'Sun', snippets: 35, views: 890 },
];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280'];

export function AdminDashboard() {
  return (
    <Layout>
      <div className="p-8 bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Users</p>
                  <p className="text-3xl font-bold text-white">5,342</p>
                  <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    +12.5% from last month
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
                  <p className="text-3xl font-bold text-white">12,847</p>
                  <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    +8.3% from last month
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
                  <p className="text-gray-400 text-sm mb-1">Total Views</p>
                  <p className="text-3xl font-bold text-white">234,521</p>
                  <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    +15.2% from last month
                  </p>
                </div>
                <div className="bg-purple-600/20 p-3 rounded-lg">
                  <Eye className="w-8 h-8 text-purple-400" />
                </div>
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Active Today</p>
                  <p className="text-3xl font-bold text-white">892</p>
                  <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
                    <Activity className="w-4 h-4" />
                    Users online now
                  </p>
                </div>
                <div className="bg-orange-600/20 p-3 rounded-lg">
                  <Activity className="w-8 h-8 text-orange-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* User Growth Chart */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">User Growth</h3>
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
            </div>

            {/* Snippets by Language */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Snippets by Language</h3>
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
            </div>
          </div>

          {/* Activity Chart */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Weekly Activity</h3>
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
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <a
              href="/admin/languages"
              className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:bg-gray-700 transition-colors"
            >
              <h3 className="text-lg font-semibold text-white mb-2">Manage Languages</h3>
              <p className="text-gray-400 text-sm">Add or edit programming languages</p>
            </a>
            <a
              href="/admin/tags"
              className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:bg-gray-700 transition-colors"
            >
              <h3 className="text-lg font-semibold text-white mb-2">Manage Tags</h3>
              <p className="text-gray-400 text-sm">Create and organize tags</p>
            </a>
            <a
              href="/admin/users"
              className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:bg-gray-700 transition-colors"
            >
              <h3 className="text-lg font-semibold text-white mb-2">Manage Users</h3>
              <p className="text-gray-400 text-sm">View and manage user accounts</p>
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}
