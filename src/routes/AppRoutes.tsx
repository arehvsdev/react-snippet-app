import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Profile from "../pages/Profile";
import SnippetFeed from "../pages/SnippetFeed";
import CreateSnippet from "../pages/CreateSnippet";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/snippet-feed" element={<SnippetFeed />} />
      <Route path="/create-snippet" element={<CreateSnippet />} />
      <Route path="*" element={<Login />} />
    </Routes>
  );
};

export default AppRoutes;
