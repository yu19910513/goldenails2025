import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // Add an error state to capture potential issues
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            console.log("No token found, redirecting to login");
            navigate("/login", { state: { from: location.pathname } });
            return;
        }

        try {
            const decodedToken = JSON.parse(atob(token.split(".")[1])); // Decode JWT
            if (!decodedToken?.data?.admin_privilege) {
                console.log("User does not have admin privilege, redirecting to login");
                navigate("/login", { state: { from: location.pathname } });
                return;
            }
        } catch (error) {
            console.error("Error parsing token or verifying privileges", error);
            localStorage.removeItem("token"); // Remove invalid token
            navigate("/login", { state: { from: location.pathname } });
            return;
        } finally {
            setLoading(false);
        }
    }, [navigate, location.pathname, token]);

    if (loading) {
        return <div>Loading...</div>; // You can replace this with a loading spinner or a placeholder
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return token ? children : null;
};

export default ProtectedRoute;
