/**
 * Auth & Subscription Redux Integration Facade (useAuth hook)
 * Serves as a React Context wrapper connecting components seamlessly to the Redux store.
 * Delegates all state reads (`user`, `isAuthenticated`, `loading`) and state updates (`login`, `logout`, `setPlan`)
 * to Redux actions and async thunks.
 */
import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store";
import {
  validateSession,
  setUser,
  logout as logoutAction,
  updateUser as updateUserAction,
  setPlan as setPlanAction,
  togglePlan as togglePlanAction,
  refreshSubscriptionThunk,
  type User,
} from "../store/authSlice";

export type { User };

interface AuthContextType {
  user: User | null;
  login: (userData: User & { token?: string }) => void;
  logout: () => void;
  isAuthenticated: boolean;
  updateUser: (userData: User) => void;
  setPlan: (plan: "FREE" | "PRO") => void;
  togglePlan: () => void;
  /** Fetches live subscription from backend and syncs Redux store + localStorage. */
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider Component
 * Subscribes to Redux state via `useAppSelector` and dispatches Redux actions.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Read state directly from Redux Toolkit store
  const { user, loading, isAuthenticated } = useAppSelector((state) => state.auth);

  /**
   * Validates stored JWT session token on app startup via Redux thunk.
   */
  useEffect(() => {
    dispatch(validateSession());
  }, [dispatch]);

  /**
   * Authenticates user upon login form submission & persists to Redux store.
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

    // Dispatch Redux action to store user
    dispatch(setUser(userWithoutToken));

    // Refresh live subscription plan from server
    setTimeout(() => {
      dispatch(refreshSubscriptionThunk());
    }, 500);

    const targetRoute =
      userWithoutToken.role?.toLowerCase() === "admin"
        ? "/admin/dashboard"
        : "/snippet-feed";
    navigate(targetRoute);
  };

  /**
   * Signs out the authenticated user and clears Redux + localStorage credentials.
   */
  const logout = () => {
    dispatch(logoutAction());
    navigate("/");
  };

  const updateUser = (userData: User) => {
    dispatch(updateUserAction(userData));
  };

  const setPlan = (newPlan: "FREE" | "PRO") => {
    dispatch(setPlanAction(newPlan));
  };

  const togglePlan = () => {
    dispatch(togglePlanAction());
  };

  const refreshSubscription = useCallback(async () => {
    await dispatch(refreshSubscriptionThunk());
  }, [dispatch]);

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
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

/**
 * Custom hook to consume Redux-backed AuthContext in functional components.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};