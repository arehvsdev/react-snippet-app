import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";

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
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  updateUser: (userData: User) => void;
  setPlan: (plan: "FREE" | "PRO") => void;
  togglePlan: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (!parsed.plan) {
        parsed.plan = "FREE";
      }
      setUser(parsed);
    }
  }, []);

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
    navigate("/profile");
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
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

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    updateUser,
    setPlan,
    togglePlan,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};