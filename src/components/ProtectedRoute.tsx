import { type ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

interface ProtectedRouteProps {
    children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const navigate = useNavigate();
    const [isAuth, setIsAuth] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setIsAuth(true);
        } else {
            toast.error("You must be logged in to view this page.");
            navigate("/login");
        }
    }, [navigate]);

    if (!isAuth) {
        return null; // Or a loading spinner
    }

    return <>{children}</>;
};

export default ProtectedRoute;
