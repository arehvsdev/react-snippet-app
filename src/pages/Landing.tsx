import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, Sparkles, Globe, Lock } from 'lucide-react';
import { useAuth } from '../layouts/AuthContext';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import './login.css';

export function Landing() {
  const navigate = useNavigate();
  const auth = useAuth();
  
  // State for toggling between Login and Register views
  const [isLogin, setIsLogin] = useState(true);

  // Redirect to dashboard/feed if user is already authenticated
  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate('/snippet-feed');
    }
  }, [auth.isAuthenticated, navigate]);

  return (
    <div className="h-screen flex flex-col bg-[#1e2939] text-white overflow-hidden">
      <main className="flex-grow grid md:grid-cols-12 h-full overflow-hidden">
        {/* Left Side - Branding (uses same gradient background as the login page) */}
        <section className="login-left-panel hidden md:flex md:col-span-5 lg:col-span-5 items-center justify-center p-8 lg:p-12 text-white h-full">
          <div className="relative z-10 max-w-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-white/10 p-2.5 rounded-2xl border border-white/20">
                <Code2 className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">CodeSnippets</h1>
            </div>

            <h2 className="text-3xl lg:text-4xl font-black text-white mb-4 leading-tight">
              {isLogin ? 'Welcome Back!' : 'Join Our Community'}
            </h2>
            <p className="text-base text-white/80 mb-8 leading-relaxed">
              {isLogin
                ? 'Sign in to access your personal collection of code snippets, share with the community, and discover new solutions.'
                : 'Create an account to start building your code snippet library, collaborate with developers worldwide, and boost your productivity.'}
            </p>

            {/* Feature Bullets */}
            <div className="space-y-3.5 w-full">
              <div className="flex items-center gap-3.5">
                <div className="bg-white/10 p-2 rounded-xl border border-white/10">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/90 text-sm font-medium">Save and organize your favorite snippets</span>
              </div>
              <div className="flex items-center gap-3.5">
                <div className="bg-white/10 p-2 rounded-xl border border-white/10">
                  <Globe className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/90 text-sm font-medium">Share publicly with the world or keep them private</span>
              </div>
              <div className="flex items-center gap-3.5">
                <div className="bg-white/10 p-2 rounded-xl border border-white/10">
                  <Lock className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/90 text-sm font-medium">Secure storage, accessible from anywhere</span>
              </div>
            </div>
          </div>
        </section>

        {/* Right Side - Interactive Login/Register Form Card */}
        <section className="flex md:col-span-7 lg:col-span-7 items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#1e2939] h-full overflow-y-auto">
          <div className="w-full max-w-lg bg-[#2d2f31] border border-white/10 p-6 sm:p-7 rounded-2xl shadow-xl max-h-full flex flex-col my-auto">
            {/* Logo for mobile view */}
            <div className="md:hidden flex justify-center mb-4">
              <div className="bg-[#2563eb] p-2 rounded-xl">
                <Code2 className="w-7 h-7 text-white" />
              </div>
            </div>

            {/* Toggle Tabs */}
            <div className="flex gap-2 mb-5 bg-[#141d2b] p-1 rounded-lg border border-white/5 shrink-0">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-1.5 px-4 rounded-md text-sm font-semibold transition-all duration-200 ${
                  isLogin ? 'bg-[#2563eb] text-white shadow-md' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-1.5 px-4 rounded-md text-sm font-semibold transition-all duration-200 ${
                  !isLogin ? 'bg-[#2563eb] text-white shadow-md' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Register
              </button>
            </div>

            {/* Form rendering container */}
            <div className="overflow-y-auto pr-0.5 custom-scrollbar flex-grow">
              {isLogin ? (
                <div>
                  <LoginForm />
                  <p className="text-center text-xs sm:text-sm text-gray-400 mt-4">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setIsLogin(false)}
                      className="text-[#2563eb] font-semibold hover:underline"
                    >
                      Create one now
                    </button>
                  </p>
                </div>
              ) : (
                <div>
                  <RegisterForm />
                  <p className="text-center text-xs sm:text-sm text-gray-400 mt-4">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setIsLogin(true)}
                      className="text-[#2563eb] font-semibold hover:underline"
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}