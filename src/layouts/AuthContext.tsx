import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { getSubscription } from "../services/paymentService";
import { getMe, type UserProfileResponse } from "../services/authService";
import { Loader2 } from "lucide-react";

export interface User {
  uid: string;
  id?: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  createdAt: string;
  username?: string;
  bio?: string;
  avatar?: string;
  plan?: "FREE" | "PRO";
}

interface AuthContextType {
  user: User | null;
  login: (userData: User & { token?: string }) => void;
  logout: () => void;
  isAuthenticated: boolean;
  updateUser: (userData: User) => void;
  setPlan: (plan: "FREE" | "PRO") => void;
  togglePlan: () => void;
  /** Fetches live subscription from backend and syncs AuthContext + localStorage. */
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  /**
   * Validates stored JWT session token on app startup via GET /api/auth/me.
   * Does NOT trust localStorage user payload alone.
   */
  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        localStorage.removeItem("user");
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const currentUser: UserProfileResponse = await getMe();
        localStorage.setItem("user", JSON.stringify(currentUser));
        setUser(currentUser);
      } catch {
        // Token is invalid or expired: purge credentials
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    validateSession();
  }, []);

  /**
   * Authenticates user upon login form submission & persists token.
   */
  const login = (userData: User & { token?: string }) => {
    const { token, ...userWithoutToken } = userData;
    if (!userWithoutToken.plan) {
      userWithoutToken.plan = "FREE";
    }
    if (token) {
      localStorage.setItem("token", token);
    }
    localStorage.setItem("user", JSON.stringify(userWithoutToken));
    setUser(userWithoutToken);
    setTimeout(() => {
      refreshSubscription();
    }, 500);
    navigate("/snippet-feed");
  };

  /**
   * Signs out the authenticated user and clears localStorage credentials.
   */
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  const updateUser = (userData: User) => {
    const updated = { ...userData, plan: userData.plan || user?.plan || "FREE" };
    localStorage.setItem("user", JSON.stringify(updated));
    setUser(updated);
  };

  const setPlan = (newPlan: "FREE" | "PRO") => {
    if (!user) return;
    const updated = { ...user, plan: newPlan };
    localStorage.setItem("user", JSON.stringify(updated));
    setUser(updated);
  };

  const togglePlan = () => {
    if (!user) return;
    const newPlan = user.plan === "PRO" ? "FREE" : "PRO";
    setPlan(newPlan);
  };

  /**
   * Synchronizes the authenticated user's subscription with the backend.
   * Dispatches 'subscription-updated' global window event on update.
   */
  const refreshSubscription = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const subscription = await getSubscription();
      setUser((previousUser) => {
        if (!previousUser) return previousUser;

        const updatedUser = {
          ...previousUser,
          plan: subscription.plan,
        };

        localStorage.setItem("user", JSON.stringify(updatedUser));
        return updatedUser;
      });

      // Broadcast subscription update event across components
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("subscription-updated", { detail: subscription }));
      }
    } catch {
      // Silently fail — UI preserves current state
    }
  }, []);

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    updateUser,
    setPlan,
    togglePlan,
    refreshSubscription,
  };

  // Render loading screen while validating session token on startup
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto" />
          <p className="text-gray-400 text-sm font-medium">Validating session token...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};