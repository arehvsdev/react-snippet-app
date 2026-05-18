import { useState, useEffect } from "react";

interface User {
  name: string;
  email: string;
  role: string;
}


const Profile = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    // Auth logic is now handled by AuthLayout
  }, []);

  // If the user data is still loading, we can show a loading message.
  if (!user) {
    return null; // AuthLayout will handle loading/redirect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center w-full max-w-sm mx-auto">
        <h1 className="text-3xl font-bold mb-4">Profile</h1>
        <div className="text-left space-y-2">
          <p><span className="font-semibold">Name:</span> {user.name}</p>
          <p><span className="font-semibold">Email:</span> {user.email}</p>
          <p><span className="font-semibold">Role:</span> {user.role}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
