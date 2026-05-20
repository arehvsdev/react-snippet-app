import { useEffect, useState } from "react";
import AuthLayout from "../layouts/AuthLayout";
import { useAuth } from "../../src/layouts/AuthContext";
import { getUserProfile } from "../services/user/user";
import toast from "react-hot-toast";

// Mock data for snippets - in a real app, you would fetch this
const mockSnippets = [
  { id: 1, title: "React useState Hook", language: "javascript" },
  { id: 2, title: "CSS Flexbox Centering", language: "css" },
  { id: 3, title: "Python Dictionary Loop", language: "python" },
];

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getUserProfile(user.uid);
        setProfileData(data);
      } catch (error: any) {
        toast.error("Failed to fetch profile: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // If the user data is still loading, we can show a loading message.
  if (!user || loading) {
    return (
      <AuthLayout>
        <div className="flex justify-center items-center py-20 text-white">
          <p className="text-lg">Loading profile...</p>
        </div>
      </AuthLayout>
    );
  }

  const profile = profileData || user;

  return (
    <AuthLayout>
      <div className="bg-[#2d2f31] border border-white/10 p-8 rounded-lg shadow-lg w-full max-w-2xl mx-auto text-white">
        <h1 className="text-3xl font-bold mb-6 text-center">Profile</h1>
        <div className="text-left space-y-3 mb-8 border-b border-white/10 pb-6">
          <p><span className="font-semibold text-gray-400 w-32 inline-block">Full Name:</span> {profile.fullName}</p>
          <p><span className="font-semibold text-gray-400 w-32 inline-block">Email:</span> {profile.email}</p>
          <p><span className="font-semibold text-gray-400 w-32 inline-block">Phone Number:</span> {profile.phoneNumber || "N/A"}</p>
          <p><span className="font-semibold text-gray-400 w-32 inline-block">Role:</span> <span className="capitalize">{profile.role}</span></p>
          <p><span className="font-semibold text-gray-400 w-32 inline-block">Member Since:</span> {new Date(profile.createdAt).toLocaleDateString()}</p>
        </div>

        <div className="mt-6">
          <h2 className="text-2xl font-bold mb-4">My Snippets</h2>
          {mockSnippets.length > 0 ? (
            <ul className="space-y-3">
              {mockSnippets.map((snippet) => (
                <li key={snippet.id} className="p-4 border border-white/10 rounded-md hover:bg-white/5 bg-[#1b1c1e] flex justify-between items-center transition-colors">
                  <span>{snippet.title}</span>
                  <span className="text-sm bg-white/10 text-gray-300 px-2 py-1 rounded">{snippet.language}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">You haven't created any snippets yet.</p>
          )}
        </div>
      </div>
    </AuthLayout>
  );
};

export default Profile;
