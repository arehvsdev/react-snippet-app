import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../src/layouts/AuthContext";


interface AuthLayoutProps {
  children: React.ReactNode;
  type?: "login" | "register";
}

const AuthLayout = ({ children, type }: AuthLayoutProps) => {
  const { logout, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    try {
      logout();
      toast.success("Logged out successfully!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const title = type === "login" ? "Welcome back" : "Create account";
  const subtitle =
    type === "login"
      ? "Sign in to continue to your profile."
      : "Join us and get started in a few steps.";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-gray-800">
            SnippetApp
          </Link>
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <Link
                to="/profile"
                className="text-gray-600 hover:text-gray-800"
              >
                Profile
              </Link>
              <Link
                to="/snippet-feed"
                className="text-gray-600 hover:text-gray-800"
              >
                Snippet Feed
              </Link>
              <Link
                to="/create-snippet"
                className="text-gray-600 hover:text-gray-800"
              >
                Create Snippet
              </Link>
              <button
                onClick={handleLogout}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 font-semibold"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-600 hover:text-gray-800">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 font-semibold"
              >
                Register
              </Link>
            </div>
          )}
        </nav>
      </header>
      {type ? (
        <main className="flex-grow grid md:grid-cols-2">
          <section
            className={`${type}-left-panel hidden md:flex items-center justify-center p-10 text-white`}
          >
            <div className="relative z-10 max-w-md">
              <h1 className="text-4xl font-bold mb-4">{title}</h1>
              <p className="text-white/80">{subtitle}</p>
              {type === "login" ? (
                <p className="mt-6 text-white/80">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="font-semibold text-white hover:underline"
                  >
                    Register
                  </Link>
                </p>
              ) : (
                <p className="mt-6 text-white/80">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-white hover:underline"
                  >
                    Login
                  </Link>
                </p>
              )}
            </div>
          </section>

          <section className="flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm">
              {children}
            </div>
          </section>
        </main>
      ) : (
        <main className="flex-grow container mx-auto p-6">
          <div>{children}</div>
        </main>
      )}
    </div>
  );
};

export default AuthLayout;
