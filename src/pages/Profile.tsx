import AuthLayout from "../layouts/AuthLayout";
import { useAuth } from "../../src/layouts/AuthContext";

// Mock data for snippets - in a real app, you would fetch this
const mockSnippets = [
  { id: 1, title: "React useState Hook", language: "javascript" },
  { id: 2, title: "CSS Flexbox Centering", language: "css" },
  { id: 3, title: "Python Dictionary Loop", language: "python" },
];

const Profile = () => {
  const { user } = useAuth();

  // If the user data is still loading, we can show a loading message.
  if (!user) {
    // This case is now handled by ProtectedRoute, but it's good practice
    // to have a fallback.
    return (
      <AuthLayout>
        <p>Loading profile...</p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Profile</h1>
        <div className="text-left space-y-3 mb-8 border-b pb-6">
          <p><span className="font-semibold w-32 inline-block">Full Name:</span> {user.fullName}</p>
          <p><span className="font-semibold w-32 inline-block">Email:</span> {user.email}</p>
          <p><span className="font-semibold w-32 inline-block">Phone Number:</span> {user.phoneNumber || "N/A"}</p>
          <p><span className="font-semibold w-32 inline-block">Role:</span> <span className="capitalize">{user.role}</span></p>
          <p><span className="font-semibold w-32 inline-block">Member Since:</span> {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>

        <div className="mt-6">
          <h2 className="text-2xl font-bold mb-4">My Snippets</h2>
          {mockSnippets.length > 0 ? (
            <ul className="space-y-3">
              {mockSnippets.map((snippet) => (
                <li key={snippet.id} className="p-4 border rounded-md hover:bg-gray-50 flex justify-between items-center">
                  <span>{snippet.title}</span>
                  <span className="text-sm bg-gray-200 text-gray-700 px-2 py-1 rounded">{snippet.language}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>You haven't created any snippets yet.</p>
          )}
        </div>
      </div>
    </AuthLayout>
  );
};

export default Profile;
