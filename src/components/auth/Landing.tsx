import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Code2, Sparkles, Globe, Lock } from 'lucide-react';

export function Landing() {
  const navigate = useNavigate();
  
  // 1. State for toggling between Login and Register views
  const [isLogin, setIsLogin] = useState(true);

  // 2. React State (useState) to track form data instead of react-hook-form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regDob, setRegDob] = useState('');
  const [regTitle, setRegTitle] = useState('');
  const [regRole, setRegRole] = useState('');

  // 3. State to show validation errors to the user
  const [error, setError] = useState('');

  // 4. Handle Login Form Submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page refresh
    
    // Basic validation
    if (!loginEmail || !loginPassword) {
      setError('Please fill in both email and password.');
      return;
    }
    setError('');
    console.log('Login:', { email: loginEmail, password: loginPassword });
    navigate('/');
  };

  // 5. Handle Register Form Submission
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page refresh

    // Validation
    if (!regName || !regEmail || !regPassword || !regRole) {
      setError('Please fill in all required fields.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    console.log('Register:', { name: regName, email: regEmail, role: regRole });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
        {/* Left Side - Branding */}
        <div className="flex flex-col justify-center items-start px-8 lg:px-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-blue-600 p-4 rounded-2xl">
              <Code2 className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white">CodeSnippets</h1>
          </div>

          <h2 className="text-4xl font-bold text-white mb-4">
            {isLogin ? 'Welcome Back!' : 'Join Our Community'}
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            {isLogin
              ? 'Sign in to access your personal collection of code snippets, share with the community, and discover new solutions.'
              : 'Create an account to start building your code snippet library, collaborate with developers worldwide, and boost your productivity.'}
          </p>

          <div className="space-y-4 mb-12">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600/20 p-2 rounded-lg border border-blue-500/30">
                <Sparkles className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-gray-200">Save and organize your favorite code snippets</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-green-600/20 p-2 rounded-lg border border-green-500/30">
                <Globe className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-gray-200">Share publicly or keep them private</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-purple-600/20 p-2 rounded-lg border border-purple-500/30">
                <Lock className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-gray-200">Secure and accessible from anywhere</span>
            </div>
          </div>
        </div>

        {/* Right Side - Forms */}
        <div className="flex items-center justify-center px-8">
          <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 p-8">
            {/* Toggle Tabs */}
            <div className="flex gap-2 mb-8 bg-gray-900 p-1 rounded-lg">
              <button
                onClick={() => { setIsLogin(true); setError(''); }}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                  isLogin ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => { setIsLogin(false); setError(''); }}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                  !isLogin ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Register
              </button>
            </div>

            {/* Show any validation errors */}
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* Login Form */}
            {isLogin ? (
              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-white placeholder-gray-500"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-white placeholder-gray-500"
                    placeholder="Enter your password"
                  />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg">
                  Sign In
                </button>
                <p className="text-center text-sm text-gray-400">
                  Don't have an account?{' '}
                  <button type="button" onClick={() => setIsLogin(false)} className="text-blue-400 font-medium hover:underline">
                    Create one now
                  </button>
                </p>
              </form>
            ) : (
              /* Register Form */
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-white placeholder-gray-500"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email Address <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-white placeholder-gray-500"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={regDob}
                    onChange={(e) => setRegDob(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Job Title</label>
                  <input
                    type="text"
                    value={regTitle}
                    onChange={(e) => setRegTitle(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-white placeholder-gray-500"
                    placeholder="e.g., Software Developer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Role <span className="text-red-500">*</span></label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-white"
                  >
                    <option value="">Select a role</option>
                    <option value="developer">Developer</option>
                    <option value="designer">Designer</option>
                    <option value="manager">Manager</option>
                    <option value="student">Student</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Password <span className="text-red-500">*</span></label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-white placeholder-gray-500"
                    placeholder="Create a strong password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password <span className="text-red-500">*</span></label>
                  <input
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-white placeholder-gray-500"
                    placeholder="Confirm your password"
                  />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg">
                  Create Account
                </button>
                <p className="text-center text-sm text-gray-400">
                  Already have an account?{' '}
                  <button type="button" onClick={() => setIsLogin(true)} className="text-blue-400 font-medium hover:underline">
                    Sign in
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Stats Section */}
      <div className="bg-gray-800 border-t border-gray-700 py-8">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">50,000+</div>
              <div className="text-gray-400">Code Snippets</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">25+</div>
              <div className="text-gray-400">Programming Languages</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400 mb-2">10,000+</div>
              <div className="text-gray-400">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-400 mb-2">100%</div>
              <div className="text-gray-400">Free to Use</div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-700">
            <p className="text-center text-sm text-gray-400 mb-3">Supported Languages:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'Go', 'Rust', 'PHP', 'Swift', 'Kotlin'].map((lang) => (
                <span
                  key={lang}
                  className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm font-medium border border-gray-600"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
