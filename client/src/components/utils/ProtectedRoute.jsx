import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * ProtectedRoute component that restricts access to authenticated users.
 * It checks if a valid JWT token exists and is not expired. If the token is missing
 * or invalid, the user is redirected to the login page.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {React.ReactNode} props.children - The child components to be rendered if authentication is successful.
 * @returns {JSX.Element} The protected content if authentication succeeds, otherwise redirects to login.
 */
const ProtectedRoute = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            console.log("No token found, redirecting to login");
            navigate("/login", { state: { from: location.pathname } });
            return;
        }

        try {
            const decodedToken = JSON.parse(atob(token.split(".")[1])); // Decode JWT

            const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds
            if (decodedToken.exp && decodedToken.exp < currentTime) {
                console.log("Token expired, redirecting to login");
                localStorage.removeItem("token"); // Remove expired token
                navigate("/login", { state: { from: location.pathname } });
                return;
            }

        } catch (error) {
            console.error("Error parsing token", error);
            localStorage.removeItem("token"); // Remove invalid token
            navigate("/login", { state: { from: location.pathname } });
            return;
        } finally {
            setLoading(false);
        }
    }, [navigate, location.pathname, token]);

    if (loading) {
        return <div>Loading...</div>; // You can replace this with a loading spinner
    }

    return children;
};

export default ProtectedRoute;
