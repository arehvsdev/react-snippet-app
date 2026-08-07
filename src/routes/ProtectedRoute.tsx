/**
 * Protected Route Wrapper Component
 * Restricts route access to authenticated users only; redirects unauthenticated visitors to login.
 */
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../layouts/AuthContext";

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Redirect unauthenticated visitors to login page
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;