import { Routes, Route, Navigate } from "react-router-dom";
import { CreateSnippet } from "../pages/CreateSnippet";
import ProtectedRoute from "./ProtectedRoute";
import { AdminRoute } from "./AdminRoute";
import { Landing } from "../pages/Landing";
import { Subscription } from "../pages/Subscription";
import { Bookmarks } from "../pages/Bookmarks";
import { SnippetFeed } from "../pages/SnippetFeed";
import { Profile } from "../pages/Profile";
import { AdminDashboard } from "../components/admin/AdminDashboard";
import { ManageLanguages } from "../components/admin/ManageLanguages";
import { ManageTags } from "../components/admin/ManageTags";
import { ManageCategories } from "../components/admin/ManageCategories";

// A simple 404 Not Found page. For a real app, you might want a more styled page
// that uses the main Layout for authenticated users to feel more integrated.
const NotFound = () => (
  <div className="flex h-screen items-center justify-center bg-gray-900">
    <h1 className="text-3xl text-white">404 - Page Not Found</h1>
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/register" element={<Navigate to="/" replace />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/snippet-feed" element={<SnippetFeed />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/create" element={<CreateSnippet />} />
        <Route path="/edit/:id" element={<CreateSnippet />} />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/bookmarks" element={<Bookmarks />} />

        {/* Admin-only routes are nested here. ProtectedRoute ensures authentication, AdminRoute ensures authorization. */}
        <Route element={<AdminRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/languages" element={<ManageLanguages />} />
          <Route path="/admin/tags" element={<ManageTags />} />
          <Route path="/admin/categories" element={<ManageCategories />} />
        </Route>

        {/* Redirects for old/alternative paths for consistency */}
        <Route path="/create-snippet" element={<Navigate to="/create" replace />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
