/**
 * Centralized Application Routes Component
 * Defines public, user-protected, PRO-protected, and admin-protected route configurations with lazy loading.
 */
import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { ProRoute } from "./ProRoute";
import { AdminRoute } from "./AdminRoute";
import { NormalUserRoute } from "./NormalUserRoute";
import { Loader2 } from "lucide-react";

// Lazy-load named exports to optimize JS bundle packaging
const Landing = lazy(() => import("../pages/Landing").then(m => ({ default: m.Landing })));
const SnippetFeed = lazy(() => import("../pages/SnippetFeed").then(m => ({ default: m.SnippetFeed })));
const Profile = lazy(() => import("../pages/Profile").then(m => ({ default: m.Profile })));
const CreateSnippet = lazy(() => import("../pages/CreateSnippet").then(m => ({ default: m.CreateSnippet })));
const Subscription = lazy(() => import("../pages/Subscription").then(m => ({ default: m.Subscription })));
const Pricing = lazy(() => import("../pages/Pricing").then(m => ({ default: m.Pricing })));
const Bookmarks = lazy(() => import("../pages/Bookmarks").then(m => ({ default: m.Bookmarks })));
const Notifications = lazy(() => import("../pages/Notifications").then(m => ({ default: m.Notifications })));
const AdminDashboard = lazy(() => import("../components/admin/AdminDashboard").then(m => ({ default: m.AdminDashboard })));
const ManageLanguages = lazy(() => import("../components/admin/ManageLanguages").then(m => ({ default: m.ManageLanguages })));
const ManageTags = lazy(() => import("../components/admin/ManageTags").then(m => ({ default: m.ManageTags })));
const ManageCategories = lazy(() => import("../components/admin/ManageCategories").then(m => ({ default: m.ManageCategories })));
const ManageUsers = lazy(() => import("../components/admin/ManageUsers").then(m => ({ default: m.ManageUsers })));

// 404 Not Found fallback component
const NotFound = () => (
  <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
    <h1 className="text-3xl font-bold">404 - Page Not Found</h1>
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-400 text-sm font-medium">Loading layout content...</p>
          </div>
        </div>
      }
    >
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/register" element={<Navigate to="/" replace />} />
        <Route path="/pricing" element={<Pricing />} />

        {/* Protected Routes for Authenticated Users */}
        <Route element={<ProtectedRoute />}>
          <Route path="/snippet-feed" element={<SnippetFeed />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/create" element={<CreateSnippet />} />
          <Route path="/edit/:id" element={<CreateSnippet />} />
          <Route path="/notifications" element={<Notifications />} />
          
          <Route element={<NormalUserRoute />}>
            <Route path="/subscription" element={<Subscription />} />
          </Route>
          
          <Route path="/bookmarks" element={<Bookmarks />} />

          {/* PRO Subscription Protected Routes */}
          <Route element={<ProRoute />}>
            <Route path="/pro-snippets" element={<SnippetFeed />} />
          </Route>

          {/* Admin-only routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/languages" element={<ManageLanguages />} />
            <Route path="/admin/tags" element={<ManageTags />} />
            <Route path="/admin/categories" element={<ManageCategories />} />
            <Route path="/admin/users" element={<ManageUsers />} />
          </Route>

          {/* Redirects for alternative paths */}
          <Route path="/create-snippet" element={<Navigate to="/create" replace />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
