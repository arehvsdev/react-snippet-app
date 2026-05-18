import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface AuthLayoutProps {
  children: ReactNode;
  type: "login" | "register";
}

const AuthLayout = ({ children, type }: AuthLayoutProps) => {
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
        </nav>
      </header>
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
    </div>
  );
};

export default AuthLayout;
