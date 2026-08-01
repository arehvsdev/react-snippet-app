import { useEffect } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface AuthLayoutProps {
  children: React.ReactNode;
  type?: "login" | "register";
}

const AuthLayout = ({ children, type }: AuthLayoutProps) => {
  useEffect(() => {
    toast.dismiss();
  }, [type]);

  const title = type === "login" ? "Welcome back" : "Create account";
  const subtitle =
    type === "login"
      ? "Sign in to continue to your profile."
      : "Join us and get started in a few steps.";

  return (
    <div className="min-h-screen flex flex-col bg-[#202124] text-white">
      {!type && <Navbar />}
      {type ? (
        <main className="flex-grow grid md:grid-cols-2">
          <section
            className={`${type}-left-panel hidden md:flex items-center justify-center p-10 text-white`}
          >
            <div className="relative z-10 max-w-md">
              <div className="mb-6">
                <img
                  alt="SnippetApp Logo"
                  src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                  className="h-12 w-auto"
                />
              </div>
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
            <div className="w-full max-w-md bg-[#2d2f31] border border-white/10 p-8 rounded-2xl shadow-sm">
              <div className="md:hidden flex justify-center mb-6">
                <img
                  alt="SnippetApp Logo"
                  src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                  className="h-10 w-auto"
                />
              </div>
              {children}
            </div>
          </section>
          <Footer />
        </main>
      ) : (
        <main className="flex-grow container mx-auto p-6 flex flex-col">
          <div className="flex-grow">{children}</div>
          <Footer />
        </main>
      )}
    </div>
  );
};

export default AuthLayout;
