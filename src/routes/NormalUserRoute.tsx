import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../layouts/AuthContext";

export const NormalUserRoute = () => {
  const { user } = useAuth(); // isAuthenticated is already checked by ProtectedRoute

  // If the user is an admin, redirect them away from normal-user-only routes (like subscription)
  if (user?.role?.toLowerCase() === "admin") {
    return <Navigate to="/profile" replace />;
  }

  // If the user is a normal user (non-admin), allow access
  return <Outlet />;
};
