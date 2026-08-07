import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../layouts/AuthContext";

interface ProRouteProps {
  children?: React.ReactNode;
}

/**
 * Reusable PRO Route Protection Wrapper Component (<ProRoute>).
 * Enforces PRO plan subscription access control:
 * 1. Redirects unauthenticated users to /login.
 * 2. Redirects FREE plan users to /pricing with a requirement toast.
 * 3. Renders children or Outlet for active PRO plan subscribers.
 */
export const ProRoute: React.FC<ProRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const isPro = user?.plan === "PRO";

  // Trigger feedback toast when a logged-in FREE user attempts access
  useEffect(() => {
    if (isAuthenticated && !isPro) {
      toast.error("This feature requires a PRO subscription.");
    }
  }, [isAuthenticated, isPro]);

  // If not logged in -> redirect to /login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If logged in AND plan === "FREE" -> redirect to /pricing
  if (!isPro) {
    return <Navigate to="/pricing" replace />;
  }

  // If plan === "PRO" -> render children or Outlet
  return children ? <>{children}</> : <Outlet />;
};

export default ProRoute;
