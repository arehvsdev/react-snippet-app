import { Outlet } from "react-router-dom";
import { useAuth } from "../layouts/AuthContext";
import { Layout } from "../pages/Layout";
import { ShieldAlert } from "lucide-react";

const NotAuthorized = () => (
    <Layout>
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-gray-900">
            <div className="text-center">
                <ShieldAlert className="mx-auto h-16 w-16 text-red-500" />
                <h1 className="mt-4 text-3xl font-bold text-white">Access Denied</h1>
                <p className="mt-2 text-lg text-gray-300">
                    You do not have the necessary permissions to view this page.
                </p>
            </div>
        </div>
    </Layout>
);

export const AdminRoute = () => {
    const { user } = useAuth(); // isAuthenticated is already checked by the parent ProtectedRoute

    // If the user is authenticated but is not an admin, show a "Not Authorized" page.
    if (user?.role?.toLowerCase() !== "admin") {
        return <NotAuthorized />;
    }

    // If the user is an admin, render the nested admin routes.
    return <Outlet />;
};
