import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Profile from "../pages/Profile";
import SnippetFeed from "../pages/SnippetFeed";
import { CreateSnippet } from "../pages/CreateSnippet";
import ProtectedRoute from "./ProtectedRoute";


const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Login />} />
      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<Profile />} />
        <Route path="/snippet-feed" element={<SnippetFeed />} />
        <Route path="/create-snippet" element={<CreateSnippet />} />
      </Route>
      <Route path="*" element={<Login />} />
    </Routes>
  );
};

export default AppRoutes;
